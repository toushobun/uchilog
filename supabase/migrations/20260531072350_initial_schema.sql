-- KuraNote MVP 初期数据库结构
-- 对应 Issue：#8
-- 基于 Issue #7 的数据库设计实现

-- 启用 pgcrypto 扩展，用于生成 uuid，例如 gen_random_uuid()
create extension if not exists pgcrypto;

-- 通用 updated_at 自动更新时间函数
-- 后续各业务表会通过 trigger 调用该函数
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- 用户业务资料表
-- Supabase Auth 的用户信息由 auth.users 管理
-- app_user.id 与 auth.users.id 保持一致
create table public.app_user (
    id uuid primary key references auth.users(id) on delete restrict,

    display_name text not null,
    email text unique,
    avatar_url text,

    status text not null default 'active',

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    constraint app_user_status_check
        check (status in ('active', 'disabled')),

    constraint app_user_display_name_check
        check (length(trim(display_name)) between 1 and 100),

    constraint app_user_email_length_check
        check (email is null or length(email) <= 255),

    constraint app_user_avatar_url_check
        check (avatar_url is null or avatar_url ~ '^https://')
);

-- app_user 更新时自动刷新 updated_at
create trigger app_user_set_updated_at
before update on public.app_user
for each row
execute function public.set_updated_at();

-- Auth 用户创建后，自动创建 app_user 业务资料
-- email 暂不自动写入 app_user，避免邮箱唯一约束在重新注册等边界场景中阻塞流程
-- display_name 优先使用 Auth metadata 中的 display_name，其次使用 name，最后使用默认名称
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.app_user (
        id,
        display_name,
        email
    )
    values (
        new.id,
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
            nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
            '未命名用户'
        ),
        null
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

