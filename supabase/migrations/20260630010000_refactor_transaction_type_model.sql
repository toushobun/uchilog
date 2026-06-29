-- Issue #334 第一阶段：收敛交易类型模型。
-- transaction_record.type 收敛为 normal / transfer。
-- 普通明细的统计方向以 category.type 为事实来源，transaction_item.stat_type 进入过渡废弃状态。

-- 旧的普通记录类型同步 trigger 会把主表 type 写回 expense / income，先停用。
drop trigger if exists transaction_item_sync_normal_record_type on public.transaction_item;
drop function if exists public.sync_normal_transaction_record_type_from_items_trigger();
drop function if exists public.sync_normal_transaction_record_type_from_items(uuid, uuid);

alter table public.transaction_record
    drop constraint if exists transaction_record_type_check;

update public.transaction_record
set type = case
    when type = 'transfer' then 'transfer'
    else 'normal'
end;

alter table public.transaction_record
    add constraint transaction_record_type_check
    check (type in ('normal', 'transfer'));

-- stat_type 暂不物理删除，先解除强约束，避免旧分支 / 旧数据依赖导致迁移风险。
-- 后续应用层全量清理完成后再 drop column。
drop index if exists public.transaction_item_stat_type_idx;

alter table public.transaction_item
    drop constraint if exists transaction_item_stat_type_check;

alter table public.transaction_item
    drop constraint if exists transaction_item_category_required_check;

update public.transaction_item ti
set stat_type = case
    when tr.type = 'transfer' or ti.category_id is null then 'transfer'
    when c.type in ('expense', 'income') then c.type
    else null
end
from public.transaction_record tr
left join public.category c
  on c.id = ti.category_id
 and c.ledger_id = ti.ledger_id
where tr.id = ti.transaction_record_id
  and tr.ledger_id = ti.ledger_id;

alter table public.transaction_item
    alter column stat_type drop not null;

-- 明细是否需要分类由主表 type 决定：normal 必须有分类，transfer 不使用分类。
create or replace function public.validate_transaction_item_category_shape()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_record_type text;
begin
    select tr.type
    into v_record_type
    from public.transaction_record tr
    where tr.id = new.transaction_record_id
      and tr.ledger_id = new.ledger_id;

    if v_record_type is null then
        raise exception 'transaction_record_invalid' using errcode = '23503';
    end if;

    if v_record_type = 'transfer' and new.category_id is not null then
        raise exception 'transaction_item_category_invalid' using errcode = '23514';
    end if;

    if v_record_type = 'normal' and new.category_id is null then
        raise exception 'transaction_item_category_required' using errcode = '23514';
    end if;

    return new;
end;
$$;

revoke all on function public.validate_transaction_item_category_shape() from public;
revoke all on function public.validate_transaction_item_category_shape() from anon;
revoke all on function public.validate_transaction_item_category_shape() from authenticated;

drop trigger if exists transaction_item_validate_category_shape on public.transaction_item;
create trigger transaction_item_validate_category_shape
before insert or update of ledger_id, transaction_record_id, category_id on public.transaction_item
for each row
execute function public.validate_transaction_item_category_shape();

-- 已被明细引用的分类不允许跨收入 / 支出方向修改，避免历史统计方向被改写。
create or replace function public.prevent_used_category_type_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if old.type is distinct from new.type
       and exists (
           select 1
           from public.transaction_item ti
           where ti.ledger_id = old.ledger_id
             and ti.category_id = old.id
           limit 1
       ) then
        raise exception 'category_type_locked' using errcode = '23514';
    end if;

    return new;
end;
$$;

revoke all on function public.prevent_used_category_type_change() from public;
revoke all on function public.prevent_used_category_type_change() from anon;
revoke all on function public.prevent_used_category_type_change() from authenticated;

drop trigger if exists category_prevent_used_type_change on public.category;
create trigger category_prevent_used_type_change
before update of type on public.category
for each row
execute function public.prevent_used_category_type_change();

