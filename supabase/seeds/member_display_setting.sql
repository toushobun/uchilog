-- Local member display color seed data.

begin;

insert into public.ledger_member_display_setting (
    id,
    ledger_id,
    user_id,
    display_color,
    created_by,
    updated_by
)
values
    ('00000000-0000-4000-8000-000000000081', '00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000031', 'sky', '00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000031'),
    ('00000000-0000-4000-8000-000000000082', '00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000034', 'sakura', '00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000031')
on conflict (ledger_id, user_id) do update
set
    display_color = excluded.display_color,
    updated_by = excluded.updated_by,
    updated_at = now();

-- Transaction list seed data for local infinite scroll verification.
with seed_records as (
    select
        series_index,
        ('00000000-0000-4000-8000-' || lpad((900000 + series_index)::text, 12, '0'))::uuid as record_id,
        ('00000000-0000-4000-8000-' || lpad((910000 + series_index)::text, 12, '0'))::uuid as item_id,
        case when series_index % 10 = 0 then 'income' else 'expense' end as transaction_type,
        case when series_index % 10 = 0 then '00000000-0000-4000-8000-000000005002'::uuid else (array[
            '00000000-0000-4000-8000-000000005021'::uuid,
            '00000000-0000-4000-8000-000000005022'::uuid,
            '00000000-0000-4000-8000-000000005023'::uuid,
            '00000000-0000-4000-8000-000000005029'::uuid,
            '00000000-0000-4000-8000-000000005040'::uuid,
            '00000000-0000-4000-8000-000000005082'::uuid
        ])[((series_index - 1) % 6) + 1] end as category_id,
        case when series_index % 10 = 0 then '00000000-0000-4000-8000-000000001021'::uuid else (array[
            '00000000-0000-4000-8000-000000001001'::uuid,
            '00000000-0000-4000-8000-000000001012'::uuid,
            '00000000-0000-4000-8000-000000001013'::uuid,
            '00000000-0000-4000-8000-000000001008'::uuid,
            '00000000-0000-4000-8000-000000001010'::uuid,
            '00000000-0000-4000-8000-000000001033'::uuid
        ])[((series_index - 1) % 6) + 1] end as merchant_id,
        (array[
            '00000000-0000-4000-8000-000000000041'::uuid,
            '00000000-0000-4000-8000-000000000043'::uuid,
            '00000000-0000-4000-8000-000000000045'::uuid,
            '00000000-0000-4000-8000-000000000047'::uuid
        ])[((series_index - 1) % 4) + 1] as account_id,
        case when series_index % 10 = 0 then 260000::numeric(14,2) else (300 + ((series_index * 137) % 9000))::numeric(14,2) end as amount,
        ('2026-06-05 12:00:00+09'::timestamptz - (series_index * interval '6 hours')) as transaction_at
    from generate_series(1, 100) as series_index
)
insert into public.transaction_record (
    id,
    ledger_id,
    type,
    status,
    transaction_at,
    merchant_id,
    title,
    note,
    discount_amount,
    discount_allocation_method,
    created_by,
    created_at,
    updated_by,
    updated_at
)
select
    record_id,
    '00000000-0000-4000-8000-000000000032',
    transaction_type,
    'active',
    transaction_at,
    merchant_id,
    null,
    'Infinite scroll 模拟记账 #' || series_index,
    0,
    'none',
    '00000000-0000-4000-8000-000000000031',
    transaction_at,
    '00000000-0000-4000-8000-000000000031',
    transaction_at
from seed_records
on conflict (id) do update
set
    type = excluded.type,
    status = excluded.status,
    transaction_at = excluded.transaction_at,
    merchant_id = excluded.merchant_id,
    note = excluded.note,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;

with seed_records as (
    select
        series_index,
        ('00000000-0000-4000-8000-' || lpad((900000 + series_index)::text, 12, '0'))::uuid as record_id,
        ('00000000-0000-4000-8000-' || lpad((910000 + series_index)::text, 12, '0'))::uuid as item_id,
        case when series_index % 10 = 0 then 'income' else 'expense' end as transaction_type,
        case when series_index % 10 = 0 then '00000000-0000-4000-8000-000000005002'::uuid else (array[
            '00000000-0000-4000-8000-000000005021'::uuid,
            '00000000-0000-4000-8000-000000005022'::uuid,
            '00000000-0000-4000-8000-000000005023'::uuid,
            '00000000-0000-4000-8000-000000005029'::uuid,
            '00000000-0000-4000-8000-000000005040'::uuid,
            '00000000-0000-4000-8000-000000005082'::uuid
        ])[((series_index - 1) % 6) + 1] end as category_id,
        (array[
            '00000000-0000-4000-8000-000000000041'::uuid,
            '00000000-0000-4000-8000-000000000043'::uuid,
            '00000000-0000-4000-8000-000000000045'::uuid,
            '00000000-0000-4000-8000-000000000047'::uuid
        ])[((series_index - 1) % 4) + 1] as account_id,
        case when series_index % 10 = 0 then 260000::numeric(14,2) else (300 + ((series_index * 137) % 9000))::numeric(14,2) end as amount,
        ('2026-06-05 12:00:00+09'::timestamptz - (series_index * interval '6 hours')) as transaction_at
    from generate_series(1, 100) as series_index
)
insert into public.transaction_item (
    id,
    ledger_id,
    transaction_record_id,
    account_id,
    category_id,
    amount,
    discount_amount,
    balance_delta,
    note,
    sort_order,
    created_by,
    created_at,
    updated_by,
    updated_at
)
select
    item_id,
    '00000000-0000-4000-8000-000000000032',
    record_id,
    account_id,
    category_id,
    amount,
    0,
    case when transaction_type = 'income' then amount else -amount end,
    null,
    0,
    '00000000-0000-4000-8000-000000000031',
    transaction_at,
    '00000000-0000-4000-8000-000000000031',
    transaction_at
from seed_records
on conflict (id) do update
set
    account_id = excluded.account_id,
    category_id = excluded.category_id,
    amount = excluded.amount,
    balance_delta = excluded.balance_delta,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;

-- Keep local account balances consistent with the seeded transaction items.
with account_balance_deltas as (
    select
        a.id as account_id,
        (a.initial_balance + coalesce(sum(ti.balance_delta), 0)::numeric(14,2)) - a.current_balance as balance_delta
    from public.account a
    left join public.transaction_item ti
        on ti.account_id = a.id
       and ti.ledger_id = a.ledger_id
    where a.ledger_id = '00000000-0000-4000-8000-000000000032'
    group by a.id, a.initial_balance, a.current_balance
)
select public.apply_account_balance_delta(
    '00000000-0000-4000-8000-000000000032',
    account_id,
    balance_delta,
    '00000000-0000-4000-8000-000000000031'
)
from account_balance_deltas
where balance_delta <> 0;

commit;
