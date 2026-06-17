-- 支持交易标签 schema 与交易保存时的标签关联。
-- 对应 Issue #168。

create table public.transaction_tag (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,

    name text not null,
    color text,

    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint transaction_tag_id_ledger_id_unique
        unique (id, ledger_id),

    constraint transaction_tag_name_check
        check (length(trim(name)) between 1 and 40),

    constraint transaction_tag_color_check
        check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),

    constraint transaction_tag_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

create trigger transaction_tag_set_updated_at
before update on public.transaction_tag
for each row
execute function public.set_updated_at();

-- 同一账本内，未归档标签名称不能重复。
create unique index transaction_tag_active_name_unique
on public.transaction_tag (ledger_id, lower(name))
where is_archived = false;

create index transaction_tag_active_idx
on public.transaction_tag (ledger_id, id)
where is_archived = false;

create table public.transaction_record_tag (
    ledger_id uuid not null,
    transaction_record_id uuid not null,
    tag_id uuid not null,
    sort_order integer not null default 0,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),

    primary key (transaction_record_id, tag_id),

    -- 保证标签关联只能属于同一账本内的记账主表
    constraint transaction_record_tag_record_same_ledger_fk
        foreign key (transaction_record_id, ledger_id)
        references public.transaction_record (id, ledger_id)
        on delete restrict,

    -- 保证标签关联只能引用同一账本内的标签
    constraint transaction_record_tag_tag_same_ledger_fk
        foreign key (tag_id, ledger_id)
        references public.transaction_tag (id, ledger_id)
        on delete restrict
);

create index transaction_record_tag_record_idx
on public.transaction_record_tag (ledger_id, transaction_record_id);

create index transaction_record_tag_tag_idx
on public.transaction_record_tag (ledger_id, tag_id);

alter table public.transaction_tag enable row level security;
alter table public.transaction_record_tag enable row level security;

-- transaction_tag RLS policy
-- active 成员可以读取同账本未归档标签。
create policy transaction_tag_select_active_member
on public.transaction_tag
for select
to authenticated
using (
    is_archived = false
    and public.current_user_is_active_ledger_member(ledger_id)
);

-- active 成员可以新增同账本标签。
create policy transaction_tag_insert_active_member
on public.transaction_tag
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
    and is_archived = false
    and archived_at is null
    and archived_by is null
);

-- active 成员可以更新同账本标签，包括归档。
create policy transaction_tag_update_active_member
on public.transaction_tag
for update
to authenticated
using (
    public.current_user_can_write_ledger(ledger_id)
)
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- MVP 阶段不开放普通用户物理删除 transaction_tag。

-- transaction_record_tag RLS policy
-- active 成员可以读取 active 记账记录的标签关联。
create policy transaction_record_tag_select_active_record
on public.transaction_record_tag
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_record_tag.transaction_record_id
          and tr.ledger_id = transaction_record_tag.ledger_id
          and tr.status = 'active'
    )
);

-- active 成员可以为 active 记账记录新增未归档标签关联。
create policy transaction_record_tag_insert_active_member
on public.transaction_record_tag
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_record_tag.transaction_record_id
          and tr.ledger_id = transaction_record_tag.ledger_id
          and tr.status = 'active'
    )
    and exists (
        select 1
        from public.transaction_tag tt
        where tt.id = transaction_record_tag.tag_id
          and tt.ledger_id = transaction_record_tag.ledger_id
          and tt.is_archived = false
    )
);

-- active 成员可以删除 active 记账记录的标签关联，用于编辑时替换标签集合。
create policy transaction_record_tag_delete_active_member
on public.transaction_record_tag
for delete
to authenticated
using (
    public.current_user_can_write_ledger(ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_record_tag.transaction_record_id
          and tr.ledger_id = transaction_record_tag.ledger_id
          and tr.status = 'active'
    )
);