-- ──────────────────────────────────────────
-- create_transaction
-- ──────────────────────────────────────────
create or replace function public.create_transaction(
    p_ledger_id uuid,
    p_type text,
    p_transaction_at timestamptz,
    p_items jsonb,
    p_account_id uuid,
    p_merchant_id uuid default null,
    p_note text default null,
    p_tag_names jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_transaction_record_id uuid;
    v_user_id uuid := auth.uid();
    v_item jsonb;
    v_item_amount numeric(14,2);
    v_item_category_id uuid;
    v_item_category_type text;
    v_balance_delta numeric(14,2);
    v_sort_order integer := 0;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    if p_type not in ('expense', 'income', 'normal') then
        raise exception 'transaction_type_invalid' using errcode = '22023';
    end if;

    if p_transaction_at is null then
        raise exception 'transaction_at_invalid' using errcode = '22023';
    end if;

    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
        raise exception 'items_invalid' using errcode = '22023';
    end if;

    if not exists (
        select 1 from public.account a
        where a.id = p_account_id
          and a.ledger_id = p_ledger_id
          and a.is_archived = false
    ) then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    if p_merchant_id is not null and not exists (
        select 1 from public.merchant m
        where m.id = p_merchant_id
          and m.ledger_id = p_ledger_id
          and m.is_archived = false
    ) then
        raise exception 'merchant_invalid' using errcode = '22023';
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
        'normal',
        'active',
        p_transaction_at,
        p_merchant_id,
        null,
        p_note,
        v_user_id,
        v_user_id
    ) returning id into v_transaction_record_id;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
        v_item_amount := (v_item ->> 'amount')::numeric(14,2);
        v_item_category_id := (v_item ->> 'categoryId')::uuid;

        if v_item_amount is null or v_item_amount < 0 or v_item_amount <> round(v_item_amount, 2) then
            raise exception 'amount_invalid' using errcode = '22023';
        end if;

        select c.type
        into v_item_category_type
        from public.category c
        where c.id = v_item_category_id
          and c.ledger_id = p_ledger_id
          and c.is_archived = false
          and c.parent_id is not null
          and c.type in ('expense', 'income');

        if v_item_category_type is null then
            raise exception 'category_invalid' using errcode = '22023';
        end if;

        v_balance_delta := case
            when v_item_category_type = 'expense' then -v_item_amount
            else v_item_amount
        end;

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
        ) values (
            p_ledger_id,
            v_transaction_record_id,
            p_account_id,
            v_item_category_id,
            v_item_category_type,
            v_item_amount,
            0,
            v_balance_delta,
            null,
            v_sort_order,
            v_user_id,
            v_user_id
        );

        perform public.apply_account_balance_delta(
            p_ledger_id,
            p_account_id,
            v_balance_delta,
            v_user_id
        );

        v_sort_order := v_sort_order + 1;
    end loop;

    perform public.sync_transaction_record_tags(
        p_ledger_id,
        v_transaction_record_id,
        p_tag_names,
        v_user_id
    );

    return v_transaction_record_id;
end;
$$;

grant execute on function public.create_transaction(
    uuid,
    text,
    timestamptz,
    jsonb,
    uuid,
    uuid,
    text,
    jsonb
) to authenticated;