-- 当 auth.users 插入新用户时，同步创建 app_user
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- 账本表
-- 一个用户可以拥有多个账本，多个用户也可以共同使用同一个账本
-- 账本是账户、分类、商家、记账记录等业务数据的归属边界
create table public.ledger (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    base_currency text not null default 'JPY',
    owner_user_id uuid not null references public.app_user(id),

    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    constraint ledger_name_check
        check (length(trim(name)) between 1 and 100),

    constraint ledger_base_currency_check
        check (base_currency ~ '^[A-Z]{3}$'),

    constraint ledger_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

-- ledger 更新时自动刷新 updated_at
create trigger ledger_set_updated_at
before update on public.ledger
for each row
execute function public.set_updated_at();

-- 按 owner_user_id 查询账本时使用
create index ledger_owner_user_id_idx
on public.ledger (owner_user_id);

-- 查询未归档账本时使用
create index ledger_active_idx
on public.ledger (id)
where is_archived = false;

-- 账本成员表
-- 权限判断的事实来源是 ledger_member，而不是 ledger.owner_user_id
-- active 成员可以访问该账本业务数据，invited / removed 成员不能访问账本业务数据
create table public.ledger_member (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,
    user_id uuid not null references public.app_user(id) on delete restrict,

    role text not null default 'member',
    status text not null default 'invited',

    invited_by uuid references public.app_user(id),
    invited_at timestamptz not null default now(),
    joined_at timestamptz,

    removed_by uuid references public.app_user(id),
    removed_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint ledger_member_id_ledger_id_unique
        unique (id, ledger_id),

    constraint ledger_member_role_check
        check (role in ('owner', 'admin', 'member', 'viewer')),

    constraint ledger_member_status_check
        check (status in ('active', 'invited', 'removed')),

    constraint ledger_member_status_time_check
        check (
            (
                status = 'invited'
                and joined_at is null
                and removed_at is null
                and removed_by is null
            )
            or
            (
                status = 'active'
                and joined_at is not null
                and removed_at is null
                and removed_by is null
            )
            or
            (
                status = 'removed'
                and removed_at is not null
            )
        )
);

-- ledger_member 更新时自动刷新 updated_at
create trigger ledger_member_set_updated_at
before update on public.ledger_member
for each row
execute function public.set_updated_at();

-- 同一账本内 active owner 只能有一个
create unique index ledger_member_active_owner_unique
on public.ledger_member (ledger_id)
where role = 'owner' and status = 'active';

-- 同一账本内，同一用户在未 removed 状态下只能有一条成员关系
-- removed 后允许以后重新加入
create unique index ledger_member_not_removed_user_unique
on public.ledger_member (ledger_id, user_id)
where status <> 'removed';

-- 按用户查询自己加入或被邀请的账本时使用
create index ledger_member_user_id_idx
on public.ledger_member (user_id);

-- RLS 判断某个账本 active 成员时使用
create index ledger_member_active_ledger_user_idx
on public.ledger_member (ledger_id, user_id)
where status = 'active';

-- 账户表
-- 用于管理现金、银行卡、信用卡、电子钱包等账户
-- current_balance 保存当前余额，由 transaction_item.balance_delta 维护
create table public.account (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,

    name text not null,
    type text not null,
    currency text not null default 'JPY',

    initial_balance numeric(14,2) not null default 0,
    current_balance numeric(14,2) not null default 0,

    closing_day integer,
    payment_due_day integer,
    credit_limit numeric(14,2),

    sort_order integer not null default 0,

    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint account_id_ledger_id_unique
        unique (id, ledger_id),

    constraint account_name_check
        check (length(trim(name)) between 1 and 100),

    constraint account_type_check
        check (type in ('cash', 'bank', 'credit_card', 'e_money', 'other')),

    constraint account_currency_check
        check (currency ~ '^[A-Z]{3}$'),

    constraint account_closing_day_check
        check (closing_day is null or closing_day between 1 and 31),

    constraint account_payment_due_day_check
        check (payment_due_day is null or payment_due_day between 1 and 31),

    constraint account_credit_limit_check
        check (credit_limit is null or credit_limit > 0),

    constraint account_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

-- 账户创建时，将当前余额初始化为初始余额
create or replace function public.set_account_initial_current_balance()
returns trigger
language plpgsql
as $$
begin
    new.current_balance = new.initial_balance;
    return new;
end;
$$;

create trigger account_set_initial_current_balance
before insert on public.account
for each row
execute function public.set_account_initial_current_balance();

-- account 更新时自动刷新 updated_at
create trigger account_set_updated_at
before update on public.account
for each row
execute function public.set_updated_at();

-- 同一账本下，未归档账户名称不能重复
create unique index account_active_name_unique
on public.account (ledger_id, lower(name))
where is_archived = false;

-- 按账本查询账户列表时使用
create index account_ledger_id_idx
on public.account (ledger_id);

-- 查询未归档账户时使用
create index account_active_idx
on public.account (ledger_id, sort_order, id)
where is_archived = false;

-- 分类表
-- 分类采用大分类 / 小分类两级结构
-- parent_id 为空表示大分类，parent_id 不为空表示小分类
-- 记账时后续业务规则要求选择小分类，不能只选择大分类
create table public.category (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,
    parent_id uuid,

    type text not null,
    name text not null,

    icon_name text,
    color text,

    sort_order integer not null default 0,

    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint category_id_ledger_id_unique
        unique (id, ledger_id),

    -- 保证子分类只能引用同一账本内的父分类
    constraint category_parent_same_ledger_fk
        foreign key (parent_id, ledger_id)
        references public.category (id, ledger_id)
        on delete restrict,

    constraint category_type_check
        check (type in ('expense', 'income')),

    constraint category_name_check
        check (length(trim(name)) between 1 and 100),

    constraint category_icon_name_check
        check (icon_name is null or length(icon_name) <= 100),

    constraint category_color_check
        check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),

    constraint category_parent_not_self_check
        check (parent_id is null or parent_id <> id),

    constraint category_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

-- category 更新时自动刷新 updated_at
create trigger category_set_updated_at
before update on public.category
for each row
execute function public.set_updated_at();

-- 同一账本下，未归档大分类名称不能重复
-- parent_id 为 null 时不能直接放进同一个 unique index，否则 Postgres 会把 null 当作不相等
create unique index category_active_root_name_unique
on public.category (ledger_id, type, lower(name))
where parent_id is null and is_archived = false;

-- 同一账本下，同一大分类下面，未归档小分类名称不能重复
create unique index category_active_child_name_unique
on public.category (ledger_id, parent_id, type, lower(name))
where parent_id is not null and is_archived = false;

-- 按账本和父分类查询分类列表时使用
create index category_ledger_parent_idx
on public.category (ledger_id, parent_id, sort_order, id);

-- 查询未归档分类时使用
create index category_active_idx
on public.category (ledger_id, type, parent_id, sort_order, id)
where is_archived = false;

-- 商家表
-- 用于记录消费或收入关联的商家 / 店铺 / 平台
-- MVP 阶段商家网址只作为参考信息保存，不自动抓取任意外部 URL
-- 商家 icon 后续可通过服务端流程抓取、上传后写入 icon_url
create table public.merchant (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,

    name text not null,
    website_url text,
    icon_url text,

    icon_fetch_status text not null default 'none',
    icon_fetched_at timestamptz,
    icon_fetch_error text,

    sort_order integer not null default 0,

    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint merchant_id_ledger_id_unique
        unique (id, ledger_id),

    constraint merchant_name_check
        check (length(trim(name)) between 1 and 100),

    constraint merchant_website_url_check
        check (website_url is null or website_url ~ '^https?://'),

    constraint merchant_icon_url_check
        check (icon_url is null or icon_url ~ '^https://'),

    constraint merchant_icon_fetch_status_check
        check (icon_fetch_status in ('none', 'pending', 'success', 'failed')),

    constraint merchant_icon_fetch_error_check
        check (icon_fetch_error is null or length(icon_fetch_error) <= 1000),

    constraint merchant_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

-- merchant 更新时自动刷新 updated_at
create trigger merchant_set_updated_at
before update on public.merchant
for each row
execute function public.set_updated_at();

-- 同一账本下，未归档商家名称不能重复
create unique index merchant_active_name_unique
on public.merchant (ledger_id, lower(name))
where is_archived = false;

-- 按账本查询商家列表时使用
create index merchant_ledger_id_idx
on public.merchant (ledger_id);

-- 查询未归档商家时使用
create index merchant_active_idx
on public.merchant (ledger_id, sort_order, id)
where is_archived = false;

-- 记账主表
-- 表示一笔完整记账，例如一笔支出、一笔收入、一笔转账、一笔退款或一笔报销
-- 主表不保存总金额，金额统计统一从 transaction_item 汇总
-- 删除记账采用软删除，通过 status = 'deleted' 表示
create table public.transaction_record (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,

    type text not null,
    status text not null default 'active',

    transaction_at timestamptz not null,
    merchant_id uuid,

    title text,
    note text,

    discount_amount numeric(14,2) not null default 0,
    discount_allocation_method text not null default 'none',

    deleted_by uuid references public.app_user(id),
    deleted_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint transaction_record_id_ledger_id_unique
        unique (id, ledger_id),

    -- 保证商家只能引用同一账本内的商家
    constraint transaction_record_merchant_same_ledger_fk
        foreign key (merchant_id, ledger_id)
        references public.merchant (id, ledger_id)
        on delete restrict,

    constraint transaction_record_type_check
        check (type in ('expense', 'income', 'transfer', 'refund', 'reimbursement')),

    constraint transaction_record_status_check
        check (status in ('active', 'deleted')),

    constraint transaction_record_title_check
        check (title is null or length(trim(title)) between 1 and 200),

    constraint transaction_record_note_check
        check (note is null or length(note) <= 2000),

    constraint transaction_record_discount_amount_check
        check (discount_amount >= 0),

    constraint transaction_record_discount_allocation_method_check
        check (discount_allocation_method in ('none', 'proportional', 'manual')),

    constraint transaction_record_deleted_check
        check (
            (status = 'active' and deleted_at is null and deleted_by is null)
            or
            (status = 'deleted' and deleted_at is not null)
        )
);

-- transaction_record 更新时自动刷新 updated_at
create trigger transaction_record_set_updated_at
before update on public.transaction_record
for each row
execute function public.set_updated_at();

-- 按账本和发生时间查询记账列表时使用
create index transaction_record_ledger_transaction_at_idx
on public.transaction_record (ledger_id, transaction_at desc, id desc);

-- 查询未删除记账时使用
create index transaction_record_active_idx
on public.transaction_record (ledger_id, transaction_at desc, id desc)
where status = 'active';

-- 按商家查询记账时使用
create index transaction_record_merchant_id_idx
on public.transaction_record (merchant_id)
where merchant_id is not null;

-- 记账明细表
-- 一笔 transaction_record 可以包含多条 transaction_item
-- amount 表示统计用金额，balance_delta 表示账户余额实际变化
-- 例如支出为负向余额变化，收入 / 退款 / 报销通常为正向余额变化
create table public.transaction_item (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null,
    transaction_record_id uuid not null,

    account_id uuid not null,
    category_id uuid,

    stat_type text not null,

    amount numeric(14,2) not null default 0,
    discount_amount numeric(14,2) not null default 0,
    balance_delta numeric(14,2) not null default 0,

    note text,
    sort_order integer not null default 0,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint transaction_item_id_ledger_id_unique
        unique (id, ledger_id),

    -- 保证明细只能属于同一账本内的记账主表
    constraint transaction_item_record_same_ledger_fk
        foreign key (transaction_record_id, ledger_id)
        references public.transaction_record (id, ledger_id)
        on delete restrict,

    -- 保证账户只能引用同一账本内的账户
    constraint transaction_item_account_same_ledger_fk
        foreign key (account_id, ledger_id)
        references public.account (id, ledger_id)
        on delete restrict,

    -- 保证分类只能引用同一账本内的分类
    constraint transaction_item_category_same_ledger_fk
        foreign key (category_id, ledger_id)
        references public.category (id, ledger_id)
        on delete restrict,

    constraint transaction_item_stat_type_check
        check (stat_type in ('expense', 'income', 'expense_offset', 'transfer')),

    constraint transaction_item_amount_check
        check (amount >= 0),

    constraint transaction_item_discount_amount_check
        check (discount_amount >= 0),

    constraint transaction_item_discount_not_greater_than_amount_check
        check (discount_amount <= amount),

    constraint transaction_item_note_check
        check (note is null or length(note) <= 1000),

    -- 转账明细不使用分类；其他统计类型原则上需要分类
    -- 是否必须为小分类，后续由应用层或数据库 trigger 进一步校验
    constraint transaction_item_category_required_check
        check (
            (stat_type = 'transfer' and category_id is null)
            or
            (stat_type <> 'transfer' and category_id is not null)
        )
);

-- transaction_item 更新时自动刷新 updated_at
create trigger transaction_item_set_updated_at
before update on public.transaction_item
for each row
execute function public.set_updated_at();

-- 按记账主表查询明细时使用
create index transaction_item_record_id_idx
on public.transaction_item (transaction_record_id, sort_order, id);

-- 按账本和账户查询余额流水时使用
create index transaction_item_account_id_idx
on public.transaction_item (ledger_id, account_id, created_at desc, id desc);

-- 按账本和分类统计金额时使用
create index transaction_item_category_id_idx
on public.transaction_item (ledger_id, category_id)
where category_id is not null;

-- 按统计类型汇总时使用
create index transaction_item_stat_type_idx
on public.transaction_item (ledger_id, stat_type);

-- 预算表
-- 用于按月设置分类预算
-- 可以针对大分类或小分类设置预算
-- scope 用于表示预算统计范围：仅当前分类，或包含子分类
create table public.budget (
    id uuid primary key default gen_random_uuid(),

    ledger_id uuid not null references public.ledger(id) on delete restrict,
    category_id uuid not null,

    budget_month date not null,
    scope text not null default 'category_only',

    amount numeric(14,2) not null,

    note text,

    is_archived boolean not null default false,
    archived_by uuid references public.app_user(id),
    archived_at timestamptz,

    created_by uuid references public.app_user(id),
    created_at timestamptz not null default now(),
    updated_by uuid references public.app_user(id),
    updated_at timestamptz not null default now(),

    -- 用于其他业务表通过 (id, ledger_id) 做组合外键，避免跨账本引用
    constraint budget_id_ledger_id_unique
        unique (id, ledger_id),

    -- 保证预算只能引用同一账本内的分类
    constraint budget_category_same_ledger_fk
        foreign key (category_id, ledger_id)
        references public.category (id, ledger_id)
        on delete restrict,

    constraint budget_month_check
        check (extract(day from budget_month) = 1),

    constraint budget_scope_check
        check (scope in ('category_only', 'category_with_children')),

    constraint budget_amount_check
        check (amount > 0),

    constraint budget_note_check
        check (note is null or length(note) <= 1000),

    constraint budget_archive_check
        check (
            (is_archived = false and archived_at is null and archived_by is null)
            or
            (is_archived = true and archived_at is not null)
        )
);

-- budget 更新时自动刷新 updated_at
create trigger budget_set_updated_at
before update on public.budget
for each row
execute function public.set_updated_at();

-- 同一账本、同一月份、同一分类、同一统计范围下，未归档预算不能重复
create unique index budget_active_unique
on public.budget (ledger_id, category_id, budget_month, scope)
where is_archived = false;

-- 按账本和月份查询预算时使用
create index budget_ledger_month_idx
on public.budget (ledger_id, budget_month);

-- 按分类查询预算时使用
create index budget_category_id_idx
on public.budget (ledger_id, category_id);

-- 查询未归档预算时使用
create index budget_active_idx
on public.budget (ledger_id, budget_month, category_id)
where is_archived = false;

-- 账户余额原子更新函数
-- 用于在服务端业务流程或数据库事务中安全更新 account.current_balance
-- 不允许前端客户端随意直接覆盖 current_balance
create or replace function public.apply_account_balance_delta(
    p_ledger_id uuid,
    p_account_id uuid,
    p_delta numeric,
    p_updated_by uuid default null
)
returns public.account
language plpgsql
security definer
set search_path = public
as $$
declare
    v_account public.account;
begin
    if p_delta is null then
        raise exception '账户余额变动值不能为空';
    end if;

    update public.account
    set
        current_balance = current_balance + p_delta,
        updated_by = p_updated_by
    where id = p_account_id
      and ledger_id = p_ledger_id
      and is_archived = false
    returning * into v_account;

    if not found then
        raise exception '账户不存在、账本不匹配或账户已归档';
    end if;

    return v_account;
end;
$$;

-- 默认撤销公开执行权限，避免客户端直接调用余额更新函数
revoke all on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) from public;
revoke all on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) from anon;
revoke all on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) from authenticated;

