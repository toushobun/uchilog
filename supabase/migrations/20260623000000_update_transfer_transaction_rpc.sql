-- 支持转账交易编辑。
-- 更新过程原子性：先回滚旧余额影响，再删除旧明细，再写入新明细，再应用新余额。
-- 多账户行锁统一按 account id 升序获取，避免 A→B 与 B→A 并发时 deadlock。

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
    v_record public.transaction_record;
    v_item public.transaction_item;
    v_old_from_account_id uuid;
    v_old_to_account_id uuid;
    v_old_amount numeric(14,2);
    v_item_count integer := 0;
    v_transfer_item_count integer := 0;
    v_category_null_item_count integer := 0;
    v_positive_item_count integer := 0;
    v_negative_item_count integer := 0;
    v_positive_amount_count integer := 0;
    v_amount_delta_match_count integer := 0;
    v_distinct_amount_count integer := 0;
    v_balance_delta_total numeric(14,2) := 0;
    v_all_account_ids uuid[];
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

    -- 取得并锁定交易主记录
    select *
    into v_record
    from public.transaction_record tr
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active'
      and tr.type = 'transfer'
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    -- 校验旧 transfer item 结构
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

    -- 记录旧 from/to account id 和金额（用于回滚余额）
    select account_id, amount
    into v_old_from_account_id, v_old_amount
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id
      and ti.balance_delta < 0;

    select account_id
    into v_old_to_account_id
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id
      and ti.balance_delta > 0;

    -- 按 account id 升序锁定所有涉及的账户（旧+新），避免 deadlock
    v_all_account_ids := array(
        select distinct unnest(array[
            v_old_from_account_id,
            v_old_to_account_id,
            p_from_account_id,
            p_to_account_id
        ])
        order by 1
    );

    for v_locked_account in
        select *
        from public.account a
        where a.id = any(v_all_account_ids)
          and a.ledger_id = p_ledger_id
        order by a.id
        for update
    loop
        if v_locked_account.id = p_from_account_id then
            v_from_account := v_locked_account;
        end if;
        if v_locked_account.id = p_to_account_id then
            v_to_account := v_locked_account;
        end if;
    end loop;

    -- 校验新账户合法性
    if v_from_account.id is null or v_from_account.is_archived then
        raise exception 'from_account_invalid' using errcode = '22023';
    end if;

    if v_to_account.id is null or v_to_account.is_archived then
        raise exception 'to_account_invalid' using errcode = '22023';
    end if;

    if v_from_account.currency <> v_to_account.currency then
        raise exception 'transfer_currency_invalid' using errcode = '22023';
    end if;

    -- 回滚旧 transfer 对账户余额的影响
    perform public.apply_account_balance_delta(
        p_ledger_id,
        v_old_from_account_id,
        v_old_amount,
        v_user_id
    );

    perform public.apply_account_balance_delta(
        p_ledger_id,
        v_old_to_account_id,
        -v_old_amount,
        v_user_id
    );

    -- 删除旧 transfer item
    delete from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id;

    -- 写入新 transfer item
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
        p_transaction_record_id,
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
        p_transaction_record_id,
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

    -- 应用新 transfer 对账户余额的影响
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

    -- 更新 transaction_record 主记录
    update public.transaction_record tr
    set
        transaction_at = p_transaction_at,
        note = p_note,
        updated_by = v_user_id,
        updated_at = now()
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id;

    return p_transaction_record_id;
end;
$$;

grant execute on function public.update_transfer_transaction(
    uuid, uuid, timestamptz, numeric, uuid, uuid, text
) to authenticated;
