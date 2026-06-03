-- Additional local app user for ownership tests.
-- This user is intentionally not added to the household ledger.

begin;

insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000037',
    'authenticated',
    'authenticated',
    'local3@example.test',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "本地开发用户3"}'::jsonb,
    now(),
    now()
)
on conflict (id) do update
set
    email = excluded.email,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = excluded.updated_at;

update public.app_user
set
    display_name = '本地开发用户3',
    email = 'local3@example.test',
    status = 'active',
    created_by = id,
    updated_by = id,
    updated_at = now()
where id = '00000000-0000-4000-8000-000000000037';

commit;
