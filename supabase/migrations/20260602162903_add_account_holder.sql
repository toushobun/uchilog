-- 账户持有人表
create table public.account_holder (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null,
    account_id uuid not null,
    user_id uuid not null references public.app_user(id) on delete restrict,

    role text not null default 'owner',
    share_ratio numeric(5,2),

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    constraint account_holder_account_same_ledger_fk
        foreign key (account_id, ledger_id)
        references public.account (id, ledger_id)
        on delete restrict,

    constraint account_holder_role_check
        check (role in ('owner', 'co_owner')),

    constraint account_holder_share_ratio_check
        check (share_ratio is null or (share_ratio > 0 and share_ratio <= 100)),

    constraint account_holder_unique
        unique (account_id, user_id)
);

create trigger account_holder_set_updated_at
before update on public.account_holder
for each row
execute function public.set_updated_at();

create index account_holder_account_ledger_idx
on public.account_holder (account_id, ledger_id);

create index account_holder_ledger_id_idx
on public.account_holder (ledger_id);

create index account_holder_user_id_idx
on public.account_holder (user_id);

-- account_holder 的 user_id 必须是同一账本内 active 成员
create function public.validate_account_holder_active_member()
returns trigger
language plpgsql
as $$
begin
    if not exists (
        select 1
        from public.ledger_member lm
        join public.app_user au on au.id = lm.user_id
        where lm.ledger_id = new.ledger_id
          and lm.user_id = new.user_id
          and lm.status = 'active'
          and au.status = 'active'
    ) then
        raise exception 'account holder must be an active ledger member';
    end if;

    return new;
end;
$$;

create trigger account_holder_validate_active_member
before insert or update on public.account_holder
for each row
execute function public.validate_account_holder_active_member();

alter table public.account_holder enable row level security;

create policy account_holder_select_active_ledger_member
on public.account_holder
for select
using (
    exists (
        select 1
        from public.ledger_member lm
        join public.app_user au on au.id = lm.user_id
        where lm.ledger_id = account_holder.ledger_id
          and lm.user_id = auth.uid()
          and lm.status = 'active'
          and au.status = 'active'
    )
);

create policy account_holder_insert_active_ledger_member
on public.account_holder
for insert
with check (
    exists (
        select 1
        from public.ledger_member lm
        join public.app_user au on au.id = lm.user_id
        where lm.ledger_id = account_holder.ledger_id
          and lm.user_id = auth.uid()
          and lm.status = 'active'
          and au.status = 'active'
    )
);

create policy account_holder_update_active_ledger_member
on public.account_holder
for update
using (
    exists (
        select 1
        from public.ledger_member lm
        join public.app_user au on au.id = lm.user_id
        where lm.ledger_id = account_holder.ledger_id
          and lm.user_id = auth.uid()
          and lm.status = 'active'
          and au.status = 'active'
    )
)
with check (
    exists (
        select 1
        from public.ledger_member lm
        join public.app_user au on au.id = lm.user_id
        where lm.ledger_id = account_holder.ledger_id
          and lm.user_id = auth.uid()
          and lm.status = 'active'
          and au.status = 'active'
    )
);

create policy account_holder_delete_active_ledger_member
on public.account_holder
for delete
using (
    exists (
        select 1
        from public.ledger_member lm
        join public.app_user au on au.id = lm.user_id
        where lm.ledger_id = account_holder.ledger_id
          and lm.user_id = auth.uid()
          and lm.status = 'active'
          and au.status = 'active'
    )
);