-- 标签同步函数只给交易保存 RPC 内部使用，避免前端绕过表单校验直接批量写入。
create or replace function public.sync_transaction_record_tags(
    p_ledger_id uuid,
    p_transaction_record_id uuid,
    p_tag_names jsonb,
    p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_raw_tag jsonb;
    v_tag_name text;
    v_tag_names text[] := '{}';
    v_tag_id uuid;
    v_sort_order integer := 0;
begin
    if p_tag_names is null then
        p_tag_names := '[]'::jsonb;
    end if;

    if jsonb_typeof(p_tag_names) <> 'array' then
        raise exception 'tag_names_invalid' using errcode = '22023';
    end if;

    for v_raw_tag in select * from jsonb_array_elements(p_tag_names)
    loop
        v_tag_name := nullif(trim(v_raw_tag #>> '{}'), '');

        if v_tag_name is null then
            continue;
        end if;

        if length(v_tag_name) > 40 then
            raise exception 'tag_name_invalid' using errcode = '22023';
        end if;

        if not exists (
            select 1
            from unnest(v_tag_names) as existing_tag(name)
            where lower(existing_tag.name) = lower(v_tag_name)
        ) then
            if coalesce(array_length(v_tag_names, 1), 0) >= 10 then
                raise exception 'tag_count_invalid' using errcode = '22023';
            end if;

            v_tag_names := array_append(v_tag_names, v_tag_name);
        end if;
    end loop;

    delete from public.transaction_record_tag trt
    where trt.ledger_id = p_ledger_id
      and trt.transaction_record_id = p_transaction_record_id;

    foreach v_tag_name in array v_tag_names
    loop
        select tt.id
        into v_tag_id
        from public.transaction_tag tt
        where tt.ledger_id = p_ledger_id
          and tt.is_archived = false
          and lower(tt.name) = lower(v_tag_name)
        limit 1;

        if v_tag_id is null then
            begin
                insert into public.transaction_tag (
                    ledger_id,
                    name,
                    created_by,
                    updated_by
                ) values (
                    p_ledger_id,
                    v_tag_name,
                    p_user_id,
                    p_user_id
                )
                returning id into v_tag_id;
            exception when unique_violation then
                select tt.id
                into v_tag_id
                from public.transaction_tag tt
                where tt.ledger_id = p_ledger_id
                  and tt.is_archived = false
                  and lower(tt.name) = lower(v_tag_name)
                limit 1;
            end;
        end if;

        -- 极端竞态下（INSERT 冲突后对方立即删除）兜底
        if v_tag_id is null then
            raise exception 'tag_sync_failed' using errcode = '22023';
        end if;

        insert into public.transaction_record_tag (
            ledger_id,
            transaction_record_id,
            tag_id,
            sort_order,
            created_by
        ) values (
            p_ledger_id,
            p_transaction_record_id,
            v_tag_id,
            v_sort_order,
            p_user_id
        )
        on conflict do nothing;

        v_sort_order := v_sort_order + 1;
    end loop;
end;
$$;

revoke all on function public.sync_transaction_record_tags(uuid, uuid, jsonb, uuid) from public;
revoke all on function public.sync_transaction_record_tags(uuid, uuid, jsonb, uuid) from anon;
revoke all on function public.sync_transaction_record_tags(uuid, uuid, jsonb, uuid) from authenticated;

-- 支持保存交易时同时保存标签名称。
create or replace function public.create_transaction(
    p_ledger_id uuid,
    p_type text,
    p_transaction_at timestamptz,
    p_items jsonb,
    p_account_id uuid,
    p_merchant_id uuid default null,
    p_note text default null,
    p_tag_names jsonb default '[]'::jsonb
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

    if p_merchant_id is not null and not exists (
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

    perform public.sync_transaction_record_tags(
        p_ledger_id,
        v_transaction_record_id,
        p_tag_names,
        v_user_id
    );

    return v_transaction_record_id;
end;
$$;

grant execute on function public.create_transaction(
    uuid, text, timestamptz, jsonb, uuid, uuid, text, jsonb
) to authenticated;

-- 支持编辑交易时替换标签集合。
create or replace function public.update_transaction(
    p_ledger_id uuid,
    p_transaction_record_id uuid,
    p_type text,
    p_transaction_at timestamptz,
    p_items jsonb,
    p_account_id uuid,
    p_merchant_id uuid,
    p_note text default null,
    p_tag_names jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_record public.transaction_record;
    v_existing_item public.transaction_item;
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

    -- update_transaction 只编辑 expense / income 记录，因此这里只回滚并替换对应统计明细。
    -- 如果后续新增会影响余额的 stat_type，需要先设计对应的更新路径再纳入这里。
    for v_existing_item in
        select *
        from public.transaction_item ti
        where ti.transaction_record_id = p_transaction_record_id
          and ti.ledger_id = p_ledger_id
          and ti.stat_type in ('expense', 'income')
        order by ti.sort_order, ti.id
        for update
    loop
        perform public.apply_account_balance_delta(
            p_ledger_id,
            v_existing_item.account_id,
            -v_existing_item.balance_delta,
            v_user_id
        );
    end loop;

    delete from public.transaction_item ti
    where ti.transaction_record_id = p_transaction_record_id
      and ti.ledger_id = p_ledger_id
      and ti.stat_type in ('expense', 'income');

    update public.transaction_record tr
    set
        type = p_type,
        transaction_at = p_transaction_at,
        merchant_id = p_merchant_id,
        note = p_note,
        updated_by = v_user_id,
        updated_at = now()
    where tr.id = p_transaction_record_id
      and tr.ledger_id = p_ledger_id
      and tr.status = 'active';

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
            p_ledger_id, p_transaction_record_id, p_account_id, v_item_category_id, p_type,
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

    perform public.sync_transaction_record_tags(
        p_ledger_id,
        p_transaction_record_id,
        p_tag_names,
        v_user_id
    );

    return p_transaction_record_id;
end;
$$;

grant execute on function public.update_transaction(
    uuid, uuid, text, timestamptz, jsonb, uuid, uuid, text, jsonb
) to authenticated;