-- ──────────────────────────────────────────
-- update_transaction
-- ──────────────────────────────────────────
create or replace function public.update_transaction(
    p_ledger_id uuid,
    p_transaction_record_id uuid,
    p_type text,
    p_transaction_at timestamptz,
    p_items jsonb,
    p_account_id uuid,
    p_merchant_id uuid,
    p_note text default null,
    p_tag_names jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_record public.transaction_record;
    v_existing_item public.transaction_item;
    v_item jsonb;
    v_item_amount numeric(14,2);
    v_item_category_id uuid;
    v_item_category_type text;
    v_balance_delta numeric(14,2);
    v_sort_order integer := 0;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    if p_type not in ('expense', 'income', 'normal') then
        raise exception 'transaction_type_invalid' using errcode = '22023';
    end if;

    if p_transaction_at is null then
        raise exception 'transaction_at_invalid' using errcode = '22023';
    end if;

    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
        raise exception 'items_invalid' using errcode = '22023';
    end if;

    if not exists (
        select 1 from public.account a
        where a.id = p_account_id
          and a.ledger_id = p_ledger_id
          and a.is_archived = false
    ) then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    if p_merchant_id is not null and not exists (
        select 1 from public.merchant m
        where m.id = p_merchant_id
          and m.ledger_id = p_ledger_id
          and m.is_archived = false
    ) then
        raise exception 'merchant_invalid' using errcode = '22023';
    end if;

    select *
    into v_record
    from public.transaction_record tr
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active'
      and tr.type = 'normal'
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    for v_existing_item in
        select *
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id
        order by ti.sort_order, ti.id
        for update
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
      and ti.ledger_id = p_ledger_id;

    update public.transaction_record tr
    set
        type = 'normal',
        transaction_at = p_transaction_at,
        merchant_id = p_merchant_id,
        note = p_note,
        updated_by = v_user_id,
        updated_at = now()
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active';

    for v_item in select * from jsonb_array_elements(p_items)
    loop
        v_item_amount := (v_item ->> 'amount')::numeric(14,2);
        v_item_category_id := (v_item ->> 'categoryId')::uuid;

        if v_item_amount is null or v_item_amount < 0 or v_item_amount <> round(v_item_amount, 2) then
            raise exception 'amount_invalid' using errcode = '22023';
        end if;

        select c.type
        into v_item_category_type
        from public.category c
        where c.id = v_item_category_id
          and c.ledger_id = p_ledger_id
          and c.is_archived = false
          and c.parent_id is not null
          and c.type in ('expense', 'income');

        if v_item_category_type is null then
            raise exception 'category_invalid' using errcode = '22023';
        end if;

        v_balance_delta := case
            when v_item_category_type = 'expense' then -v_item_amount
            else v_item_amount
        end;

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
        ) values (
            p_ledger_id,
            p_transaction_record_id,
            p_account_id,
            v_item_category_id,
            v_item_category_type,
            v_item_amount,
            0,
            v_balance_delta,
            null,
            v_sort_order,
            v_user_id,
            v_user_id
        );

        perform public.apply_account_balance_delta(
            p_ledger_id,
            p_account_id,
            v_balance_delta,
            v_user_id
        );

        v_sort_order := v_sort_order + 1;
    end loop;

    perform public.sync_transaction_record_tags(
        p_ledger_id,
        p_transaction_record_id,
        p_tag_names,
        v_user_id
    );

    return p_transaction_record_id;
end;
$$;

grant execute on function public.update_transaction(
    uuid,
    uuid,
    text,
    timestamptz,
    jsonb,
    uuid,
    uuid,
    text,
    jsonb
) to authenticated;

