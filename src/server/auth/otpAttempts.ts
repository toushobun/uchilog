import "server-only";

import { createServiceRoleClient } from "lib/supabase/serviceRole";

export type AuthOtpPurpose = "signup";
export type AuthOtpAttemptType =
  | "send"
  | "verify_failure"
  | "availability_check";
export type AuthOtpAttemptResult = "success" | "blocked" | "failed";

export type AuthOtpSendRateLimitResult =
  | { allowed: true; retryAfterSeconds: 0 }
  | { allowed: false; retryAfterSeconds: number };

type CreatedAtRow = {
  created_at: string;
};

type AuthOtpAttemptInsert = {
  attempt_type: AuthOtpAttemptType;
  email_hash: string;
  ip_hash: string;
  purpose: AuthOtpPurpose;
  result: AuthOtpAttemptResult;
};

const authOtpAttemptTable = "auth_otp_attempt";
const sendCooldownSeconds = 60;
const hourWindowSeconds = 60 * 60;
const dayWindowSeconds = 24 * hourWindowSeconds;
const emailHourLimit = 5;
const emailDayLimit = 10;
const ipHourLimit = 20;
const ipDayLimit = 100;
const emailSendLookupLimit = emailDayLimit + 1;
const ipSendLookupLimit = ipDayLimit + 1;
const availabilityCheckMinuteLimit = 10;
const availabilityCheckHourLimit = 100;
const availabilityCheckLookupLimit = availabilityCheckHourLimit + 1;

function toIsoBefore(now: Date, seconds: number) {
  return new Date(now.getTime() - seconds * 1000).toISOString();
}

function isCreatedAtRow(value: unknown): value is CreatedAtRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "created_at" in value &&
    typeof value.created_at === "string"
  );
}

function toCreatedAtRows(data: unknown): CreatedAtRow[] {
  return Array.isArray(data) ? data.filter(isCreatedAtRow) : [];
}

function secondsUntil(createdAt: string, windowSeconds: number, now: Date) {
  const expiresAt = new Date(createdAt).getTime() + windowSeconds * 1000;
  return Math.max(0, Math.ceil((expiresAt - now.getTime()) / 1000));
}

function getLimitRetryAfterSeconds(
  rows: CreatedAtRow[],
  limit: number,
  windowSeconds: number,
  now: Date,
) {
  if (rows.length < limit) {
    return 0;
  }

  const expiryIndex = rows.length - limit;
  return secondsUntil(rows[expiryIndex].created_at, windowSeconds, now);
}

async function loadSuccessfulSendRows(params: {
  column: "email_hash" | "ip_hash";
  hash: string;
  now: Date;
  purpose: AuthOtpPurpose;
  rowLimit: number;
  supabase: ReturnType<typeof createServiceRoleClient>;
}) {
  const { data, error } = await params.supabase
    .from(authOtpAttemptTable)
    .select("created_at")
    .eq("purpose", params.purpose)
    .eq("attempt_type", "send")
    .eq("result", "success")
    .eq(params.column, params.hash)
    .gte("created_at", toIsoBefore(params.now, dayWindowSeconds))
    .order("created_at", { ascending: false })
    .limit(params.rowLimit);

  if (error) {
    throw new Error("Failed to load auth OTP send attempts.");
  }

  return toCreatedAtRows(data).sort((left, right) =>
    left.created_at < right.created_at
      ? -1
      : left.created_at > right.created_at
        ? 1
        : 0,
  );
}

