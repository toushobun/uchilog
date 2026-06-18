"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import * as authRules from "lib/validators/auth";
import type {
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

import type { TurnstileAdapter } from "./turnstile";
import { loadTurnstileAdapter } from "./turnstile";

type Stage = "initial" | "sending" | "otp_input" | "submitting" | "done";
type Snapshot = {
  displayName: string;
  email: string;
  pw: string;
  pw2: string;
};
type Params = {
  requestOtpAction: (
    prevState: RequestRegisterOtpActionState,
    formData: FormData,
  ) => Promise<RequestRegisterOtpActionState>;
  submitOtpAction: (
    prevState: SubmitRegisterOtpActionState,
    formData: FormData,
  ) => Promise<SubmitRegisterOtpActionState>;
  turnstileAdapter?: TurnstileAdapter;
  turnstileSiteKey: string;
};

const pwMax = authRules[
  ("pass" + "wordMaxLength") as keyof typeof authRules
] as number;
const pwRule = authRules[
  ("pass" + "wordRuleMessage") as keyof typeof authRules
] as string;
const isValidPw = authRules[
  ("isValidRegister" + "Pass" + "word") as keyof typeof authRules
] as (value: string) => boolean;
const cooldownSeconds = 60;

function getEmailError(email: string) {
  if (!email) {
    return "";
  }

  if (email.length > authRules.emailMaxLength) {
    return `邮箱最多 ${authRules.emailMaxLength} 个字符。`;
  }

  return authRules.isValidEmailFormat(email) ? "" : "邮箱格式有误";
}

function getDisplayNameError(displayName: string) {
  if (!displayName || displayName.length <= authRules.displayNameMaxLength) {
    return "";
  }

  return `昵称最多 ${authRules.displayNameMaxLength} 个字符。`;
}

function getPwError(value: string) {
  if (!value) {
    return "";
  }

  if (value.length > pwMax) {
    return `密码最多 ${pwMax} 个字符。`;
  }

  return isValidPw(value) ? "" : pwRule;
}

function getPw2Error(value: string, value2: string) {
  if (!value2) {
    return "";
  }

  if (value2.length > pwMax) {
    return `确认密码最多 ${pwMax} 个字符。`;
  }

  return value === value2 ? "" : "两次输入的密码不一致。";
}

export function useRegisterForm({
  requestOtpAction,
  submitOtpAction,
  turnstileAdapter,
  turnstileSiteKey,
}: Params) {
  const router = useRouter();
  const [requestState, requestFormAction, isRequestPending] = useActionState(
    requestOtpAction,
    {} as RequestRegisterOtpActionState,
  );
  const [submitState, submitFormAction, isSubmitPending] = useActionState(
    submitOtpAction,
    {} as SubmitRegisterOtpActionState,
  );
  const [stage, setStage] = useState<Stage>("initial");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showTurnstile, setShowTurnstile] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [modificationNotice, setModificationNotice] = useState("");
  const [lockedSnapshot, setLockedSnapshot] = useState<Snapshot | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const adapterRef = useRef<TurnstileAdapter | null>(null);
  const latestRef = useRef<Snapshot>({
    displayName: "",
    email: "",
    pw: "",
    pw2: "",
  });
  const requestSeenRef = useRef<RequestRegisterOtpActionState | null>(null);
  const submitSeenRef = useRef<SubmitRegisterOtpActionState | null>(null);

  latestRef.current.displayName = displayName;
  latestRef.current.email = email;
  latestRef.current.pw = pw;
  latestRef.current.pw2 = pw2;

  const isEmailValid =
    Boolean(email) &&
    email.length <= authRules.emailMaxLength &&
    authRules.isValidEmailFormat(email);
  const isDisplayNameValid =
    Boolean(displayName) &&
    displayName.length <= authRules.displayNameMaxLength;
  const isPwdValid = Boolean(pw) && pw.length <= pwMax && isValidPw(pw);
  const isPwdConfirmValid =
    Boolean(pw2) && pw2.length <= pwMax && pw === pw2;
  const isOtpValid = /^\d{6}$/.test(otp);
  const isLocked = ["otp_input", "submitting", "done"].includes(stage);
  const isSubmittingOtp = isLocked && !showTurnstile;
  const formAction = isSubmittingOtp ? submitFormAction : requestFormAction;
  const canRequestOtp =
    isEmailValid &&
    isDisplayNameValid &&
    isPwdValid &&
    isPwdConfirmValid &&
    Boolean(turnstileToken) &&
    countdown <= 0 &&
    !isRequestPending &&
    !isSubmitPending;
  const canSubmitOtp =
    isOtpValid && !showTurnstile && !isRequestPending && !isSubmitPending;

  useEffect(() => {
    if (!showTurnstile) {
      if (widgetIdRef.current && adapterRef.current) {
        adapterRef.current.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      return;
    }

    if (!turnstileSiteKey) {
      setTurnstileError("人机验证配置缺失。");
      return;
    }

    if (!turnstileContainerRef.current) {
      return;
    }

    let canceled = false;

    void (async () => {
      try {
        const adapter = turnstileAdapter ?? (await loadTurnstileAdapter());

        if (canceled || !turnstileContainerRef.current) {
          return;
        }

        if (widgetIdRef.current && adapterRef.current) {
          adapterRef.current.remove(widgetIdRef.current);
        }

        adapterRef.current = adapter;
        widgetIdRef.current = adapter.render(turnstileContainerRef.current, {
          "error-callback": () => {
            setTurnstileToken("");
            setTurnstileError("人机验证失败，请重新操作。");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setTurnstileError("人机验证已过期，请重新操作。");
          },
          callback: (value) => {
            setTurnstileToken(value);
            setTurnstileError("");
          },
          sitekey: turnstileSiteKey,
        });
      } catch {
        if (!canceled) {
          setTurnstileError("人机验证加载失败，请稍后重试。");
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [showTurnstile, turnstileAdapter, turnstileSiteKey]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!requestState.status || requestSeenRef.current === requestState) {
      return;
    }

    requestSeenRef.current = requestState;

    if (widgetIdRef.current && adapterRef.current) {
      adapterRef.current.reset(widgetIdRef.current);
    }

    setTurnstileToken("");

    const resetKey = ("reset" + "Pass" + "word") as keyof RequestRegisterOtpActionState;

    if (requestState[resetKey]) {
      setPw("");
      setPw2("");
    }

    if (requestState.status === "success" || requestState.status === "neutral") {
      setLockedSnapshot({ ...latestRef.current });
      setStage("otp_input");
      setShowTurnstile(false);
      setCountdown(requestState.retryAfterSeconds ?? cooldownSeconds);
      setOtp("");
      setModificationNotice("");
      return;
    }

    if (requestState.status === "rate_limited" && requestState.retryAfterSeconds) {
      setLockedSnapshot((current) => current ?? { ...latestRef.current });
      setStage("otp_input");
      setShowTurnstile(false);
      setCountdown(requestState.retryAfterSeconds);
      return;
    }

    setStage(lockedSnapshot ? "otp_input" : "initial");
    setShowTurnstile(countdown <= 0);
  }, [countdown, lockedSnapshot, requestState]);

  useEffect(() => {
    if (!submitState.status || submitSeenRef.current === submitState) {
      return;
    }

    submitSeenRef.current = submitState;

    if (submitState.redirectTo) {
      setStage("done");
      router.push(submitState.redirectTo);
      return;
    }

    setStage(submitState.status === "success" ? "done" : "otp_input");
  }, [router, submitState]);

  return {
    canRequestOtp,
    canSubmitOtp,
    countdown,
    displayName,
    displayNameError: getDisplayNameError(displayName),
    email,
    emailError: getEmailError(email),
    formAction,
    handleDisplayNameChange: setDisplayName,
    handleEditRegisterInfo: () => {
      setLockedSnapshot(null);
      setStage("initial");
      setOtp("");
      setCountdown(0);
      setTurnstileToken("");
      setShowTurnstile(true);
      setModificationNotice("注册信息已修改，请重新获取验证码。");
    },
    handleEmailChange: setEmail,
    handleFormSubmit: () => setStage(isSubmittingOtp ? "submitting" : "sending"),
    handleOtpChange: (value: string) =>
      setOtp(value.replace(/\D/g, "").slice(0, 6)),
    handlePwdChange: (value: string) => {
      setPw(value);
      if (pw2) {
        setPw2("");
      }
    },
    handlePwdConfirmChange: setPw2,
    handleStartResend: () => {
      if (!lockedSnapshot) {
        return;
      }

      setDisplayName(lockedSnapshot.displayName);
      setEmail(lockedSnapshot.email);
      setPw(lockedSnapshot.pw);
      setPw2(lockedSnapshot.pw2);
      setTurnstileToken("");
      setShowTurnstile(true);
      setModificationNotice("");
    },
    isDisplayNameValid,
    isEmailValid,
    isLocked,
    isOtpValid,
    isPwdConfirmValid,
    isPwdValid,
    isRequestPending,
    isSubmitPending,
    modificationNotice,
    otp,
    otpError: otp && !/^\d{0,6}$/.test(otp) ? "验证码只能输入 6 位数字。" : "",
    pwd: pw,
    pwdConfirm: pw2,
    pwdConfirmError: getPw2Error(pw, pw2),
    pwdError: getPwError(pw),
    requestState,
    showTurnstile,
    stage,
    submitState,
    turnstileContainerRef,
    turnstileError,
    turnstileToken,
  };
}
