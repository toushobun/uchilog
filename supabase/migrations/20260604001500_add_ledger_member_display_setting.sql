-- 账本成员业务显示色：用于交易明细等业务数据中区分“记账人 / 成员”。
-- 这不是登录用户个人 UI 主题；个人主题后续单独落 user preference。
create table public.ledger_member_display_setting (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,
    user_id uuid not null references public.app_user(id) on delete restrict,

    display_color text not null,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    constraint ledger_member_display_setting_unique
        unique (ledger_id, user_id),

    -- 颜色 key 需要与 src/theme/themeColorTokens.ts 的 themeColorKeys 同步。
    constraint ledger_member_display_setting_color_check
        check (
            display_color in (
                'jade',
                'aqua',
                'sky',
                'indigo',
                'lavender',
                'magenta',
                'sakura',
                'rose',
                'amber',
                'lime'
            )
        )
);

create trigger ledger_member_display_setting_set_updated_at
before update on public.ledger_member_display_setting
for each row
execute function public.set_updated_at();

create index ledger_member_display_setting_ledger_id_idx
on public.ledger_member_display_setting (ledger_id);

create index ledger_member_display_setting_user_id_idx
on public.ledger_member_display_setting (user_id);

create or replace function public.current_user_can_manage_member_display_setting(
    p_ledger_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.ledger_member lm
        join public.app_user au
          on au.id = lm.user_id
        where lm.ledger_id = p_ledger_id
          and lm.user_id = auth.uid()
          and lm.role in ('owner', 'admin')
          and lm.status = 'active'
          and au.status = 'active'
    );
$$;

create or replace function public.validate_ledger_member_display_setting_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    perform 1
    from public.ledger_member lm
    join public.app_user au
      on au.id = lm.user_id
    where lm.ledger_id = new.ledger_id
      and lm.user_id = new.user_id
      and lm.status = 'active'
      and au.status = 'active'
    for update of lm;

    if not found then
        raise exception 'member display setting target must be an active ledger member';
    end if;

    return new;
end;
$$;

create trigger ledger_member_display_setting_validate_member
before insert or update on public.ledger_member_display_setting
for each row
execute function public.validate_ledger_member_display_setting_member();

create or replace function public.set_ledger_member_display_setting_audit_user()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    v_user_id uuid;
begin
    v_user_id = auth.uid();

    if v_user_id is null then
        return new;
    end if;

    if tg_op = 'INSERT' then
        new.created_by = v_user_id;
        new.updated_by = v_user_id;
    else
        new.created_by = old.created_by;
        new.updated_by = v_user_id;
    end if;

    return new;
end;
$$;

create trigger ledger_member_display_setting_set_audit_user
before insert or update on public.ledger_member_display_setting
for each row
execute function public.set_ledger_member_display_setting_audit_user();

create or replace function public.prevent_ledger_member_display_setting_identity_change()
returns trigger
language plpgsql
as $$
begin
    if old.ledger_id <> new.ledger_id then
        raise exception '不允许修改成员显示色所属账本';
    end if;

    if old.user_id <> new.user_id then
        raise exception '不允许修改成员显示色所属用户';
    end if;

    return new;
end;
$$;

create trigger ledger_member_display_setting_prevent_identity_change
before update on public.ledger_member_display_setting
for each row
execute function public.prevent_ledger_member_display_setting_identity_change();

create or replace function public.cleanup_ledger_member_display_setting_on_member_leave()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if old.status = 'active' and new.status <> 'active' then
        delete from public.ledger_member_display_setting setting
        where setting.ledger_id = old.ledger_id
          and setting.user_id = old.user_id;
    end if;

    return new;
end;
$$;

create trigger ledger_member_display_setting_cleanup_on_member_leave
after update of status on public.ledger_member
for each row
execute function public.cleanup_ledger_member_display_setting_on_member_leave();

alter table public.ledger_member_display_setting enable row level security;

create policy ledger_member_display_setting_select_active_member
on public.ledger_member_display_setting
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
);

create policy ledger_member_display_setting_insert_owner_admin
on public.ledger_member_display_setting
for insert
to authenticated
with check (
    public.current_user_can_manage_member_display_setting(ledger_id)
);

create policy ledger_member_display_setting_update_owner_admin
on public.ledger_member_display_setting
for update
to authenticated
using (
    public.current_user_can_manage_member_display_setting(ledger_id)
)
with check (
    public.current_user_can_manage_member_display_setting(ledger_id)
);

revoke all on table public.ledger_member_display_setting from anon;
grant select, insert, update on table public.ledger_member_display_setting to authenticated;

revoke all on function public.current_user_can_manage_member_display_setting(uuid) from public;
revoke all on function public.current_user_can_manage_member_display_setting(uuid) from anon;
grant execute on function public.current_user_can_manage_member_display_setting(uuid) to authenticated;