-- ──────────────────────────────────────────
-- convert_transaction_type
-- ──────────────────────────────────────────
create or replace function public.convert_transaction_type(
    p_ledger_id uuid,
    p_transaction_record_id uuid,
    p_target_type text,
    p_transaction_at timestamptz,
    p_note text default null,
    p_account_id uuid default null,
    p_merchant_id uuid default null,
    p_items jsonb default null,
    p_tag_names jsonb default '[]'::jsonb,
    p_from_account_id uuid default null,
    p_to_account_id uuid default null,
    p_transfer_amount numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_record public.transaction_record;
    v_old_item public.transaction_item;
    v_new_item jsonb;
    v_item_amount numeric(14,2);
    v_item_category_id uuid;
    v_item_category_type text;
    v_balance_delta numeric(14,2);
    v_sort_order integer := 0;
    v_target_record_type text;
    v_old_account_ids uuid[];
    v_new_account_ids uuid[];
    v_all_account_ids uuid[];
    v_locked_account_count integer := 0;
    v_from_account public.account;
    v_to_account public.account;
    v_normal_account public.account;
    v_locked_account public.account;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    if p_target_type not in ('expense', 'income', 'normal', 'transfer') then
        raise exception 'transaction_type_invalid' using errcode = '22023';
    end if;

    if p_transaction_at is null then
        raise exception 'transaction_at_invalid' using errcode = '22023';
    end if;

    v_target_record_type := case
        when p_target_type = 'transfer' then 'transfer'
        else 'normal'
    end;

    select *
    into v_record
    from public.transaction_record tr
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active'
      and tr.type in ('normal', 'transfer')
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    if v_record.type = v_target_record_type then
        raise exception 'transaction_type_not_changed' using errcode = '22023';
    end if;

    select array_agg(distinct ti.account_id order by ti.account_id)
    into v_old_account_ids
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id;

    if coalesce(array_length(v_old_account_ids, 1), 0) = 0 then
        raise exception 'transaction_items_invalid' using errcode = '22023';
    end if;

    if v_target_record_type = 'transfer' then
        if p_from_account_id is null or p_to_account_id is null then
            raise exception 'transfer_account_invalid' using errcode = '22023';
        end if;

        if p_from_account_id = p_to_account_id then
            raise exception 'transfer_account_invalid' using errcode = '22023';
        end if;

        if p_transfer_amount is null or p_transfer_amount <= 0 or p_transfer_amount <> round(p_transfer_amount, 2) then
            raise exception 'amount_invalid' using errcode = '22023';
        end if;

        v_new_account_ids := array[p_from_account_id, p_to_account_id];
    else
        if p_account_id is null then
            raise exception 'account_invalid' using errcode = '22023';
        end if;

        if p_merchant_id is null or not exists (
            select 1 from public.merchant m
            where m.id = p_merchant_id
              and m.ledger_id = p_ledger_id
              and m.is_archived = false
        ) then
            raise exception 'merchant_invalid' using errcode = '22023';
        end if;

        if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
            raise exception 'items_invalid' using errcode = '22023';
        end if;

        for v_new_item in select * from jsonb_array_elements(p_items)
        loop
            v_item_amount := (v_new_item ->> 'amount')::numeric(14,2);
            v_item_category_id := (v_new_item ->> 'categoryId')::uuid;

            if v_item_amount is null or v_item_amount < 0 or v_item_amount <> round(v_item_amount, 2) then
                raise exception 'amount_invalid' using errcode = '22023';
            end if;

            if not exists (
                select 1 from public.category c
                where c.id = v_item_category_id
                  and c.ledger_id = p_ledger_id
                  and c.is_archived = false
                  and c.parent_id is not null
                  and c.type in ('expense', 'income')
            ) then
                raise exception 'category_invalid' using errcode = '22023';
            end if;
        end loop;

        v_new_account_ids := array[p_account_id];
    end if;

    v_all_account_ids := array(
        select distinct account_id
        from unnest(v_old_account_ids || v_new_account_ids) as account_id
        where account_id is not null
        order by account_id
    );

    for v_locked_account in
        select *
        from public.account a
        where a.id = any(v_all_account_ids)
          and a.ledger_id = p_ledger_id
        order by a.id
        for update
    loop
        v_locked_account_count := v_locked_account_count + 1;

        if v_locked_account.id = p_from_account_id then
            v_from_account := v_locked_account;
        end if;
        if v_locked_account.id = p_to_account_id then
            v_to_account := v_locked_account;
        end if;
        if v_locked_account.id = p_account_id then
            v_normal_account := v_locked_account;
        end if;
    end loop;

    if v_locked_account_count <> coalesce(array_length(v_all_account_ids, 1), 0) then
        raise exception 'account_invalid' using errcode = '22023';
    end if;

    if v_target_record_type = 'transfer' then
        if v_from_account.id is null or v_from_account.is_archived then
            raise exception 'from_account_invalid' using errcode = '22023';
        end if;

        if v_to_account.id is null or v_to_account.is_archived then
            raise exception 'to_account_invalid' using errcode = '22023';
        end if;

        if v_from_account.currency <> v_to_account.currency then
            raise exception 'transfer_currency_invalid' using errcode = '22023';
        end if;
    else
        if v_normal_account.id is null or v_normal_account.is_archived then
            raise exception 'account_invalid' using errcode = '22023';
        end if;
    end if;

    for v_old_item in
        select *
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id
        order by ti.sort_order, ti.id
    loop
        perform public.apply_account_balance_delta(
            p_ledger_id,
            v_old_item.account_id,
            -v_old_item.balance_delta,
            v_user_id
        );
    end loop;

    delete from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id;

    delete from public.transaction_record_tag trt
    where trt.transaction_record_id = p_transaction_record_id
      and trt.ledger_id = p_ledger_id;

    if v_target_record_type = 'transfer' then
        update public.transaction_record tr
        set
            type = 'transfer',
            merchant_id = null,
            transaction_at = p_transaction_at,
            note = p_note,
            updated_by = v_user_id,
            updated_at = now()
        where tr.id = p_transaction_record_id
          and tr.ledger_id = p_ledger_id;

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
            p_transfer_amount,
            0,
            -p_transfer_amount,
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
            p_transfer_amount,
            0,
            p_transfer_amount,
            null,
            1,
            v_user_id,
            v_user_id
        );

        perform public.apply_account_balance_delta(p_ledger_id, p_from_account_id, -p_transfer_amount, v_user_id);
        perform public.apply_account_balance_delta(p_ledger_id, p_to_account_id, p_transfer_amount, v_user_id);
    else
        update public.transaction_record tr
        set
            type = 'normal',
            merchant_id = p_merchant_id,
            transaction_at = p_transaction_at,
            note = p_note,
            updated_by = v_user_id,
            updated_at = now()
        where tr.id = p_transaction_record_id
          and tr.ledger_id = p_ledger_id;

        v_sort_order := 0;
        for v_new_item in select * from jsonb_array_elements(p_items)
        loop
            v_item_amount := (v_new_item ->> 'amount')::numeric(14,2);
            v_item_category_id := (v_new_item ->> 'categoryId')::uuid;

            select c.type
            into v_item_category_type
            from public.category c
            where c.id = v_item_category_id
              and c.ledger_id = p_ledger_id
              and c.is_archived = false
              and c.parent_id is not null
              and c.type in ('expense', 'income');

            if v_item_category_type is null then
                raise exception 'category_invalid' using errcode = '22023';
            end if;

            v_balance_delta := case
                when v_item_category_type = 'expense' then -v_item_amount
                else v_item_amount
            end;

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
            ) values (
                p_ledger_id,
                p_transaction_record_id,
                p_account_id,
                v_item_category_id,
                v_item_category_type,
                v_item_amount,
                0,
                v_balance_delta,
                null,
                v_sort_order,
                v_user_id,
                v_user_id
            );

            perform public.apply_account_balance_delta(p_ledger_id, p_account_id, v_balance_delta, v_user_id);
            v_sort_order := v_sort_order + 1;
        end loop;

        perform public.sync_transaction_record_tags(
            p_ledger_id,
            p_transaction_record_id,
            coalesce(p_tag_names, '[]'::jsonb),
            v_user_id
        );
    end if;

    return p_transaction_record_id;
end;
$$;

grant execute on function public.convert_transaction_type(
    uuid,
    uuid,
    text,
    timestamptz,
    text,
    uuid,
    uuid,
    jsonb,
    jsonb,
    uuid,
    uuid,
    numeric
) to authenticated;
