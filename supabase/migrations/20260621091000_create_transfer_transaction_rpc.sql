-- 支持账户间转账保存。
-- 一次迁移内完成 transfer 类型约束、商家可空规则、保存 RPC、撤销 RPC 和编辑 RPC。
-- 任一校验或写入失败时，Postgres 会回滚整个函数调用。

-- 转账记录没有商家概念，将 merchant_id 的 NOT NULL 约束
-- 替换为只对 expense / income 生效的 CHECK 约束。
alter table public.transaction_record
    alter column merchant_id drop not null;

alter table public.transaction_record
    add constraint transaction_record_merchant_required_for_non_transfer
    check (type = 'transfer' or merchant_id is not null);

-- 明确保证交易主表和明细表都允许 transfer 类型。
-- 既有环境如果因历史迁移顺序保留了旧约束，也通过本迁移统一重建。
alter table public.transaction_record
    drop constraint if exists transaction_record_type_check;

alter table public.transaction_record
    add constraint transaction_record_type_check
    check (type in ('expense', 'income', 'transfer', 'refund', 'reimbursement'));

alter table public.transaction_item
    drop constraint if exists transaction_item_stat_type_check;

alter table public.transaction_item
    add constraint transaction_item_stat_type_check
    check (stat_type in ('expense', 'income', 'expense_offset', 'transfer'));

