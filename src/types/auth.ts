export type BaseActionState = {
  error?: string;
  success?: string;
};

export type RegisterActionState = BaseActionState & {
  resetPassword?: boolean;
};

export type LoginActionState = Pick<BaseActionState, "error">;

export type RegisterEmailAvailabilityState = Pick<BaseActionState, "error"> & {
  available: boolean;
  reason?: "email_exists";
};

export type RequestRegisterOtpActionState = BaseActionState & {
  retryAfterSeconds?: number;
  resetPassword?: boolean;
  resetTurnstile?: boolean;
  status?:
    | "success"
    | "validation_error"
    | "rate_limited"
    | "turnstile_failed"
    | "send_rate_limited"
    | "email_unavailable"
    | "unknown_error";
};

export type SubmitRegisterOtpActionState = BaseActionState & {
  redirectTo?: string;
  remainingAttempts?: number;
  status?:
    | "success"
    | "session_invalid"
    | "validation_error"
    | "otp_invalid"
    | "too_many_attempts"
    | "app_user_sync_failed"
    | "unknown_error";
};
