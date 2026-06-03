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

commit;
