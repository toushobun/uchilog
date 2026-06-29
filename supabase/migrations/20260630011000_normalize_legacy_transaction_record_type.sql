-- 兼容旧 seed / 旧分支仍直接写入 expense / income 的情况。
-- 在 CHECK 约束执行前把普通记账类型统一收敛为 normal。

create or replace function public.normalize_transaction_record_type_for_compat()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.type in ('expense', 'income', 'refund', 'reimbursement') then
        new.type := 'normal';
    end if;

    return new;
end;
$$;

revoke all on function public.normalize_transaction_record_type_for_compat() from public;
revoke all on function public.normalize_transaction_record_type_for_compat() from anon;
revoke all on function public.normalize_transaction_record_type_for_compat() from authenticated;

drop trigger if exists transaction_record_normalize_type_for_compat on public.transaction_record;
create trigger transaction_record_normalize_type_for_compat
before insert or update of type on public.transaction_record
for each row
execute function public.normalize_transaction_record_type_for_compat();
