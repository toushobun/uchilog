"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { routePaths, routeWithQuery } from "config/paths";
import {
  displayNameMaxLength,
  emailMaxLength,
  isValidEmailFormat,
  isValidRegisterPassword,
  passwordMaxLength,
  passwordRuleMessage,
} from "lib/validators/auth";
import { createClient } from "lib/supabase/server";
import {
  countAuthOtpVerifyFailuresSinceLastSend,
  recordAuthOtpAttempt,
  checkAuthOtpSendRateLimit,
  checkRegisterEmailAvailabilityRateLimit,
} from "server/auth/otpAttempts";
import {
  hashAuthOtpEmail,
  hashAuthOtpIp,
  normalizeAuthOtpIp,
} from "server/auth/otpHash";
import { isRegisterEmailAvailable } from "server/auth/registerEmailAvailability";
import { verifyTurnstileToken } from "server/auth/turnstile";
import type {
  LoginActionState,
  RegisterActionState,
  RegisterEmailAvailabilityState,
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

const registerErrorMessages = {
  duplicateEmail: "这个邮箱已经注册过了，请直接登录或换一个邮箱。",
  invalidEmail: "邮箱格式看起来不正确，请检查后再试。",
  weakPassword: `密码强度不足。${passwordRuleMessage}`,
  signupDisabled: "当前暂时无法开放新用户注册，请稍后再试。",
  rateLimited: "注册请求太频繁了，请稍等一会儿再试。",
  fallback: "注册失败，请确认邮箱和密码后再试。",
  emailCheckRateLimited: "邮箱检查过于频繁，请稍后再试。",
} as const;

const registerOtpMessages = {
  appUserSyncFailed: "注册资料同步异常，请稍后登录后再确认。",
  invalidOtp: "验证码不正确或已过期，请重新获取",
  rateLimited: "验证码发送过于频繁，请稍后再试",
  serviceError: "服务异常，请稍后再试",
  success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
  tooManyAttempts: "验证码错误次数过多，请重新获取",
  turnstileFailed: "人机验证失败，请稍后重试",
} as const;

const maxRegisterOtpVerifyFailures = 5;
const registerOtpCooldownSeconds = 60;

export async function checkRegisterEmailAvailability(
  email: unknown,
): Promise<RegisterEmailAvailabilityState> {
  if (typeof email !== "string") {
    return { available: false };
  }

  const trimmedEmail = email.trim();

  if (
    !trimmedEmail ||
    trimmedEmail.length > emailMaxLength ||
    !isValidEmailFormat(trimmedEmail)
  ) {
    return { available: false };
  }

  const requestHeaders = await headers();
  const ipHash = hashAuthOtpIp(requestHeaders);

  if (!ipHash) {
    return { available: false, error: registerOtpMessages.serviceError };
  }

  const emailHash = hashAuthOtpEmail(trimmedEmail);

  try {
    const rateLimit = await checkRegisterEmailAvailabilityRateLimit({ ipHash });

    if (!rateLimit.allowed) {
      return {
        available: false,
        error: registerErrorMessages.emailCheckRateLimited,
      };
    }

    try {
      const availability = await loadRegisterEmailAvailability(trimmedEmail);

      await recordAuthOtpAttempt({
        attempt_type: "availability_check",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "success",
      });

      return availability;
    } catch (error) {
      await recordAuthOtpAttempt({
        attempt_type: "availability_check",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "failed",
      }).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("checkRegisterEmailAvailability failed", error);
    return { available: false, error: registerOtpMessages.serviceError };
  }
}

async function loadRegisterEmailAvailability(
  email: string,
): Promise<RegisterEmailAvailabilityState> {
  const available = await isRegisterEmailAvailable(email);

  return available
    ? { available: true }
    : { available: false, error: registerErrorMessages.duplicateEmail };
}

function validateRegisterFields({
  displayName,
  email,
  password,
  passwordConfirm,
}: {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): RegisterActionState | null {
  if (!displayName || !email || !password || !passwordConfirm) {
    return {
      error: "请输入昵称、邮箱和密码。",
    };
  }

  if (email.length > emailMaxLength) {
    return {
      error: `邮箱最多 ${emailMaxLength} 个字符。`,
    };
  }

  if (!isValidEmailFormat(email)) {
    return {
      error: "邮箱格式有误",
    };
  }

  if (displayName.length > displayNameMaxLength) {
    return {
      error: `昵称最多 ${displayNameMaxLength} 个字符。`,
    };
  }

  if (password.length > passwordMaxLength) {
    return {
      error: `密码最多 ${passwordMaxLength} 个字符。`,
      resetPassword: true,
    };
  }

  if (passwordConfirm.length > passwordMaxLength) {
    return {
      error: `确认密码最多 ${passwordMaxLength} 个字符。`,
    };
  }

  if (password !== passwordConfirm) {
    return {
      error: "两次输入的密码不一致。",
    };
  }

  if (!isValidRegisterPassword(password)) {
    return {
      error: registerErrorMessages.weakPassword,
      resetPassword: true,
    };
  }

  return null;
}

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code ?? "").toLowerCase()
    : "";
}

function validateRequestRegisterOtpFields(params: {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): RequestRegisterOtpActionState | null {
  const validationError = validateRegisterFields(params);

  if (!validationError) {
    return null;
  }

  return {
    ...validationError,
    resetTurnstile: true,
    status: "validation_error",
  };
}

function validateResendRegisterOtpFields(
  email: string,
): RequestRegisterOtpActionState | null {
  if (!email) {
    return {
      error: "请输入邮箱。",
      resetTurnstile: true,
      status: "validation_error",
    };
  }

  if (email.length > emailMaxLength) {
    return {
      error: `邮箱最多 ${emailMaxLength} 个字符。`,
      resetTurnstile: true,
      status: "validation_error",
    };
  }

  if (!isValidEmailFormat(email)) {
    return {
      error: "邮箱格式有误",
      resetTurnstile: true,
      status: "validation_error",
    };
  }

  return null;
}

function validateSubmitRegisterOtpFields(params: {
  email: string;
  token: string;
}): SubmitRegisterOtpActionState | null {
  if (!params.email || !params.token) {
    return {
      error: "请输入邮箱和验证码。",
      status: "validation_error",
    };
  }

  if (params.email.length > emailMaxLength) {
    return {
      error: `邮箱最多 ${emailMaxLength} 个字符。`,
      status: "validation_error",
    };
  }

  if (!isValidEmailFormat(params.email)) {
    return {
      error: "邮箱格式有误",
      status: "validation_error",
    };
  }

  if (!/^\d{6}$/.test(params.token)) {
    return {
      error: "请输入 6 位数字验证码",
      status: "validation_error",
    };
  }

  return null;
}

function isAppUserRow(value: unknown): value is { display_name: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "display_name" in value &&
    typeof value.display_name === "string"
  );
}

function getRegisterErrorMessage(error: unknown) {
  const code = getErrorCode(error);

  if (code === "user_already_exists") {
    return registerErrorMessages.duplicateEmail;
  }

  if (code === "invalid_email") {
    return registerErrorMessages.invalidEmail;
  }

  if (code === "weak_password") {
    return registerErrorMessages.weakPassword;
  }

  if (code === "signup_disabled") {
    return registerErrorMessages.signupDisabled;
  }

  if (code === "over_email_send_rate_limit") {
    return registerErrorMessages.rateLimited;
  }

  return registerErrorMessages.fallback;
}

export async function requestRegisterOtp(
  _previousState: RequestRegisterOtpActionState,
  formData: FormData,
): Promise<RequestRegisterOtpActionState> {
  const isResend = formData.get("resend") === "true";
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const turnstileToken = String(formData.get("turnstileToken") ?? "");

  const validationError = isResend
    ? validateResendRegisterOtpFields(email)
    : validateRequestRegisterOtpFields({
        displayName,
        email,
        password,
        passwordConfirm,
      });

  if (validationError) {
    return validationError;
  }

  const requestHeaders = await headers();
  const ipHash = hashAuthOtpIp(requestHeaders);
  const remoteIp = normalizeAuthOtpIp(requestHeaders);

  if (!ipHash) {
    console.error("requestRegisterOtp missing trusted ip");

    return {
      error: registerOtpMessages.serviceError,
      resetTurnstile: true,
      status: "unknown_error",
    };
  }

  const emailHash = hashAuthOtpEmail(email);

  try {
    const rateLimit = await checkAuthOtpSendRateLimit({ emailHash, ipHash });

    if (!rateLimit.allowed) {
      await recordAuthOtpAttempt({
        attempt_type: "send",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "blocked",
      });

      return {
        error: registerOtpMessages.rateLimited,
        resetTurnstile: true,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
        status: "rate_limited",
      };
    }

    const turnstilePassed = await verifyTurnstileToken({
      remoteIp,
      token: turnstileToken,
    });

    if (!turnstilePassed) {
      return {
        error: registerOtpMessages.turnstileFailed,
        resetTurnstile: true,
        status: "turnstile_failed",
      };
    }

    if (!isResend) {
      const emailAvailability = await loadRegisterEmailAvailability(email);

      if (!emailAvailability.available) {
        return {
          error: emailAvailability.error ?? registerOtpMessages.serviceError,
          resetTurnstile: true,
          status: "email_unavailable",
        };
      }
    }

    const supabase = await createClient();
    const { error } = isResend
      ? await supabase.auth.resend({
          email,
          type: "signup",
        })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

    if (!error) {
      await recordAuthOtpAttempt({
        attempt_type: "send",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "success",
      });

      return {
        resetTurnstile: true,
        retryAfterSeconds: registerOtpCooldownSeconds,
        status: "success",
        success: registerOtpMessages.success,
      };
    }

    const code = getErrorCode(error);
    await recordAuthOtpAttempt({
      attempt_type: "send",
      email_hash: emailHash,
      ip_hash: ipHash,
      purpose: "signup",
      result: code === "over_email_send_rate_limit" ? "blocked" : "failed",
    });

    if (code === "over_email_send_rate_limit") {
      return {
        error: registerOtpMessages.rateLimited,
        resetTurnstile: true,
        status: "send_rate_limited",
      };
    }

    if (code === "user_already_exists") {
      return {
        error: registerErrorMessages.duplicateEmail,
        resetTurnstile: true,
        status: "email_unavailable",
      };
    }

    return {
      error: registerOtpMessages.serviceError,
      resetTurnstile: true,
      status: "unknown_error",
    };
  } catch (error) {
    console.error("requestRegisterOtp failed", error);

    return {
      error: registerOtpMessages.serviceError,
      resetTurnstile: true,
      status: "unknown_error",
    };
  }
}

export async function submitRegisterOtp(
  _previousState: SubmitRegisterOtpActionState,
  formData: FormData,
): Promise<SubmitRegisterOtpActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  const validationError = validateSubmitRegisterOtpFields({
    email,
    token,
  });

  if (validationError) {
    return validationError;
  }

  const requestHeaders = await headers();
  const ipHash = hashAuthOtpIp(requestHeaders);

  if (!ipHash) {
    return {
      error: registerOtpMessages.serviceError,
      status: "unknown_error",
    };
  }

  const emailHash = hashAuthOtpEmail(email);

  try {
    const failureCount = await countAuthOtpVerifyFailuresSinceLastSend({
      emailHash,
    });

    if (failureCount >= maxRegisterOtpVerifyFailures) {
      await recordAuthOtpAttempt({
        attempt_type: "verify_failure",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "blocked",
      });

      return {
        error: registerOtpMessages.tooManyAttempts,
        remainingAttempts: 0,
        status: "too_many_attempts",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      await recordAuthOtpAttempt({
        attempt_type: "verify_failure",
        email_hash: emailHash,
        ip_hash: ipHash,
        purpose: "signup",
        result: "failed",
      });

      return {
        error: registerOtpMessages.invalidOtp,
        remainingAttempts: Math.max(
          0,
          maxRegisterOtpVerifyFailures - failureCount - 1,
        ),
        status: "otp_invalid",
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        redirectTo: routeWithQuery(routePaths.login, { email }),
        status: "session_invalid",
      };
    }

    const displayName =
      typeof user.user_metadata.display_name === "string"
        ? user.user_metadata.display_name.trim()
        : "";

    if (!displayName || displayName.length > displayNameMaxLength) {
      return {
        error: registerOtpMessages.appUserSyncFailed,
        status: "app_user_sync_failed",
      };
    }

    const { data: appUser, error: appUserError } = await supabase
      .from("app_user")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (appUserError || !isAppUserRow(appUser)) {
      return {
        error: registerOtpMessages.appUserSyncFailed,
        status: "app_user_sync_failed",
      };
    }

    if (appUser.display_name !== displayName) {
      const { error: updateError } = await supabase
        .from("app_user")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (updateError) {
        return {
          error: registerOtpMessages.appUserSyncFailed,
          status: "app_user_sync_failed",
        };
      }
    }

    return {
      redirectTo: routePaths.dashboard,
      status: "success",
      success: "注册完成。",
    };
  } catch {
    return {
      error: registerOtpMessages.serviceError,
      status: "unknown_error",
    };
  }
}

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "请输入邮箱和密码。",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "邮箱或密码不正确。",
    };
  }

  redirect(routePaths.dashboard);
}

export async function register(
  _previousState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const validationError = validateRegisterFields({
    displayName,
    email,
    password,
    passwordConfirm,
  });

  if (validationError) {
    return validationError;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    const errorMessage = getRegisterErrorMessage(error);

    return {
      error: errorMessage,
      ...(errorMessage === registerErrorMessages.weakPassword
        ? { resetPassword: true }
        : {}),
    };
  }

  return {
    success: "注册申请已提交。请查收确认邮件后再登录。",
  };
}