create or replace function public.create_transfer_transaction(
    p_ledger_id uuid,
    p_transaction_at timestamptz,
    p_amount numeric,
    p_from_account_id uuid,
    p_to_account_id uuid,
    p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_transaction_record_id uuid;
    v_user_id uuid := auth.uid();
    v_from_account public.account;
    v_to_account public.account;
    v_locked_account public.account;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    if p_transaction_at is null then
        raise exception 'transaction_at_invalid' using errcode = '22023';
    end if;

    if p_amount is null or p_amount <= 0 or p_amount <> round(p_amount, 2) then
        raise exception 'amount_invalid' using errcode = '22023';
    end if;

    if p_from_account_id = p_to_account_id then
        raise exception 'transfer_account_invalid' using errcode = '22023';
    end if;

    -- A→B 与 B→A 并发转账时，也统一按 account id 升序锁定，避免反向取得 row lock。
    for v_locked_account in
        select *
        from public.account a
        where a.id in (p_from_account_id, p_to_account_id)
          and a.ledger_id = p_ledger_id
          and a.is_archived = false
        order by a.id
        for update
    loop
        if v_locked_account.id = p_from_account_id then
            v_from_account := v_locked_account;
        elsif v_locked_account.id = p_to_account_id then
            v_to_account := v_locked_account;
        end if;
    end loop;

    if v_from_account.id is null then
        raise exception 'from_account_invalid' using errcode = '22023';
    end if;

    if v_to_account.id is null then
        raise exception 'to_account_invalid' using errcode = '22023';
    end if;

    if v_from_account.currency <> v_to_account.currency then
        raise exception 'transfer_currency_invalid' using errcode = '22023';
    end if;

    insert into public.transaction_record (
        ledger_id,
        type,
        status,
        transaction_at,
        merchant_id,
        title,
        note,
        created_by,
        updated_by
    ) values (
        p_ledger_id,
        'transfer',
        'active',
        p_transaction_at,
        null,
        null,
        p_note,
        v_user_id,
        v_user_id
    ) returning id into v_transaction_record_id;

    insert into public.transaction_item (
        ledger_id,
        transaction_record_id,
        account_id,
        category_id,
        stat_type,
        amount,
        discount_amount,
        balance_delta,
        note,
        sort_order,
        created_by,
        updated_by
    ) values
    (
        p_ledger_id,
        v_transaction_record_id,
        p_from_account_id,
        null,
        'transfer',
        p_amount,
        0,
        -p_amount,
        null,
        0,
        v_user_id,
        v_user_id
    ),
    (
        p_ledger_id,
        v_transaction_record_id,
        p_to_account_id,
        null,
        'transfer',
        p_amount,
        0,
        p_amount,
        null,
        1,
        v_user_id,
        v_user_id
    );

    perform public.apply_account_balance_delta(
        p_ledger_id,
        p_from_account_id,
        -p_amount,
        v_user_id
    );

    perform public.apply_account_balance_delta(
        p_ledger_id,
        p_to_account_id,
        p_amount,
        v_user_id
    );

    return v_transaction_record_id;
end;
$$;

grant execute on function public.create_transfer_transaction(
    uuid, timestamptz, numeric, uuid, uuid, text
) to authenticated;

-- 强化转账撤销和编辑前的旧明细一致性校验。
-- transfer 记录必须只有两条明细：一条转出、一条转入，且 amount 与 balance_delta 保持一致。
create or replace function public.void_transaction(
    p_ledger_id uuid,
    p_transaction_record_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_record public.transaction_record;
    v_item public.transaction_item;
    v_item_count integer := 0;
    v_transfer_item_count integer := 0;
    v_category_null_item_count integer := 0;
    v_positive_item_count integer := 0;
    v_negative_item_count integer := 0;
    v_positive_amount_count integer := 0;
    v_amount_delta_match_count integer := 0;
    v_distinct_amount_count integer := 0;
    v_balance_delta_total numeric(14,2) := 0;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    select *
    into v_record
    from public.transaction_record tr
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active'
      and tr.type in ('expense', 'income', 'transfer')
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    perform 1
    from public.account a
    where a.ledger_id = p_ledger_id
      and a.id in (
          select distinct ti.account_id
          from public.transaction_item ti
          where ti.transaction_record_id = p_transaction_record_id
            and ti.ledger_id = p_ledger_id
            and ti.stat_type in ('expense', 'income', 'transfer')
      )
    order by a.id
    for update;

    if v_record.type = 'transfer' then
        perform 1
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id
        order by ti.account_id, ti.id
        for update;

        select
            count(*)::integer,
            count(*) filter (where ti.stat_type = 'transfer')::integer,
            count(*) filter (where ti.category_id is null)::integer,
            count(*) filter (where ti.balance_delta > 0)::integer,
            count(*) filter (where ti.balance_delta < 0)::integer,
            count(*) filter (where ti.amount > 0)::integer,
            count(*) filter (where ti.amount = abs(ti.balance_delta))::integer,
            count(distinct ti.amount)::integer,
            coalesce(sum(ti.balance_delta), 0)
        into
            v_item_count,
            v_transfer_item_count,
            v_category_null_item_count,
            v_positive_item_count,
            v_negative_item_count,
            v_positive_amount_count,
            v_amount_delta_match_count,
            v_distinct_amount_count,
            v_balance_delta_total
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id;

        if v_item_count <> 2
            or v_transfer_item_count <> 2
            or v_category_null_item_count <> 2
            or v_positive_item_count <> 1
            or v_negative_item_count <> 1
            or v_positive_amount_count <> 2
            or v_amount_delta_match_count <> 2
            or v_distinct_amount_count <> 1
            or v_balance_delta_total <> 0 then
            raise exception 'transfer_items_invalid' using errcode = '22023';
        end if;
    end if;

    v_item_count := 0;

    for v_item in
        select *
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id
          and ti.stat_type in ('expense', 'income', 'transfer')
        order by ti.sort_order, ti.id
        for update
    loop
        v_item_count := v_item_count + 1;

        perform public.apply_account_balance_delta(
            p_ledger_id,
            v_item.account_id,
            -v_item.balance_delta,
            v_user_id
        );
    end loop;

    if v_item_count = 0 then
        raise exception 'transaction_item_invalid' using errcode = '22023';
    end if;

    update public.transaction_record tr
    set
        status = 'deleted',
        deleted_by = v_user_id,
        deleted_at = now(),
        updated_by = v_user_id,
        updated_at = now()
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active';

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    return p_transaction_record_id;
end;
$$;

grant execute on function public.void_transaction(uuid, uuid) to authenticated;

create or replace function public.update_transfer_transaction(
    p_ledger_id uuid,
    p_transaction_record_id uuid,
    p_transaction_at timestamptz,
    p_amount numeric,
    p_from_account_id uuid,
    p_to_account_id uuid,
    p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_existing_item public.transaction_item;
    v_from_account public.account;
    v_to_account public.account;
    v_locked_account public.account;
    v_existing_item_count integer := 0;
    v_transfer_item_count integer := 0;
    v_category_null_item_count integer := 0;
    v_positive_item_count integer := 0;
    v_negative_item_count integer := 0;
    v_positive_amount_count integer := 0;
    v_amount_delta_match_count integer := 0;
    v_distinct_amount_count integer := 0;
    v_balance_delta_total numeric(14,2) := 0;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    if p_transaction_at is null then
        raise exception 'transaction_at_invalid' using errcode = '22023';
    end if;

    if p_amount is null or p_amount <= 0 or p_amount <> round(p_amount, 2) then
        raise exception 'amount_invalid' using errcode = '22023';
    end if;

    if p_from_account_id = p_to_account_id then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    perform 1
    from public.transaction_record tr
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active'
      and tr.type = 'transfer'
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    for v_locked_account in
        select *
        from public.account a
        where a.ledger_id = p_ledger_id
          and a.id in (
              select distinct ti.account_id
              from public.transaction_item ti
              where ti.transaction_record_id = p_transaction_record_id
                and ti.ledger_id = p_ledger_id
              union
              select p_from_account_id
              union
              select p_to_account_id
          )
        order by a.id
        for update
    loop
        if v_locked_account.id = p_from_account_id then
            v_from_account := v_locked_account;
        elsif v_locked_account.id = p_to_account_id then
            v_to_account := v_locked_account;
        end if;
    end loop;

    if v_from_account.id is null or v_from_account.is_archived then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    if v_to_account.id is null or v_to_account.is_archived then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    if v_from_account.currency <> v_to_account.currency then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    perform 1
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id
    order by ti.account_id, ti.id
    for update;

    select
        count(*)::integer,
        count(*) filter (where ti.stat_type = 'transfer')::integer,
        count(*) filter (where ti.category_id is null)::integer,
        count(*) filter (where ti.balance_delta > 0)::integer,
        count(*) filter (where ti.balance_delta < 0)::integer,
        count(*) filter (where ti.amount > 0)::integer,
        count(*) filter (where ti.amount = abs(ti.balance_delta))::integer,
        count(distinct ti.amount)::integer,
        coalesce(sum(ti.balance_delta), 0)
    into
        v_existing_item_count,
        v_transfer_item_count,
        v_category_null_item_count,
        v_positive_item_count,
        v_negative_item_count,
        v_positive_amount_count,
        v_amount_delta_match_count,
        v_distinct_amount_count,
        v_balance_delta_total
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id;

    if v_existing_item_count <> 2
        or v_transfer_item_count <> 2
        or v_category_null_item_count <> 2
        or v_positive_item_count <> 1
        or v_negative_item_count <> 1
        or v_positive_amount_count <> 2
        or v_amount_delta_match_count <> 2
        or v_distinct_amount_count <> 1
        or v_balance_delta_total <> 0 then
        raise exception 'transfer_items_invalid' using errcode = '22023';
    end if;

    for v_existing_item in
        select *
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id
          and ti.stat_type = 'transfer'
        order by ti.account_id, ti.id
    loop
        perform public.apply_account_balance_delta(
            p_ledger_id,
            v_existing_item.account_id,
            -v_existing_item.balance_delta,
            v_user_id
        );
    end loop;

    delete from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id
      and ti.stat_type = 'transfer';

    update public.transaction_record tr
    set
        transaction_at = p_transaction_at,
        note = p_note,
        updated_by = v_user_id,
        updated_at = now()
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active';

    insert into public.transaction_item (
        ledger_id, transaction_record_id, account_id, category_id, stat_type,
        amount, discount_amount, balance_delta, note, sort_order,
        created_by, updated_by
    ) values (
        p_ledger_id, p_transaction_record_id, p_from_account_id, null, 'transfer',
        p_amount, 0, -p_amount, null, 0,
        v_user_id, v_user_id
    );

    perform public.apply_account_balance_delta(
        p_ledger_id,
        p_from_account_id,
        -p_amount,
        v_user_id
    );

    insert into public.transaction_item (
        ledger_id, transaction_record_id, account_id, category_id, stat_type,
        amount, discount_amount, balance_delta, note, sort_order,
        created_by, updated_by
    ) values (
        p_ledger_id, p_transaction_record_id, p_to_account_id, null, 'transfer',
        p_amount, 0, p_amount, null, 1,
        v_user_id, v_user_id
    );

    perform public.apply_account_balance_delta(
        p_ledger_id,
        p_to_account_id,
        p_amount,
        v_user_id
    );

    return p_transaction_record_id;
end;
$$;

grant execute on function public.update_transfer_transaction(
    uuid, uuid, timestamptz, numeric, uuid, uuid, text
) to authenticated;
