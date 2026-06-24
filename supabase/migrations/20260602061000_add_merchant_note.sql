-- KuraNote merchant note schema
-- Issue: #27

alter table public.merchant
add column note text;

alter table public.merchant
add constraint merchant_note_check
    check (note is null or length(note) <= 1000);
