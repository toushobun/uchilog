-- 商家在产品层已经是必填，这里把数据库和 RPC 约束同步为必填。
-- 若历史数据里存在 merchant_id 为空的记录，先按账本回填一个占位商家，避免迁移失败。

with target_ledgers as (
    select distinct tr.ledger_id
    from public.transaction_record tr
    where tr.merchant_id is null
),
inserted_merchants as (
    insert into public.merchant (
        ledger_id, name, sort_order
    )
    select tl.ledger_id, '未指定商家', -1
    from target_ledgers tl
    where not exists (
        select 1
        from public.merchant m
        where m.ledger_id = tl.ledger_id
          and lower(m.name) = lower('未指定商家')
          and m.is_archived = false
    )
    returning id, ledger_id
),
fallback_merchants as (
    select im.id, im.ledger_id
    from inserted_merchants im
    union all
    select m.id, m.ledger_id
    from public.merchant m
    join target_ledgers tl on tl.ledger_id = m.ledger_id
    where lower(m.name) = lower('未指定商家')
      and m.is_archived = false
)
update public.transaction_record tr
set merchant_id = fm.id
from fallback_merchants fm
where tr.ledger_id = fm.ledger_id
  and tr.merchant_id is null;

alter table public.transaction_record
    alter column merchant_id set not null;

drop function if exists public.create_transaction(uuid, text, timestamptz, jsonb, uuid, uuid, text);

create or replace function public.create_transaction(
    p_ledger_id uuid,
    p_type text,
    p_transaction_at timestamptz,
    p_items jsonb,
    p_account_id uuid,
    p_merchant_id uuid,
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
    v_item jsonb;
    v_item_amount numeric(14,2);
    v_item_category_id uuid;
    v_balance_delta numeric(14,2);
    v_sort_order integer := 0;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    if p_type not in ('expense', 'income') then
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

    if p_merchant_id is null or not exists (
        select 1 from public.merchant m
        where m.id = p_merchant_id
          and m.ledger_id = p_ledger_id
          and m.is_archived = false
    ) then
        raise exception 'merchant_invalid' using errcode = '22023';
    end if;

    insert into public.transaction_record (
        ledger_id, type, status, transaction_at, merchant_id,
        title, note, created_by, updated_by
    ) values (
        p_ledger_id, p_type, 'active', p_transaction_at, p_merchant_id,
        null, p_note, v_user_id, v_user_id
    ) returning id into v_transaction_record_id;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
        v_item_amount := (v_item ->> 'amount')::numeric(14,2);
        v_item_category_id := (v_item ->> 'categoryId')::uuid;

        if v_item_amount is null or v_item_amount < 0 or v_item_amount <> round(v_item_amount, 2) then
            raise exception 'amount_invalid' using errcode = '22023';
        end if;

        if not exists (
            select 1 from public.category c
            where c.id = v_item_category_id
              and c.ledger_id = p_ledger_id
              and c.is_archived = false
              and c.parent_id is not null
              and c.type = p_type
        ) then
            raise exception 'category_invalid' using errcode = '22023';
        end if;

        v_balance_delta := case when p_type = 'expense' then -v_item_amount else v_item_amount end;

        insert into public.transaction_item (
            ledger_id, transaction_record_id, account_id, category_id, stat_type,
            amount, discount_amount, balance_delta, note, sort_order,
            created_by, updated_by
        ) values (
            p_ledger_id, v_transaction_record_id, p_account_id, v_item_category_id, p_type,
            v_item_amount, 0, v_balance_delta, null, v_sort_order,
            v_user_id, v_user_id
        );

        perform public.apply_account_balance_delta(
            p_ledger_id,
            p_account_id,
            v_balance_delta,
            v_user_id
        );

        v_sort_order := v_sort_order + 1;
    end loop;

    return v_transaction_record_id;
end;
$$;

grant execute on function public.create_transaction(
    uuid, text, timestamptz, jsonb, uuid, uuid, text
) to authenticated;