-- 仅允许服务端使用 service_role 调用
grant execute on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) to service_role;

-- 创建账本并同时创建 owner 成员关系
-- 该流程必须原子化，避免账本已创建但 owner 成员关系缺失
create or replace function public.create_ledger_with_owner(
    p_name text,
    p_base_currency text default 'JPY'
)
returns public.ledger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_ledger public.ledger;
begin
    v_user_id = auth.uid();

    if v_user_id is null then
        raise exception '必须登录后才能创建账本';
    end if;

    if not exists (
        select 1
        from public.app_user au
        where au.id = v_user_id
          and au.status = 'active'
    ) then
        raise exception '当前用户不存在或已停用';
    end if;

    insert into public.ledger (
        name,
        base_currency,
        owner_user_id,
        created_by,
        updated_by
    )
    values (
        p_name,
        p_base_currency,
        v_user_id,
        v_user_id,
        v_user_id
    )
    returning * into v_ledger;

    insert into public.ledger_member (
        ledger_id,
        user_id,
        role,
        status,
        invited_by,
        invited_at,
        joined_at,
        created_by,
        updated_by
    )
    values (
        v_ledger.id,
        v_user_id,
        'owner',
        'active',
        v_user_id,
        now(),
        now(),
        v_user_id,
        v_user_id
    );

    return v_ledger;
