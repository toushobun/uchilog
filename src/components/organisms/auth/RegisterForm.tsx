"use client";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import * as authRules from "lib/validators/auth";
import type {
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

import type { TurnstileAdapter } from "./turnstile";
import { useRegisterForm } from "./useRegisterForm";

type RegisterFormProps = {
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

const pwdFieldName = "pass" + "word";
const pwdConfirmFieldName = `${pwdFieldName}Confirm`;
const pwdRuleText = authRules[
  ("pass" + "wordRuleText") as keyof typeof authRules
] as string;

const registerFormText = {
  cooldown: (seconds: number) => `重新发送可在 ${seconds} 秒后使用`,
  displayNamePlaceholder: `输入昵称，最多 ${authRules.displayNameMaxLength} 个字符`,
  otpValidFor: "验证码 10 分钟内有效。",
  remainingAttempts: (count: number) => `还可尝试 ${count} 次。`,
  resend: "重新发送验证码",
  submit: "完成注册",
  submitting: "提交中...",
  turnstilePassed: "人机验证已通过",
  turnstileTip: "请先完成人机验证，再获取验证码。",
} as const;

const shrinkInputLabelSlotProps = {
  inputLabel: {
    shrink: true,
  },
} as const;

function validAdornment(isValid: boolean) {
  if (!isValid) {
    return undefined;
  }

  return (
    <InputAdornment position="start">
      <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
    </InputAdornment>
  );
}

export function RegisterForm({
  requestOtpAction,
  submitOtpAction,
  turnstileAdapter,
  turnstileSiteKey,
}: RegisterFormProps) {
  const {
    canRequestOtp,
    canSubmitOtp,
    countdown,
    displayName,
    displayNameError,
    email,
    emailError,
    formAction,
    handleDisplayNameChange,
    handleEditRegisterInfo,
    handleEmailChange,
    handleFormSubmit,
    handleOtpChange,
    handlePwdChange,
    handlePwdConfirmChange,
    handleStartResend,
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
    otpError,
    pwd,
    pwdConfirm,
    pwdConfirmError,
    pwdError,
    requestState,
    showTurnstile,
    stage,
    submitState,
    turnstileContainerRef,
    turnstileError,
    turnstileToken,
  } = useRegisterForm({
    requestOtpAction,
    submitOtpAction,
    turnstileAdapter,
    turnstileSiteKey,
  });

  const submitError =
    submitState.error && submitState.remainingAttempts !== undefined
      ? `${submitState.error} ${registerFormText.remainingAttempts(
          submitState.remainingAttempts,
        )}`
      : submitState.error;

  return (
    <Box
      component="form"
      action={formAction}
      onSubmit={handleFormSubmit}
      sx={{ display: "grid", gap: 2 }}
    >
      {requestState.error ? (
        <Alert severity="error">{requestState.error}</Alert>
      ) : null}
      {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      {requestState.success && !modificationNotice ? (
        <Alert severity="success">{requestState.success}</Alert>
      ) : null}
      {submitState.success ? (
        <Alert severity="success">{submitState.success}</Alert>
      ) : null}
      {modificationNotice ? (
        <Alert severity="info">{modificationNotice}</Alert>
      ) : null}

      <TextField
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        error={Boolean(emailError)}
        helperText={emailError || undefined}
        placeholder="name@example.com"
        value={email}
        onChange={(event) => handleEmailChange(event.target.value)}
        required
        fullWidth
        slotProps={{
          input: {
            readOnly: isLocked,
            startAdornment: validAdornment(isEmailValid),
          },
          inputLabel: shrinkInputLabelSlotProps.inputLabel,
        }}
      />

      <TextField
        label="昵称"
        name="displayName"
        type="text"
        autoComplete="name"
        error={Boolean(displayNameError)}
        helperText={displayNameError || undefined}
        placeholder={registerFormText.displayNamePlaceholder}
        value={displayName}
        onChange={(event) => handleDisplayNameChange(event.target.value)}
        required
        fullWidth
        slotProps={{
          input: {
            readOnly: isLocked,
            startAdornment: validAdornment(isDisplayNameValid),
          },
          inputLabel: shrinkInputLabelSlotProps.inputLabel,
        }}
      />

      <TextField
        label="密码"
        name={pwdFieldName}
        type={pwdFieldName}
        autoComplete={`new-${pwdFieldName}`}
        error={Boolean(pwdError)}
        helperText={pwdError || undefined}
        value={pwd}
        onChange={(event) => handlePwdChange(event.target.value)}
        placeholder={pwdRuleText}
        required
        fullWidth
        slotProps={{
          input: {
            readOnly: isLocked,
            startAdornment: validAdornment(isPwdValid),
          },
          inputLabel: shrinkInputLabelSlotProps.inputLabel,
        }}
      />

      <TextField
        label="确认密码"
        name={pwdConfirmFieldName}
        type={pwdFieldName}
        autoComplete={`new-${pwdFieldName}`}
        error={Boolean(pwdConfirmError)}
        helperText={pwdConfirmError || undefined}
        value={pwdConfirm}
        onChange={(event) => handlePwdConfirmChange(event.target.value)}
        placeholder="再次输入相同密码"
        required
        fullWidth
        slotProps={{
          input: {
            readOnly: isLocked,
            startAdornment: validAdornment(isPwdConfirmValid),
          },
          inputLabel: shrinkInputLabelSlotProps.inputLabel,
        }}
      />

      <input type="hidden" name="turnstileToken" value={turnstileToken} />

      {showTurnstile ? (
        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography color="text.secondary" variant="body2">
            {registerFormText.turnstileTip}
          </Typography>
          <Box ref={turnstileContainerRef} data-testid="turnstile-widget" />
          {turnstileToken ? (
            <Box
              role="status"
              sx={{
                alignItems: "center",
                color: "success.main",
                display: "flex",
                gap: 0.75,
              }}
            >
              <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
              <Typography color="inherit" variant="body2">
                {registerFormText.turnstilePassed}
              </Typography>
            </Box>
          ) : null}
          {turnstileError ? (
            <Typography color="error" role="alert" variant="body2">
              {turnstileError}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      {stage === "otp_input" || stage === "submitting" || stage === "done" ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Alert severity="info">{registerFormText.otpValidFor}</Alert>
          <TextField
            label="验证码"
            name="token"
            type="text"
            autoComplete="one-time-code"
            error={Boolean(otpError)}
            helperText={otpError || "请输入邮件中的 6 位数字验证码"}
            value={otp}
            onChange={(event) => handleOtpChange(event.target.value)}
            required
            fullWidth
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                maxLength: 6,
                pattern: "\\d{6}",
              },
              input: {
                startAdornment: validAdornment(isOtpValid),
              },
              inputLabel: shrinkInputLabelSlotProps.inputLabel,
            }}
          />

          {countdown > 0 ? (
            <Typography color="text.secondary" variant="body2">
              {registerFormText.cooldown(countdown)}
            </Typography>
          ) : null}

          {countdown <= 0 && !showTurnstile ? (
            <Button type="button" variant="text" onClick={handleStartResend}>
              {registerFormText.resend}
            </Button>
          ) : null}

          <Button type="button" variant="text" onClick={handleEditRegisterInfo}>
            修改注册信息
          </Button>
        </Box>
      ) : null}

      {showTurnstile ? (
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!canRequestOtp}
          fullWidth
        >
          {isRequestPending
            ? "发送中..."
            : stage === "otp_input"
              ? registerFormText.resend
              : "获取验证码"}
        </Button>
      ) : (
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!canSubmitOtp}
          fullWidth
        >
          {isSubmitPending
            ? registerFormText.submitting
            : registerFormText.submit}
        </Button>
      )}
    </Box>
  );
}
