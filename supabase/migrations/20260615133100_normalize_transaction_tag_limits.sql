-- 将 sync_transaction_record_tags 内的标签限制值集中到局部常量。
-- 与 TypeScript 侧的 constants/transactions.ts 保持一致，
-- 避免将 10 / 40 直接散落在各处判断条件中。

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
    v_max_tag_count constant integer := 10;
    v_max_tag_name_length constant integer := 40;
    v_raw_tag jsonb;
    v_tag_name text;
    v_tag_names text[] := '{}';
    v_tag_id uuid;
    v_tag_ids uuid[] := '{}';
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

        if length(v_tag_name) > v_max_tag_name_length then
            raise exception 'tag_name_invalid' using errcode = '22023';
        end if;

        if not exists (
            select 1
            from unnest(v_tag_names) as existing_tag(name)
            where lower(existing_tag.name) = lower(v_tag_name)
        ) then
            if coalesce(array_length(v_tag_names, 1), 0) >= v_max_tag_count then
                raise exception 'tag_count_invalid' using errcode = '22023';
            end if;

            v_tag_names := array_append(v_tag_names, v_tag_name);
        end if;
    end loop;

    foreach v_tag_name in array v_tag_names
    loop
        v_tag_id := null;

        -- 编辑保存时优先复用当前记录已关联的同名标签，包含已归档标签。
        -- 这样 no-op 编辑不会把历史归档标签重新创建为 active 标签。
        select tt.id
        into v_tag_id
        from public.transaction_record_tag trt
        join public.transaction_tag tt
          on tt.id = trt.tag_id
         and tt.ledger_id = trt.ledger_id
        where trt.ledger_id = p_ledger_id
          and trt.transaction_record_id = p_transaction_record_id
          and lower(tt.name) = lower(v_tag_name)
        order by trt.sort_order asc
        limit 1;

        if v_tag_id is null then
            select tt.id
            into v_tag_id
            from public.transaction_tag tt
            where tt.ledger_id = p_ledger_id
              and tt.is_archived = false
              and lower(tt.name) = lower(v_tag_name)
            limit 1;
        end if;

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

        v_tag_ids := array_append(v_tag_ids, v_tag_id);
    end loop;

    delete from public.transaction_record_tag trt
    where trt.ledger_id = p_ledger_id
      and trt.transaction_record_id = p_transaction_record_id;

    foreach v_tag_id in array v_tag_ids
    loop
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