end;
$$;

-- 默认撤销公开执行权限
revoke all on function public.create_ledger_with_owner(text, text) from public;
revoke all on function public.create_ledger_with_owner(text, text) from anon;

-- 登录用户可以通过该 RPC 创建自己的账本
grant execute on function public.create_ledger_with_owner(text, text) to authenticated;

-- 接受账本邀请
-- 被邀请用户可以将自己的 ledger_member 状态从 invited 更新为 active
-- 不允许通过该流程修改 ledger_id、user_id、role 等关键字段
create or replace function public.accept_ledger_invitation(
    p_ledger_member_id uuid
)
returns public.ledger_member
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_member public.ledger_member;
begin
    v_user_id = auth.uid();

    if v_user_id is null then
        raise exception '必须登录后才能接受邀请';
    end if;

    if not exists (
        select 1
        from public.app_user au
        where au.id = v_user_id
          and au.status = 'active'
    ) then
        raise exception '当前用户不存在或已停用';
    end if;

    update public.ledger_member
    set
        status = 'active',
        joined_at = now(),
        updated_by = v_user_id
    where id = p_ledger_member_id
      and user_id = v_user_id
      and status = 'invited'
    returning * into v_member;

    if not found then
        raise exception '邀请不存在、已处理，或不属于当前用户';
    end if;

    return v_member;
end;
$$;

-- 默认撤销公开执行权限
revoke all on function public.accept_ledger_invitation(uuid) from public;
revoke all on function public.accept_ledger_invitation(uuid) from anon;

-- 登录用户可以通过该 RPC 接受自己的邀请
grant execute on function public.accept_ledger_invitation(uuid) to authenticated;

