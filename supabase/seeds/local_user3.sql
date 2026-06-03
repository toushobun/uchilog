-- Additional local app user for ownership tests.
-- This user is intentionally not added to the household ledger.
-- Login: local3@example.test / password123

begin;

insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone,
    phone_change,
    phone_change_token,
    email_change_token_current,
    email_change_confirm_status,
    reauthentication_token,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    is_sso_user,
    is_anonymous,
    created_at,
    updated_at
)
values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000037',
    'authenticated',
    'authenticated',
    'local3@example.test',
    crypt('password123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    null,
    '',
    '',
    '',
    0,
    '',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "本地开发用户3"}'::jsonb,
    false,
    false,
    false,
    now(),
    now()
)
on conflict (id) do update
set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    confirmation_token = excluded.confirmation_token,
    recovery_token = excluded.recovery_token,
    email_change_token_new = excluded.email_change_token_new,
    email_change = excluded.email_change,
    phone = excluded.phone,
    phone_change = excluded.phone_change,
    phone_change_token = excluded.phone_change_token,
    email_change_token_current = excluded.email_change_token_current,
    email_change_confirm_status = excluded.email_change_confirm_status,
    reauthentication_token = excluded.reauthentication_token,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    is_super_admin = excluded.is_super_admin,
    is_sso_user = excluded.is_sso_user,
    is_anonymous = excluded.is_anonymous,
    updated_at = excluded.updated_at;

insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
values (
    '00000000-0000-4000-8000-000000000137',
    '00000000-0000-4000-8000-000000000037',
    '00000000-0000-4000-8000-000000000037',
    jsonb_build_object(
        'sub', '00000000-0000-4000-8000-000000000037',
        'email', 'local3@example.test',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
)
on conflict (provider_id, provider) do update
set
    identity_data = excluded.identity_data,
    last_sign_in_at = excluded.last_sign_in_at,
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
