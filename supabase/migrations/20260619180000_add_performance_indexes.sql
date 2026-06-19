-- 补充性能优化索引
-- 对应 Issue：#228（本番环境整体卡顿调查）
-- 调查结论：以下查询模式在多处 loader 中高频出现，但缺少最优索引支撑

-- 1. ledger_member：getCurrentLedgerContext 在每次 protected 页面加载时都会执行
--    查询模式：WHERE user_id = ? AND status = 'active'
--    现有索引 ledger_member_user_id_idx (user_id) 需要回表过滤 status
--    补充此部分索引，仅索引 active 成员行，减少扫描范围
create index if not exists ledger_member_user_id_active_idx
on public.ledger_member (user_id)
where status = 'active';

-- 2. transaction_item：dashboard / statistics / transactions / transactionForm 等 loader
--    查询模式：WHERE ledger_id = ? AND transaction_record_id IN (...)
--    现有索引 transaction_item_record_id_idx (transaction_record_id, sort_order, id)
--    以 transaction_record_id 为前导列，ledger_id 需要回表过滤
--    补充此组合索引，让 ledger_id 过滤可在索引内完成
create index if not exists transaction_item_ledger_record_id_idx
on public.transaction_item (ledger_id, transaction_record_id);

-- 3. transaction_record：dashboard / statistics / transactions 查询均过滤
--    status = 'active' AND type IN ('expense', 'income')
--    现有部分索引 transaction_record_active_idx 的条件是 WHERE status = 'active'
--    未覆盖 type 过滤，需回表筛掉 transfer / refund / reimbursement 行
--    补充此更严格的部分索引，让类型过滤也在索引层完成
create index if not exists transaction_record_active_expense_income_idx
on public.transaction_record (ledger_id, transaction_at desc, id desc)
where status = 'active' and type in ('expense', 'income');