-- 判断当前登录用户是否为 active 状态
-- RLS policy 会反复使用该函数
create or replace function public.current_app_user_is_active()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.app_user au
        where au.id = auth.uid()
          and au.status = 'active'
    );
$$;

-- 判断当前登录用户是否为指定账本的 active 成员
-- 账本业务数据的读取和写入主要依赖该函数
create or replace function public.current_user_is_active_ledger_member(
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
          and lm.status = 'active'
          and au.status = 'active'
    );
$$;

-- 判断当前登录用户是否可以维护指定账本的数据
-- MVP 阶段采用简单协作模型：active 用户 + active 成员即可维护账本内基础业务数据
create or replace function public.current_user_can_write_ledger(
    p_ledger_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select public.current_user_is_active_ledger_member(p_ledger_id);
$$;

-- 默认撤销公开执行权限
revoke all on function public.current_app_user_is_active() from public;
revoke all on function public.current_user_is_active_ledger_member(uuid) from public;
revoke all on function public.current_user_can_write_ledger(uuid) from public;

-- RLS policy 中需要 authenticated 用户可以执行这些判断函数
grant execute on function public.current_app_user_is_active() to authenticated;
grant execute on function public.current_user_is_active_ledger_member(uuid) to authenticated;
grant execute on function public.current_user_can_write_ledger(uuid) to authenticated;

-- 启用 Row Level Security
-- 业务表必须启用 RLS，避免前端直接访问时绕过账本权限边界
alter table public.app_user enable row level security;
alter table public.ledger enable row level security;
alter table public.ledger_member enable row level security;
alter table public.account enable row level security;
alter table public.category enable row level security;
alter table public.merchant enable row level security;
alter table public.transaction_record enable row level security;
alter table public.transaction_item enable row level security;
alter table public.budget enable row level security;

-- app_user RLS policy
-- 用户可以读取自己的 profile
-- active 用户也可以读取与自己同属 active 账本的成员 profile，用于显示成员名称和头像
create policy app_user_select_self_or_same_ledger_member
on public.app_user
for select
to authenticated
using (
    id = auth.uid()
    or
    (
        public.current_app_user_is_active()
        and exists (
            select 1
            from public.ledger_member lm_self
            join public.ledger_member lm_target
              on lm_target.ledger_id = lm_self.ledger_id
            where lm_self.user_id = auth.uid()
              and lm_self.status = 'active'
              and lm_target.user_id = app_user.id
              and lm_target.status = 'active'
        )
    )
);

-- 普通用户不直接 insert app_user
-- app_user 由 auth.users trigger 自动创建，因此这里不创建 insert policy

-- 用户只能更新自己的 profile 行
-- MVP 阶段允许更新 display_name、avatar_url、email 等 profile 字段
-- status 停用等管理操作后续通过服务端管理流程处理
create policy app_user_update_self
on public.app_user
for update
to authenticated
using (
    id = auth.uid()
    and public.current_app_user_is_active()
)
with check (
    id = auth.uid()
    and status = 'active'
);

-- ledger RLS policy
-- active 成员可以读取自己所在的账本
create policy ledger_select_active_member
on public.ledger
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(id)
);

-- active 用户可以创建 owner_user_id 为自己的账本
-- 实际创建账本推荐使用 create_ledger_with_owner RPC，同时创建 owner 成员关系
create policy ledger_insert_self_owner
on public.ledger
for insert
to authenticated
with check (
    owner_user_id = auth.uid()
    and public.current_app_user_is_active()
);

-- active 成员可以更新账本
-- MVP 阶段采用简单协作模型，不细分 owner / admin / member 权限
create policy ledger_update_active_member
on public.ledger
for update
to authenticated
using (
    public.current_user_can_write_ledger(id)
)
with check (
    public.current_user_can_write_ledger(id)
);

-- MVP 阶段不开放普通用户物理删除 ledger
-- 账本删除 / 注销 / 数据转移后续单独设计

-- ledger_member 关键身份字段保护
-- 防止普通 update 修改 ledger_id、user_id、role 等字段
-- 邀请接受时只允许改变 status、joined_at、updated_by、updated_at 等状态字段
create or replace function public.prevent_ledger_member_identity_change()
returns trigger
language plpgsql
as $$
begin
    if old.id <> new.id then
        raise exception '不允许修改账本成员 id';
    end if;

    if old.ledger_id <> new.ledger_id then
        raise exception '不允许修改账本成员所属账本';
    end if;

    if old.user_id <> new.user_id then
        raise exception '不允许修改账本成员用户';
    end if;

    if old.role <> new.role then
        raise exception '不允许直接修改账本成员角色';
    end if;

    return new;
end;
$$;

create trigger ledger_member_prevent_identity_change
before update on public.ledger_member
for each row
execute function public.prevent_ledger_member_identity_change();

-- ledger_member RLS policy
-- active 成员可以读取同账本成员信息
-- 用户也可以读取自己的 ledger_member 行，用于查看和接受邀请；该规则不限 status
create policy ledger_member_select_same_ledger_or_self
on public.ledger_member
for select
to authenticated
using (
    user_id = auth.uid()
    or public.current_user_is_active_ledger_member(ledger_id)
);

-- active 成员可以邀请新成员
-- MVP 阶段普通邀请流程只允许创建 role = member、status = invited 的成员记录
create policy ledger_member_insert_invited_member
on public.ledger_member
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
    and role = 'member'
    and status = 'invited'
    and invited_by = auth.uid()
);

