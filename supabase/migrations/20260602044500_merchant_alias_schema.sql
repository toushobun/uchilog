-- KuraNote 商家别名 schema
-- 对应 Issue：#28
-- 用于支持同一商家通过中文、日语、英文、简称或俗称进行搜索

-- 启用 pg_trgm 扩展，用于后续商家别名的部分一致搜索
create extension if not exists pg_trgm;

-- 商家别名表
-- 别名属于具体商家，账本范围通过 merchant.ledger_id 判断
-- MVP 阶段不在本表冗余 ledger_id，避免 ledger_id 与 merchant.ledger_id 不一致
create table public.merchant_alias (
    id uuid primary key default gen_random_uuid(),

    merchant_id uuid not null references public.merchant(id) on delete restrict,

    alias text not null,
    -- 预期使用 BCP 47 风格，例如 ja、zh-Hans、en；MVP 阶段允许为空且不参与搜索逻辑
    locale text,
    note text,

    sort_order integer not null default 0,

    -- 归档规则与现有业务表保持一致：允许 archived_by 为空，以兼容系统处理或旧数据修正场景
    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    -- 审计字段与现有业务表保持一致：允许为空，由服务端业务流程尽量写入用户 ID
    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    constraint merchant_alias_alias_check
        check (length(trim(alias)) between 1 and 100),

    constraint merchant_alias_locale_check
        check (locale is null or length(trim(locale)) between 2 and 20),

    constraint merchant_alias_note_check
        check (note is null or length(note) <= 1000),

    constraint merchant_alias_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

-- merchant_alias 更新时自动刷新 updated_at
create trigger merchant_alias_set_updated_at
before update on public.merchant_alias
for each row
execute function public.set_updated_at();

-- 防止通过 update 修改别名所属商家
-- 商家归属变更会影响账本权限边界，因此不允许直接修改
create or replace function public.prevent_merchant_alias_identity_change()
returns trigger
language plpgsql
as $$
begin
    if old.id <> new.id then
        raise exception '不允许修改商家别名 id';
    end if;

    if old.merchant_id <> new.merchant_id then
        raise exception '不允许修改商家别名所属商家';
    end if;

    return new;
end;
$$;

create trigger merchant_alias_prevent_identity_change
before update on public.merchant_alias
for each row
execute function public.prevent_merchant_alias_identity_change();

-- 同一商家下，未归档别名不能重复
-- MVP 阶段使用 lower(alias)，因此 LIFE 和 life 视为重复
-- 归档后允许重新创建同名别名
-- MVP 阶段不做全角 / 半角、假名、简繁体等归一化
create unique index merchant_alias_active_alias_unique
on public.merchant_alias (merchant_id, lower(alias))
where is_archived = false;

-- 查询未归档别名列表时使用
-- MVP 阶段默认不查询归档别名，因此不额外创建包含归档数据的 merchant_id 普通索引
create index merchant_alias_active_idx
on public.merchant_alias (merchant_id, sort_order, id)
where is_archived = false;

-- 后续按别名做部分一致搜索时使用
create index merchant_alias_active_alias_search_idx
on public.merchant_alias using gin (lower(alias) gin_trgm_ops)
where is_archived = false;

-- 启用 Row Level Security
alter table public.merchant_alias enable row level security;

-- merchant_alias RLS policy
-- active 成员可以读取当前账本下商家的别名
create policy merchant_alias_select_active_member
on public.merchant_alias
for select
to authenticated
using (
    exists (
        select 1
        from public.merchant m
        where m.id = merchant_alias.merchant_id
          and public.current_user_is_active_ledger_member(m.ledger_id)
    )
);

-- active 成员可以给当前账本下的未归档商家新增别名
create policy merchant_alias_insert_active_member
on public.merchant_alias
for insert
to authenticated
with check (
    exists (
        select 1
        from public.merchant m
        where m.id = merchant_alias.merchant_id
          and m.is_archived = false
          and public.current_user_can_write_ledger(m.ledger_id)
    )
);

-- active 成员可以更新当前账本下未归档商家的别名
-- id / merchant_id 由 trigger 防止被修改
create policy merchant_alias_update_active_member
on public.merchant_alias
for update
to authenticated
using (
    exists (
        select 1
        from public.merchant m
        where m.id = merchant_alias.merchant_id
          and m.is_archived = false
          and public.current_user_can_write_ledger(m.ledger_id)
    )
)
with check (
    exists (
        select 1
        from public.merchant m
        where m.id = merchant_alias.merchant_id
          and m.is_archived = false
          and public.current_user_can_write_ledger(m.ledger_id)
    )
);

-- MVP 阶段不开放普通用户物理删除 merchant_alias
