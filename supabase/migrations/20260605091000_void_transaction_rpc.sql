create or replace function public.void_transaction(
    p_ledger_id uuid,
    p_transaction_record_id uuid
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
    v_item_count integer;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    if not public.current_user_can_write_ledger(p_ledger_id) then
        raise exception 'ledger_forbidden' using errcode = '42501';
    end if;

    select *
    into v_record
    from public.transaction_record tr
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active'
      and tr.type in ('expense', 'income')
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    select count(*)
    into v_item_count
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id;

    if v_item_count <> 1 then
        raise exception 'transaction_item_count_invalid' using errcode = '22023';
    end if;

    select *
    into v_item
    from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id
      and ti.stat_type in ('expense', 'income')
    for update;

    if not found then
        raise exception 'transaction_item_invalid' using errcode = '22023';
    end if;

    perform public.apply_account_balance_delta(
        p_ledger_id,
        v_item.account_id,
        -v_item.balance_delta,
        v_user_id
    );

    update public.transaction_record tr
    set
        status = 'deleted',
        deleted_by = v_user_id,
        deleted_at = now(),
        updated_by = v_user_id,
        updated_at = now()
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active';

    if not found then
        raise exception 'transaction_not_found' using errcode = '22023';
    end if;

    return p_transaction_record_id;
end;
$$;

grant execute on function public.void_transaction(uuid, uuid) to authenticated;