export async function checkAuthOtpSendRateLimit(params: {
  emailHash: string;
  // ipHash 必须来自可信 IP；无法识别 IP 时调用方应先拒绝发送。
  ipHash: string;
  now?: Date;
  purpose?: AuthOtpPurpose;
}): Promise<AuthOtpSendRateLimitResult> {
  const now = params.now ?? new Date();
  const purpose = params.purpose ?? "signup";
  const hourStartIso = toIsoBefore(now, hourWindowSeconds);
  const supabase = createServiceRoleClient();

  const [emailRows, ipRows] = await Promise.all([
    loadSuccessfulSendRows({
      column: "email_hash",
      hash: params.emailHash,
      now,
      purpose,
      rowLimit: emailSendLookupLimit,
      supabase,
    }),
    loadSuccessfulSendRows({
      column: "ip_hash",
      hash: params.ipHash,
      now,
      purpose,
      rowLimit: ipSendLookupLimit,
      supabase,
    }),
  ]);

  const retryAfterCandidates = [
    emailRows.length > 0
      ? secondsUntil(
          emailRows[emailRows.length - 1].created_at,
          sendCooldownSeconds,
          now,
        )
      : 0,
    getLimitRetryAfterSeconds(
      emailRows.filter((row) => row.created_at >= hourStartIso),
      emailHourLimit,
      hourWindowSeconds,
      now,
    ),
    getLimitRetryAfterSeconds(emailRows, emailDayLimit, dayWindowSeconds, now),
    getLimitRetryAfterSeconds(
      ipRows.filter((row) => row.created_at >= hourStartIso),
      ipHourLimit,
      hourWindowSeconds,
      now,
    ),
    getLimitRetryAfterSeconds(ipRows, ipDayLimit, dayWindowSeconds, now),
  ];
  const retryAfterSeconds = Math.max(...retryAfterCandidates);

  return retryAfterSeconds > 0
    ? { allowed: false, retryAfterSeconds }
    : { allowed: true, retryAfterSeconds: 0 };
}

export async function checkRegisterEmailAvailabilityRateLimit(params: {
  ipHash: string;
  now?: Date;
  purpose?: AuthOtpPurpose;
}): Promise<AuthOtpSendRateLimitResult> {
  const now = params.now ?? new Date();
  const purpose = params.purpose ?? "signup";
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from(authOtpAttemptTable)
    .select("created_at")
    .eq("purpose", purpose)
    .eq("attempt_type", "availability_check")
    .eq("ip_hash", params.ipHash)
    .gte("created_at", toIsoBefore(now, hourWindowSeconds))
    .order("created_at", { ascending: false })
    .limit(availabilityCheckLookupLimit);

  if (error) {
    throw new Error("Failed to load register email availability attempts.");
  }

  const rows = toCreatedAtRows(data).sort((left, right) =>
    left.created_at < right.created_at
      ? -1
      : left.created_at > right.created_at
        ? 1
        : 0,
  );
  const retryAfterSeconds = Math.max(
    getLimitRetryAfterSeconds(
      rows.filter(
        (row) => row.created_at >= toIsoBefore(now, sendCooldownSeconds),
      ),
      availabilityCheckMinuteLimit,
      sendCooldownSeconds,
      now,
    ),
    getLimitRetryAfterSeconds(
      rows,
      availabilityCheckHourLimit,
      hourWindowSeconds,
      now,
    ),
  );

  return retryAfterSeconds > 0
    ? { allowed: false, retryAfterSeconds }
    : { allowed: true, retryAfterSeconds: 0 };
}

export async function recordAuthOtpAttempt(params: AuthOtpAttemptInsert) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from(authOtpAttemptTable).insert(params);

  if (error) {
    throw new Error("Failed to record auth OTP attempt.");
  }
}

export async function countAuthOtpVerifyFailuresSinceLastSend(params: {
  emailHash: string;
  now?: Date;
  purpose?: AuthOtpPurpose;
}) {
  const now = params.now ?? new Date();
  const purpose = params.purpose ?? "signup";
  const supabase = createServiceRoleClient();
  const { data: latestSend, error: latestSendError } = await supabase
    .from(authOtpAttemptTable)
    .select("created_at")
    .eq("purpose", purpose)
    .eq("email_hash", params.emailHash)
    .eq("attempt_type", "send")
    .eq("result", "success")
    .gte("created_at", toIsoBefore(now, dayWindowSeconds))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSendError) {
    throw new Error("Failed to load latest auth OTP send attempt.");
  }

  if (!isCreatedAtRow(latestSend)) {
    return 0;
  }

  const { count, error: countError } = await supabase
    .from(authOtpAttemptTable)
    .select("id", { count: "exact", head: true })
    .eq("purpose", purpose)
    .eq("email_hash", params.emailHash)
    .eq("attempt_type", "verify_failure")
    .gt("created_at", latestSend.created_at);

  if (countError) {
    throw new Error("Failed to count auth OTP verify failures.");
  }

  return count ?? 0;
}