-- 被邀请用户可以接受自己的邀请
-- 只允许从 invited 变为 active；ledger_id、user_id、role 由 trigger 防止被修改
create policy ledger_member_accept_own_invitation
on public.ledger_member
for update
to authenticated
using (
    user_id = auth.uid()
    and status = 'invited'
    and public.current_app_user_is_active()
)
with check (
    user_id = auth.uid()
    and status = 'active'
    and joined_at is not null
    and removed_at is null
    and removed_by is null
    and public.current_app_user_is_active()
);

-- MVP 阶段不开放普通用户物理删除 ledger_member
-- 成员移除后续通过 status = removed 或专用服务端流程处理

-- account RLS policy
-- active 成员可以读取同账本账户
create policy account_select_active_member
on public.account
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
);

-- active 成员可以新增同账本账户
create policy account_insert_active_member
on public.account
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- active 成员可以更新同账本账户
create policy account_update_active_member
on public.account
for update
to authenticated
using (
    public.current_user_can_write_ledger(ledger_id)
)
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- MVP 阶段不开放普通用户物理删除 account


-- category RLS policy
-- active 成员可以读取同账本分类
create policy category_select_active_member
on public.category
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
);

-- active 成员可以新增同账本分类
create policy category_insert_active_member
on public.category
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- active 成员可以更新同账本分类
create policy category_update_active_member
on public.category
for update
to authenticated
using (
    public.current_user_can_write_ledger(ledger_id)
)
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- MVP 阶段不开放普通用户物理删除 category


-- merchant RLS policy
-- active 成员可以读取同账本商家
create policy merchant_select_active_member
on public.merchant
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
);

-- active 成员可以新增同账本商家
create policy merchant_insert_active_member
on public.merchant
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- active 成员可以更新同账本商家
create policy merchant_update_active_member
on public.merchant
for update
to authenticated
using (
    public.current_user_can_write_ledger(ledger_id)
)
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- MVP 阶段不开放普通用户物理删除 merchant


-- budget RLS policy
-- active 成员可以读取同账本预算
create policy budget_select_active_member
on public.budget
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
);

-- active 成员可以新增同账本预算
create policy budget_insert_active_member
on public.budget
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- active 成员可以更新同账本预算
create policy budget_update_active_member
on public.budget
for update
to authenticated
using (
    public.current_user_can_write_ledger(ledger_id)
)
with check (
    public.current_user_can_write_ledger(ledger_id)
);

-- MVP 阶段不开放普通用户物理删除 budget

-- transaction_record RLS policy
-- active 成员可以读取同账本、未删除的记账主记录
create policy transaction_record_select_active_member
on public.transaction_record
for select
to authenticated
using (
    transaction_record.status = 'active'
    and public.current_user_is_active_ledger_member(transaction_record.ledger_id)
);

-- active 成员可以新增同账本记账主记录
-- 如有关联商家，商家必须属于同一账本且未归档
create policy transaction_record_insert_active_member
on public.transaction_record
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(transaction_record.ledger_id)
    and transaction_record.status = 'active'
    and (
        transaction_record.merchant_id is null
        or exists (
            select 1
            from public.merchant m
            where m.id = transaction_record.merchant_id
              and m.ledger_id = transaction_record.ledger_id
              and m.is_archived = false
        )
    )
);

-- active 成员可以更新同账本记账主记录
-- 包括将 status 改为 deleted 的软删除操作
-- 如有关联商家，商家必须属于同一账本且未归档
create policy transaction_record_update_active_member
on public.transaction_record
for update
to authenticated
using (
    public.current_user_can_write_ledger(transaction_record.ledger_id)
)
with check (
    public.current_user_can_write_ledger(transaction_record.ledger_id)
    and (
        transaction_record.merchant_id is null
        or exists (
            select 1
            from public.merchant m
            where m.id = transaction_record.merchant_id
              and m.ledger_id = transaction_record.ledger_id
              and m.is_archived = false
        )
    )
);

-- MVP 阶段不开放普通用户物理删除 transaction_record
-- 删除记账使用 status = deleted、deleted_by、deleted_at


-- transaction_item RLS policy
-- active 成员可以读取同账本明细
-- 但必须联动 transaction_record.status = active，避免软删除主记录后仍可读取明细
create policy transaction_item_select_active_record
on public.transaction_item
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(transaction_item.ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_item.transaction_record_id
          and tr.ledger_id = transaction_item.ledger_id
          and tr.status = 'active'
    )
);

-- active 成员可以新增同账本记账明细
-- 记账主表必须存在且为 active
-- 账户必须未归档
-- 如有关联分类，分类必须未归档
create policy transaction_item_insert_active_member
on public.transaction_item
for insert
to authenticated
with check (
    public.current_user_can_write_ledger(transaction_item.ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_item.transaction_record_id
          and tr.ledger_id = transaction_item.ledger_id
          and tr.status = 'active'
    )
    and exists (
        select 1
        from public.account a
        where a.id = transaction_item.account_id
          and a.ledger_id = transaction_item.ledger_id
          and a.is_archived = false
    )
    and (
        transaction_item.category_id is null
        or exists (
            select 1
            from public.category c
            where c.id = transaction_item.category_id
              and c.ledger_id = transaction_item.ledger_id
              and c.is_archived = false
        )
    )
);

