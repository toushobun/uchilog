-- active 成员可以读取已关联到交易记录的归档标签，用于编辑页面回填历史标签名。
-- transaction_tag_select_active_member 只允许读取未归档标签，
-- 本策略补充允许读取"虽已归档但仍被某条 active 交易记录引用"的标签。

create policy transaction_tag_select_assigned_archived
on public.transaction_tag
for select
to authenticated
using (
    public.current_user_is_active_ledger_member(ledger_id)
    and exists (
        select 1
        from public.transaction_record_tag trt
        join public.transaction_record tr
          on tr.id = trt.transaction_record_id
         and tr.ledger_id = trt.ledger_id
        where trt.tag_id = transaction_tag.id
          and trt.ledger_id = transaction_tag.ledger_id
          and tr.status = 'active'
    )
);
