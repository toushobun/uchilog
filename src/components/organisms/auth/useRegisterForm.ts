import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  displayNameMaxLength,
  emailMaxLength,
  isValidEmailFormat,
  isValidRegisterPassword,
  passwordMaxLength,
  passwordRuleMessage,
} from "lib/validators/auth";
import type {
  RegisterEmailAvailabilityState,
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

import { registerFormMessages } from "./registerFormMessages";
import {
  ensureTurnstileScript,
  getTurnstileApi,
  turnstileScriptId,
} from "./turnstile";

type RegisterFormPhase =
  | "initial"
  | "sending"
  | "otp_input"
  | "submitting"
  | "done";

type RegisterFormAlertSeverity = "error" | "info" | "success";

type RegisterSnapshot = {
  displayName: string;
  email: string;
};

type UseRegisterFormParams = {
  checkEmailAvailabilityAction: (
    email: string,
  ) => Promise<RegisterEmailAvailabilityState>;
  requestOtpAction: (
    prevState: RequestRegisterOtpActionState,
    formData: FormData,
  ) => Promise<RequestRegisterOtpActionState>;
  submitOtpAction: (
    prevState: SubmitRegisterOtpActionState,
    formData: FormData,
  ) => Promise<SubmitRegisterOtpActionState>;
  turnstileSiteKey: string;
};

const requestOtpInitialState: RequestRegisterOtpActionState = {};
const submitOtpInitialState: SubmitRegisterOtpActionState = {};
const otpCooldownSeconds = 60;
const otpLength = 6;
const turnstileLoadTimeoutMs = 10000;

function getEmailError(value: string) {
  if (!value) return "";
  if (value.length > emailMaxLength) {
    return `邮箱最多 ${emailMaxLength} 个字符。`;
  }
  if (!isValidEmailFormat(value)) return "邮箱格式有误";
  return "";
}

function getDisplayNameError(value: string) {
  if (!value) return "";
  if (value.length > displayNameMaxLength) {
    return `昵称最多 ${displayNameMaxLength} 个字符。`;
  }
  return "";
}

function getPasswordError(value: string) {
  if (!value) return "";
  if (value.length > passwordMaxLength) {
    return `密码最多 ${passwordMaxLength} 个字符。`;
  }
  if (!isValidRegisterPassword(value)) return passwordRuleMessage;
  return "";
}

function getPasswordConfirmError(password: string, value: string) {
  if (!value) return "";
  if (value.length > passwordMaxLength) {
    return `确认密码最多 ${passwordMaxLength} 个字符。`;
  }
  if (password !== value) return "两次输入的密码不一致。";
  return "";
}

function getOtpCodeError(value: string) {
  if (!value) return "";
  if (!/^\d{6}$/.test(value)) return "请输入 6 位数字验证码";
  return "";
}

function getRegisterFormPhase(params: {
  basePhase: RegisterFormPhase;
  isRequestOtpPending: boolean;
  isSubmitOtpPending: boolean;
  redirectTo?: string;
}): RegisterFormPhase {
  if (params.redirectTo) return "done";
  if (params.isSubmitOtpPending) return "submitting";
  if (params.isRequestOtpPending) return "sending";
  return params.basePhase;
}

function getAlertSeverity(params: {
  hasError: boolean;
  hasInfo: boolean;
  hasSuccess: boolean;
}): RegisterFormAlertSeverity | undefined {
  if (params.hasError) return "error";
  if (params.hasInfo) return "info";
  if (params.hasSuccess) return "success";
  return undefined;
}

function getFormDataText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getRegisterSnapshotFromFormData(formData: FormData): RegisterSnapshot {
  return {
    displayName: getFormDataText(formData, "displayName"),
    email: getFormDataText(formData, "email"),
  };
}

function isSafeRedirectPath(redirectTo: string) {
  return redirectTo.startsWith("/") && !redirectTo.startsWith("//");
}

export function useRegisterForm({
  checkEmailAvailabilityAction,
  requestOtpAction,
  submitOtpAction,
  turnstileSiteKey,
}: UseRegisterFormParams) {
  const router = useRouter();
  const [phase, setPhase] = useState<RegisterFormPhase>("initial");
  const [manualRequestOtpState, setManualRequestOtpState] =
    useState<RequestRegisterOtpActionState>({});
  const [isManualRequestOtpPending, setIsManualRequestOtpPending] =
    useState(false);
  const [submitOtpState, setSubmitOtpState] =
    useState<SubmitRegisterOtpActionState>(submitOtpInitialState);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isDisplayNameTouched, setIsDisplayNameTouched] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [emailAvailabilityError, setEmailAvailabilityError] = useState("");
  const [isEmailAvailabilityPending, setIsEmailAvailabilityPending] =
    useState(false);
  const [emailAvailabilityChecked, setEmailAvailabilityChecked] =
    useState(false);
  const [isEmailExists, setIsEmailExists] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isPasswordConfirmTouched, setIsPasswordConfirmTouched] =
    useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpCodeTouched, setIsOtpCodeTouched] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lockedSnapshot, setLockedSnapshot] = useState<RegisterSnapshot | null>(
    null,
  );
  const [isResendPreparing, setIsResendPreparing] = useState(false);
  const [localInfoMessage, setLocalInfoMessage] = useState("");
  const [turnstileErrorMessage, setTurnstileErrorMessage] = useState("");
  const [turnstileRetryKey, setTurnstileRetryKey] = useState(0);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileWaitIntervalIdRef = useRef<number | null>(null);
  const turnstileLoadTimeoutIdRef = useRef<number | null>(null);
  const emailAvailabilityRequestIdRef = useRef(0);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken("");
    const api = getTurnstileApi();

    if (api && turnstileWidgetIdRef.current) {
      api.reset(turnstileWidgetIdRef.current);
    }
  }, []);

  const applyRequestOtpResult = useCallback(
    (result: RequestRegisterOtpActionState, snapshot: RegisterSnapshot) => {
      if (result.resetTurnstile) {
        resetTurnstile();
      }

      if (result.resetPassword) {
        setLockedSnapshot(null);
        setPassword("");
        setPasswordConfirm("");
        setIsDisplayNameTouched(false);
        setIsEmailTouched(false);
        setIsPasswordTouched(false);
        setIsPasswordConfirmTouched(false);
        setSubmitOtpState(submitOtpInitialState);
        setOtpCode("");
        setIsOtpCodeTouched(false);
        setCooldownSeconds(0);
        setIsResendPreparing(false);
        setPhase("initial");
      }

      if (result.retryAfterSeconds) {
        setCooldownSeconds(result.retryAfterSeconds);
      }

      if (result.status === "success") {
        setLockedSnapshot(snapshot);
        setPassword("");
        setPasswordConfirm("");
        setIsPasswordTouched(false);
        setIsPasswordConfirmTouched(false);
        setSubmitOtpState(submitOtpInitialState);
        setOtpCode("");
        setIsOtpCodeTouched(false);
        setTurnstileToken("");
        setCooldownSeconds(result.retryAfterSeconds ?? otpCooldownSeconds);
        setIsResendPreparing(false);
        setLocalInfoMessage("");
        setTurnstileErrorMessage("");
        setPhase("otp_input");
      }
    },
    [resetTurnstile],
  );

  const wrappedRequestOtpAction = useCallback(
    async (prevState: RequestRegisterOtpActionState, formData: FormData) => {
      setTurnstileErrorMessage("");
      const snapshot = getRegisterSnapshotFromFormData(formData);
      const result = await requestOtpAction(prevState, formData);
      applyRequestOtpResult(result, snapshot);
      return result;
    },
    [applyRequestOtpResult, requestOtpAction],
  );

  const wrappedSubmitOtpAction = useCallback(
    async (prevState: SubmitRegisterOtpActionState, formData: FormData) => {
      setManualRequestOtpState({});
      setLocalInfoMessage("");
      const result = await submitOtpAction(prevState, formData);
      setSubmitOtpState(result);
      return result;
    },
    [submitOtpAction],
  );

  const [
    actionRequestOtpState,
    requestOtpFormAction,
    isActionRequestOtpPending,
  ] = useActionState(wrappedRequestOtpAction, requestOtpInitialState);
  const [, submitOtpFormAction, isSubmitOtpPending] = useActionState(
    wrappedSubmitOtpAction,
    submitOtpInitialState,
  );

  const hasManualRequestOtpState = Boolean(
    manualRequestOtpState.status ||
    manualRequestOtpState.error ||
    manualRequestOtpState.success,
  );
  const requestOtpState = hasManualRequestOtpState
    ? manualRequestOtpState
    : actionRequestOtpState;
  const isRequestOtpPending =
    isActionRequestOtpPending || isManualRequestOtpPending;
  const currentPhase = getRegisterFormPhase({
    basePhase: phase,
    isRequestOtpPending,
    isSubmitOtpPending,
    redirectTo: submitOtpState.redirectTo,
  });
  const isDonePhase = currentPhase === "done";
  const emailValidationError = getEmailError(email);
  const displayNameValidationError = getDisplayNameError(displayName);
  const passwordValidationError = getPasswordError(password);
  const passwordConfirmValidationError = getPasswordConfirmError(
    password,
    passwordConfirm,
  );
  const emailError = isEmailTouched ? emailValidationError : "";
  const displayNameError = isDisplayNameTouched
    ? displayNameValidationError
    : "";
  const passwordError = isPasswordTouched ? passwordValidationError : "";
  const passwordConfirmError = isPasswordConfirmTouched
    ? passwordConfirmValidationError
    : "";
  const otpCodeValidationError = getOtpCodeError(otpCode);
  const otpCodeError = isOtpCodeTouched ? otpCodeValidationError : "";
  const requestValues = useMemo(
    () =>
      lockedSnapshot ?? {
        displayName,
        email,
      },
    [displayName, email, lockedSnapshot],
  );
  const isOtpPhase = currentPhase !== "initial";
  const isFieldsLocked = isOtpPhase && Boolean(lockedSnapshot);
  const shouldShowTurnstile =
    !isDonePhase && cooldownSeconds <= 0 && (!isOtpPhase || isResendPreparing);
  const isEmailValid = Boolean(email) && !emailValidationError;
  const isDisplayNameValid =
    Boolean(displayName) && !displayNameValidationError;
  const isPasswordValid = Boolean(password) && !passwordValidationError;
  const isPasswordConfirmValid =
    Boolean(passwordConfirm) && !passwordConfirmValidationError;
  const isOtpCodeValid = Boolean(otpCode) && !otpCodeValidationError;
  const isSubmitOtpLocked =
    submitOtpState.status === "too_many_attempts" ||
    submitOtpState.remainingAttempts === 0;

  const handleEmailChange = useCallback((value: string) => {
    emailAvailabilityRequestIdRef.current += 1;
    setEmail(value);
    setEmailAvailabilityError("");
    setIsEmailAvailabilityPending(false);
    setEmailAvailabilityChecked(false);
    setIsEmailExists(false);
  }, []);

  const handleEmailBlur = useCallback(async () => {
    setIsEmailTouched(true);

    if (!email || getEmailError(email)) {
      return;
    }

    const requestId = emailAvailabilityRequestIdRef.current + 1;
    emailAvailabilityRequestIdRef.current = requestId;
    setIsEmailAvailabilityPending(true);
    setEmailAvailabilityChecked(false);
    setIsEmailExists(false);

    try {
      const result = await checkEmailAvailabilityAction(email);

      if (emailAvailabilityRequestIdRef.current === requestId) {
        setEmailAvailabilityError(
          result.available
            ? ""
            : result.error || registerFormMessages.messages.emailCheckFailed,
        );
        setIsEmailExists(result.reason === "email_exists");
        setEmailAvailabilityChecked(true);
      }
    } catch {
      if (emailAvailabilityRequestIdRef.current === requestId) {
        setEmailAvailabilityError(
          registerFormMessages.messages.emailCheckFailed,
        );
        setEmailAvailabilityChecked(true);
      }
    } finally {
      if (emailAvailabilityRequestIdRef.current === requestId) {
        setIsEmailAvailabilityPending(false);
      }
    }
  }, [checkEmailAvailabilityAction, email]);

  useEffect(() => {
    const redirectTo = submitOtpState.redirectTo;

    if (redirectTo && isSafeRedirectPath(redirectTo)) {
      router.push(redirectTo);
    }
  }, [router, submitOtpState.redirectTo]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!shouldShowTurnstile || !turnstileSiteKey) {
      return;
    }

    ensureTurnstileScript();

    const script = document.getElementById(turnstileScriptId);
    let isStopped = false;

    const stopWaiting = () => {
      if (turnstileWaitIntervalIdRef.current !== null) {
        window.clearInterval(turnstileWaitIntervalIdRef.current);
        turnstileWaitIntervalIdRef.current = null;
      }

      if (turnstileLoadTimeoutIdRef.current !== null) {
        window.clearTimeout(turnstileLoadTimeoutIdRef.current);
        turnstileLoadTimeoutIdRef.current = null;
      }
    };
    const failTurnstile = (message: string) => {
      if (isStopped) {
        return;
      }

      setTurnstileToken("");
      setTurnstileErrorMessage(message);
      script?.remove();
      stopWaiting();
    };
    const handleScriptError = () => {
      failTurnstile(registerFormMessages.messages.turnstileLoadFailed);
    };

    if (script instanceof HTMLScriptElement) {
      script.addEventListener("error", handleScriptError, { once: true });
    }

    turnstileLoadTimeoutIdRef.current = window.setTimeout(() => {
      failTurnstile(registerFormMessages.messages.turnstileLoadTimeout);
    }, turnstileLoadTimeoutMs);

    turnstileWaitIntervalIdRef.current = window.setInterval(() => {
      const api = getTurnstileApi();
      const container = turnstileContainerRef.current;

      if (!api || !container || turnstileWidgetIdRef.current) {
        return;
      }

      turnstileWidgetIdRef.current = api.render(container, {
        callback: (token) => {
          setTurnstileToken(token);
          setTurnstileErrorMessage("");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileErrorMessage(
            registerFormMessages.messages.turnstileError,
          );
        },
        sitekey: turnstileSiteKey,
        theme: "light",
      });
      stopWaiting();
    }, 100);

    return () => {
      isStopped = true;
      stopWaiting();

      if (script instanceof HTMLScriptElement) {
        script.removeEventListener("error", handleScriptError);
      }

      const api = getTurnstileApi();

      if (api && turnstileWidgetIdRef.current) {
        api.remove(turnstileWidgetIdRef.current);
      }

      turnstileWidgetIdRef.current = null;
    };
  }, [shouldShowTurnstile, turnstileRetryKey, turnstileSiteKey]);

  const handleRetryTurnstile = useCallback(() => {
    if (isDonePhase) {
      return;
    }

    setTurnstileErrorMessage("");
    setTurnstileToken("");

    if (turnstileWidgetIdRef.current) {
      resetTurnstile();
      return;
    }

    document.getElementById(turnstileScriptId)?.remove();
    setTurnstileRetryKey((current) => current + 1);
  }, [isDonePhase, resetTurnstile]);

  const handleModifyRegisterInfo = useCallback(() => {
    if (isDonePhase) {
      return;
    }

    setLockedSnapshot(null);
    setManualRequestOtpState({});
    setSubmitOtpState(submitOtpInitialState);
    setOtpCode("");
    setIsOtpCodeTouched(false);
    setIsDisplayNameTouched(false);
    setIsEmailTouched(false);
    setCooldownSeconds(0);
    setIsResendPreparing(false);
    setTurnstileErrorMessage("");
    setLocalInfoMessage(registerFormMessages.messages.modifyRequired);
    setPhase("initial");
    resetTurnstile();
  }, [isDonePhase, resetTurnstile]);

  const handlePrepareResend = useCallback(() => {
    if (isDonePhase) {
      return;
    }

    setIsResendPreparing(true);
    setTurnstileErrorMessage("");
    resetTurnstile();
  }, [isDonePhase, resetTurnstile]);

  const handleResendOtp = useCallback(async () => {
    const snapshot = lockedSnapshot;

    if (isDonePhase || !snapshot || !turnstileToken) {
      return;
    }

    setIsManualRequestOtpPending(true);
    setTurnstileErrorMessage("");

    const formData = new FormData();
    formData.set("email", snapshot.email);
    formData.set("resend", "true");
    formData.set("turnstileToken", turnstileToken);

    try {
      const result = await requestOtpAction(requestOtpInitialState, formData);
      setManualRequestOtpState(result);
      applyRequestOtpResult(result, snapshot);
      if (result.status !== "success" && !result.resetPassword) {
        setPhase("otp_input");
      }
    } finally {
      setIsManualRequestOtpPending(false);
    }
  }, [
    applyRequestOtpResult,
    isDonePhase,
    lockedSnapshot,
    requestOtpAction,
    turnstileToken,
  ]);

  const handleOtpCodeChange = useCallback((value: string) => {
    setOtpCode(value.replace(/\D/g, "").slice(0, otpLength));
  }, []);

  const initialCooldownMessage =
    !isFieldsLocked && cooldownSeconds > 0
      ? registerFormMessages.getInitialCooldownText(cooldownSeconds)
      : "";
  const requestOtpErrorMessage =
    requestOtpState.error && initialCooldownMessage
      ? `${requestOtpState.error} ${initialCooldownMessage}`
      : requestOtpState.error || "";
  const submitOtpLockedMessage = isSubmitOtpLocked
    ? registerFormMessages.messages.submitOtpLocked
    : "";
  const submitOtpErrorMessage = submitOtpState.error || submitOtpLockedMessage;
  const redirectingMessage = isDonePhase
    ? registerFormMessages.messages.redirecting
    : "";
  const hasError = Boolean(
    requestOtpErrorMessage ||
    turnstileErrorMessage ||
    (!localInfoMessage && submitOtpErrorMessage),
  );
  const hasInfo = Boolean(
    (initialCooldownMessage || localInfoMessage) && !turnstileErrorMessage,
  );
  // 修改注册信息后的本地提示有意覆盖上一次 OTP 提交错误。
  const alertMessage =
    requestOtpErrorMessage ||
    turnstileErrorMessage ||
    initialCooldownMessage ||
    localInfoMessage ||
    submitOtpErrorMessage ||
    redirectingMessage ||
    submitOtpState.success ||
    requestOtpState.success ||
    "";
  const alertSeverity = getAlertSeverity({
    hasError,
    hasInfo,
    hasSuccess: Boolean(alertMessage) && !hasError && !hasInfo,
  });

  return {
    alertMessage,
    alertSeverity,
    canRequestOtp:
      !isDonePhase &&
      Boolean(turnstileToken) &&
      cooldownSeconds <= 0 &&
      isEmailValid &&
      !emailAvailabilityError &&
      !isEmailAvailabilityPending &&
      isDisplayNameValid &&
      isPasswordValid &&
      isPasswordConfirmValid &&
      !isRequestOtpPending &&
      !turnstileErrorMessage,
    canResendOtp:
      !isDonePhase &&
      Boolean(turnstileToken) &&
      Boolean(lockedSnapshot) &&
      isResendPreparing &&
      cooldownSeconds <= 0 &&
      !isRequestOtpPending &&
      !isSubmitOtpPending &&
      !turnstileErrorMessage,
    canSubmitOtp:
      !isDonePhase &&
      isOtpCodeValid &&
      !isRequestOtpPending &&
      !isSubmitOtpPending &&
      !isSubmitOtpLocked,
    cooldownSeconds,
    displayName,
    displayNameError,
    email,
    emailAvailabilityChecked,
    emailAvailabilityError,
    emailError,
    isEmailAvailabilityPending,
    isEmailExists,
    handleEmailChange,
    handleModifyRegisterInfo,
    handleOtpCodeChange,
    handleOtpCodeBlur: () => setIsOtpCodeTouched(true),
    handleDisplayNameBlur: () => setIsDisplayNameTouched(true),
    handleEmailBlur,
    handlePasswordBlur: () => setIsPasswordTouched(true),
    handlePasswordConfirmBlur: () => setIsPasswordConfirmTouched(true),
    handlePrepareResend,
    handleResendOtp,
    handleRetryTurnstile,
    isDonePhase,
    isFieldsLocked,
    isRequestOtpPending,
    isResendPreparing,
    isSubmitOtpPending,
    otpCode,
    otpCodeError,
    password,
    passwordConfirm,
    passwordConfirmError,
    passwordError,
    phase: currentPhase,
    requestOtpFormAction,
    requestOtpState,
    requestValues,
    setDisplayName,
    setPassword,
    setPasswordConfirm,
    shouldShowTurnstile,
    submitOtpFormAction,
    submitOtpState,
    turnstileContainerRef,
    turnstileErrorMessage,
    turnstileToken,
  };
}