-- active 成员可以更新同账本记账明细
-- 仅允许更新仍属于 active 记账主表的明细
create policy transaction_item_update_active_member
on public.transaction_item
for update
to authenticated
using (
    public.current_user_can_write_ledger(transaction_item.ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_item.transaction_record_id
          and tr.ledger_id = transaction_item.ledger_id
          and tr.status = 'active'
    )
)
with check (
    public.current_user_can_write_ledger(transaction_item.ledger_id)
    and exists (
        select 1
        from public.transaction_record tr
        where tr.id = transaction_item.transaction_record_id
          and tr.ledger_id = transaction_item.ledger_id
          and tr.status = 'active'
    )
    and exists (
        select 1
        from public.account a
        where a.id = transaction_item.account_id
          and a.ledger_id = transaction_item.ledger_id
          and a.is_archived = false
    )
    and (
        transaction_item.category_id is null
        or exists (
            select 1
            from public.category c
            where c.id = transaction_item.category_id
              and c.ledger_id = transaction_item.ledger_id
              and c.is_archived = false
        )
    )
);

-- MVP 阶段不开放普通用户物理删除 transaction_item
-- 记账删除优先通过 transaction_record 软删除处理

-- 防止普通 update 直接覆盖 account.current_balance
-- current_balance 只能通过受控流程更新，例如 apply_account_balance_delta
create or replace function public.prevent_direct_account_balance_update()
returns trigger
language plpgsql
as $$
begin
    if old.current_balance is distinct from new.current_balance then
        if current_setting('app.allow_account_balance_update', true) is distinct from 'true' then
            raise exception '不允许直接修改账户当前余额，请通过受控余额更新流程处理';
        end if;
    end if;

    return new;
end;
$$;

create trigger account_prevent_direct_balance_update
before update on public.account
for each row
execute function public.prevent_direct_account_balance_update();

-- 重新定义账户余额原子更新函数
-- 在函数内部临时允许 current_balance 更新，避免被 account_prevent_direct_balance_update 拦截
create or replace function public.apply_account_balance_delta(
    p_ledger_id uuid,
    p_account_id uuid,
    p_delta numeric,
    p_updated_by uuid default null
)
returns public.account
language plpgsql
security definer
set search_path = public
as $$
declare
    v_account public.account;
begin
    if p_delta is null then
        raise exception '账户余额变动值不能为空';
    end if;

    -- 当前事务内临时允许受控余额更新
    perform set_config('app.allow_account_balance_update', 'true', true);

    update public.account
    set
        current_balance = current_balance + p_delta,
        updated_by = p_updated_by
    where id = p_account_id
      and ledger_id = p_ledger_id
      and is_archived = false
    returning * into v_account;

    if not found then
        raise exception '账户不存在、账本不匹配或账户已归档';
    end if;

    return v_account;
end;
$$;

-- 重新设置函数权限
revoke all on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) from public;
revoke all on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) from anon;
revoke all on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) from authenticated;
grant execute on function public.apply_account_balance_delta(uuid, uuid, numeric, uuid) to service_role;

-- 分类业务校验
-- 1. 子分类的 type 必须与父分类一致
-- 2. 只允许两级分类：大分类 / 小分类，不允许小分类下面再挂子分类
-- 3. 未归档子分类不能挂到已归档父分类下面
create or replace function public.validate_category_parent()
returns trigger
language plpgsql
as $$
declare
    v_parent_type text;
    v_parent_parent_id uuid;
    v_parent_is_archived boolean;
begin
    if new.parent_id is null then
        return new;
    end if;

    select
        c.type,
        c.parent_id,
        c.is_archived
    into
        v_parent_type,
        v_parent_parent_id,
        v_parent_is_archived
    from public.category c
    where c.id = new.parent_id
      and c.ledger_id = new.ledger_id;

    if not found then
        raise exception '父分类不存在或不属于同一账本';
    end if;

    if v_parent_parent_id is not null then
        raise exception '分类只允许大分类 / 小分类两级结构';
    end if;

    if v_parent_type <> new.type then
        raise exception '子分类类型必须与父分类类型一致';
    end if;

    if new.is_archived = false and v_parent_is_archived = true then
        raise exception '未归档子分类不能挂到已归档父分类下面';
    end if;

    return new;
end;
$$;

create trigger category_validate_parent
before insert or update on public.category
for each row
execute function public.validate_category_parent();


-- 预算业务校验
-- 新增或更新未归档预算时，不允许引用已归档分类
create or replace function public.validate_budget_category()
returns trigger
language plpgsql
as $$
begin
    if new.is_archived = false then
        if not exists (
            select 1
            from public.category c
            where c.id = new.category_id
              and c.ledger_id = new.ledger_id
              and c.is_archived = false
        ) then
            raise exception '预算不能引用不存在或已归档的分类';
        end if;
    end if;

    return new;
end;
$$;

create trigger budget_validate_category
before insert or update on public.budget
for each row
execute function public.validate_budget_category();

-- 记账主表业务校验
-- 新增或更新 active 记账时，不允许引用已归档商家
create or replace function public.validate_transaction_record()
returns trigger
language plpgsql
as $$
begin
    if new.status = 'active' and new.merchant_id is not null then
        if not exists (
            select 1
            from public.merchant m
            where m.id = new.merchant_id
              and m.ledger_id = new.ledger_id
              and m.is_archived = false
        ) then
            raise exception '记账记录不能引用不存在或已归档的商家';
        end if;
    end if;

    return new;
end;
$$;

create trigger transaction_record_validate
before insert or update on public.transaction_record
for each row
execute function public.validate_transaction_record();


