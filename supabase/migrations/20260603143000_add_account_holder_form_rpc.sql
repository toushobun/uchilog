-- 账户和持有人需要原子化保存，避免账户数据与 holder 关系中途不一致
create or replace function public.create_account_with_holders(
    p_ledger_id uuid,
    p_name text,
    p_type text,
    p_currency text,
    p_initial_balance numeric,
    p_holder_user_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_account_id uuid;
    v_holder_user_ids uuid[];
    v_active_holder_user_ids uuid[];
begin
    v_user_id = auth.uid();

    if v_user_id is null then
        raise exception 'must be authenticated';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'current user cannot write this ledger';
    end if;

    select coalesce(array_agg(distinct holder_user_id), '{}'::uuid[])
    into v_holder_user_ids
    from unnest(coalesce(p_holder_user_ids, '{}'::uuid[])) as holder_user_ids(holder_user_id);

    if cardinality(v_holder_user_ids) > 0 then
        with locked_active_holders as (
            select lm.user_id
            from public.ledger_member lm
            join public.app_user au
              on au.id = lm.user_id
            where lm.ledger_id = p_ledger_id
              and lm.user_id = any(v_holder_user_ids)
              and lm.status = 'active'
              and au.status = 'active'
            for update of lm
        )
        select coalesce(array_agg(user_id), '{}'::uuid[])
        into v_active_holder_user_ids
        from locked_active_holders;

        if cardinality(v_active_holder_user_ids) <> cardinality(v_holder_user_ids) then
            raise exception 'account holders must be active ledger members';
        end if;
    end if;

    insert into public.account (
        ledger_id,
        name,
        type,
        currency,
        initial_balance,
        sort_order,
        created_by,
        updated_by
    )
    values (
        p_ledger_id,
        p_name,
        p_type,
        p_currency,
        p_initial_balance,
        0,
        v_user_id,
        v_user_id
    )
    returning id into v_account_id;

    if cardinality(v_holder_user_ids) > 0 then
        insert into public.account_holder (
            ledger_id,
            account_id,
            user_id,
            role,
            created_by,
            updated_by
        )
        select
            p_ledger_id,
            v_account_id,
            holder_user_id,
            case
                when cardinality(v_holder_user_ids) = 1 then 'owner'
                else 'co_owner'
            end,
            v_user_id,
            v_user_id
        from unnest(v_holder_user_ids) as holder_user_ids(holder_user_id);
    end if;

    return v_account_id;
end;
$$;

create or replace function public.update_account_with_holders(
    p_ledger_id uuid,
    p_account_id uuid,
    p_name text,
    p_type text,
    p_currency text,
    p_holder_user_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_updated_account_id uuid;
    v_holder_user_ids uuid[];
    v_active_holder_user_ids uuid[];
begin
    v_user_id = auth.uid();

    if v_user_id is null then
        raise exception 'must be authenticated';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'current user cannot write this ledger';
    end if;

    select coalesce(array_agg(distinct holder_user_id), '{}'::uuid[])
    into v_holder_user_ids
    from unnest(coalesce(p_holder_user_ids, '{}'::uuid[])) as holder_user_ids(holder_user_id);

    if cardinality(v_holder_user_ids) > 0 then
        with locked_active_holders as (
            select lm.user_id
            from public.ledger_member lm
            join public.app_user au
              on au.id = lm.user_id
            where lm.ledger_id = p_ledger_id
              and lm.user_id = any(v_holder_user_ids)
              and lm.status = 'active'
              and au.status = 'active'
            for update of lm
        )
        select coalesce(array_agg(user_id), '{}'::uuid[])
        into v_active_holder_user_ids
        from locked_active_holders;

        if cardinality(v_active_holder_user_ids) <> cardinality(v_holder_user_ids) then
            raise exception 'account holders must be active ledger members';
        end if;
    end if;

    update public.account
    set
        name = p_name,
        type = p_type,
        currency = p_currency,
        updated_by = v_user_id
    where id = p_account_id
      and ledger_id = p_ledger_id
      and is_archived = false
    returning id into v_updated_account_id;

    if v_updated_account_id is null then
        raise exception 'account not found';
    end if;

    delete from public.account_holder
    where account_holder.ledger_id = p_ledger_id
      and account_holder.account_id = p_account_id
      and not (account_holder.user_id = any(v_holder_user_ids))
      and exists (
          select 1
          from public.ledger_member lm
          join public.app_user au
            on au.id = lm.user_id
          where lm.ledger_id = account_holder.ledger_id
            and lm.user_id = account_holder.user_id
            and lm.status = 'active'
            and au.status = 'active'
      );

    if cardinality(v_holder_user_ids) > 0 then
        insert into public.account_holder (
            ledger_id,
            account_id,
            user_id,
            role,
            created_by,
            updated_by
        )
        select
            p_ledger_id,
            p_account_id,
            holder_user_id,
            case
                when cardinality(v_holder_user_ids) = 1 then 'owner'
                else 'co_owner'
            end,
            v_user_id,
            v_user_id
        from unnest(v_holder_user_ids) as holder_user_ids(holder_user_id)
        on conflict (account_id, user_id)
        do update set
            role = excluded.role,
            updated_by = excluded.updated_by;
    end if;

    return v_updated_account_id;
end;
$$;

revoke all on function public.create_account_with_holders(uuid, text, text, text, numeric, uuid[]) from public;
revoke all on function public.create_account_with_holders(uuid, text, text, text, numeric, uuid[]) from anon;
revoke all on function public.update_account_with_holders(uuid, uuid, text, text, text, uuid[]) from public;
revoke all on function public.update_account_with_holders(uuid, uuid, text, text, text, uuid[]) from anon;

grant execute on function public.create_account_with_holders(uuid, text, text, text, numeric, uuid[]) to authenticated;
grant execute on function public.update_account_with_holders(uuid, uuid, text, text, text, uuid[]) to authenticated;

-- account_holder 是 #46 / #47 查询账户持有人所需的业务表。
-- 写入统一通过上面的 RPC 完成，不直接授予 authenticated delete 权限。
grant select on table public.account_holder to authenticated;
