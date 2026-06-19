alter table public.auth_otp_attempt
drop constraint auth_otp_attempt_attempt_type_check;

alter table public.auth_otp_attempt
add constraint auth_otp_attempt_attempt_type_check
check (attempt_type in ('send', 'verify_failure', 'availability_check'));

create index auth_otp_attempt_purpose_ip_availability_check_created_at_idx
on public.auth_otp_attempt (purpose, ip_hash, created_at desc)
where attempt_type = 'availability_check';