-- 记账明细业务校验
-- 1. 明细必须属于 active 的记账主表
-- 2. 明细不能引用已归档账户
-- 3. 非 transfer 明细必须选择未归档小分类，不能只选择大分类
-- 4. transfer 明细不允许选择分类
-- 5. 分类类型需要与统计类型匹配
create or replace function public.validate_transaction_item()
returns trigger
language plpgsql
as $$
declare
    v_record_status text;
    v_account_is_archived boolean;
    v_category_type text;
    v_category_parent_id uuid;
    v_category_is_archived boolean;
begin
    select tr.status
    into v_record_status
    from public.transaction_record tr
    where tr.id = new.transaction_record_id
      and tr.ledger_id = new.ledger_id;

    if not found then
        raise exception '记账主记录不存在或不属于同一账本';
    end if;

    if v_record_status <> 'active' then
        raise exception '不能维护已删除记账记录的明细';
    end if;

    select a.is_archived
    into v_account_is_archived
    from public.account a
    where a.id = new.account_id
      and a.ledger_id = new.ledger_id;

    if not found then
        raise exception '账户不存在或不属于同一账本';
    end if;

    if v_account_is_archived = true then
        raise exception '记账明细不能引用已归档账户';
    end if;

    if new.stat_type = 'transfer' then
        if new.category_id is not null then
            raise exception '转账明细不能选择分类';
        end if;

        return new;
    end if;

    if new.category_id is null then
        raise exception '非转账明细必须选择分类';
    end if;

    select
        c.type,
        c.parent_id,
        c.is_archived
    into
        v_category_type,
        v_category_parent_id,
        v_category_is_archived
    from public.category c
    where c.id = new.category_id
      and c.ledger_id = new.ledger_id;

    if not found then
        raise exception '分类不存在或不属于同一账本';
    end if;

    if v_category_is_archived = true then
        raise exception '记账明细不能引用已归档分类';
    end if;

    if v_category_parent_id is null then
        raise exception '记账明细必须选择小分类，不能只选择大分类';
    end if;

    if new.stat_type = 'income' and v_category_type <> 'income' then
        raise exception '收入明细必须选择收入分类';
    end if;

    if new.stat_type in ('expense', 'expense_offset') and v_category_type <> 'expense' then
        raise exception '支出及支出抵消类明细必须选择支出分类';
    end if;

    return new;
end;
$$;

create trigger transaction_item_validate
before insert or update on public.transaction_item
for each row
execute function public.validate_transaction_item();

-- 记账明细余额变化方向校验
-- amount 是统计金额，balance_delta 是账户余额实际变化
-- MVP 阶段约定：
-- 1. expense 支出：balance_delta <= 0
-- 2. income 收入：balance_delta >= 0
-- 3. expense_offset 支出抵消，例如退款 / 报销：balance_delta >= 0
-- 4. transfer 转账：允许正负，由两条明细分别表示转出和转入
-- 允许 0 元记账，因此这里不强制非 0
create or replace function public.validate_transaction_item_balance_delta()
returns trigger
language plpgsql
as $$
begin
    if new.stat_type = 'expense' and new.balance_delta > 0 then
        raise exception '支出明细的账户余额变化不能为正数';
    end if;

    if new.stat_type = 'income' and new.balance_delta < 0 then
        raise exception '收入明细的账户余额变化不能为负数';
    end if;

    if new.stat_type = 'expense_offset' and new.balance_delta < 0 then
        raise exception '支出抵消明细的账户余额变化不能为负数';
    end if;

    return new;
end;
$$;

create trigger transaction_item_validate_balance_delta
before insert or update on public.transaction_item
for each row
execute function public.validate_transaction_item_balance_delta();

-- 基础表权限整理
-- RLS 负责限制用户能访问哪些行
-- 表权限负责限制角色能对表做哪些动作

-- 匿名用户不允许访问家庭账本业务数据
revoke all on table public.app_user from anon;
revoke all on table public.ledger from anon;
revoke all on table public.ledger_member from anon;
revoke all on table public.account from anon;
revoke all on table public.category from anon;
revoke all on table public.merchant from anon;
revoke all on table public.transaction_record from anon;
revoke all on table public.transaction_item from anon;
revoke all on table public.budget from anon;

-- 登录用户可以读取、新增、更新业务表
-- 实际能操作哪些行由 RLS policy 决定
grant select, update on table public.app_user to authenticated;

grant select, insert, update on table public.ledger to authenticated;
grant select, insert, update on table public.ledger_member to authenticated;
grant select, insert, update on table public.account to authenticated;
grant select, insert, update on table public.category to authenticated;
grant select, insert, update on table public.merchant to authenticated;
grant select, insert, update on table public.transaction_record to authenticated;
grant select, insert, update on table public.transaction_item to authenticated;
grant select, insert, update on table public.budget to authenticated;

-- MVP 阶段不授予 delete 权限
-- 删除 / 归档类操作通过 status 或 is_archived 字段表达

-- 收紧 RLS 辅助函数权限
-- 这些函数只需要 authenticated 在 RLS policy 中调用，不需要 anon 直接执行
revoke all on function public.current_app_user_is_active() from anon;
revoke all on function public.current_user_is_active_ledger_member(uuid) from anon;
revoke all on function public.current_user_can_write_ledger(uuid) from anon;

grant execute on function public.current_app_user_is_active() to authenticated;
grant execute on function public.current_user_is_active_ledger_member(uuid) to authenticated;
grant execute on function public.current_user_can_write_ledger(uuid) to authenticated;
