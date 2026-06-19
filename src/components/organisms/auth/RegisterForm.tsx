"use client";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { routePaths } from "config/paths";
import type {
  RegisterEmailAvailabilityState,
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

import { registerFormMessages } from "./registerFormMessages";
import { useRegisterForm } from "./useRegisterForm";

type RegisterFormProps = {
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

const shrinkInputLabelSlotProps = {
  inputLabel: {
    shrink: true,
  },
} as const;

const readonlyFieldSlotProps = {
  htmlInput: {
    readOnly: true,
  },
  inputLabel: {
    shrink: true,
  },
} as const;

export function RegisterForm(props: RegisterFormProps) {
  const {
    alertMessage,
    alertSeverity,
    canRequestOtp,
    canResendOtp,
    canSubmitOtp,
    cooldownSeconds,
    displayName,
    displayNameError,
    email,
    emailAvailabilityChecked,
    emailAvailabilityError,
    emailError,
    isEmailAvailabilityPending,
    isEmailExists,
    handleDisplayNameBlur,
    handleEmailChange,
    handleEmailBlur,
    handleModifyRegisterInfo,
    handleOtpCodeBlur,
    handleOtpCodeChange,
    handlePasswordBlur,
    handlePasswordConfirmBlur,
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
    requestOtpFormAction,
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
  } = useRegisterForm(props);
  const isAnyRequestPending =
    isRequestOtpPending || isSubmitOtpPending || isDonePhase;

  const retryTurnstileButton = turnstileErrorMessage ? (
    <Button
      type="button"
      variant="outlined"
      onClick={handleRetryTurnstile}
      fullWidth
    >
      {registerFormMessages.retryTurnstile}
    </Button>
  ) : null;

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {alertMessage && alertSeverity ? (
        <Alert severity={alertSeverity}>{alertMessage}</Alert>
      ) : null}

      {!isFieldsLocked ? (
        <Box
          component="form"
          action={requestOtpFormAction}
          sx={{ display: "grid", gap: 2 }}
        >
          <TextField
            label={registerFormMessages.labels.email}
            name="email"
            type="email"
            autoComplete="email"
            error={
              Boolean(emailError) ||
              isEmailExists ||
              Boolean(emailAvailabilityError && !isEmailExists)
            }
            helperText={
              emailError ? (
                emailError
              ) : isEmailAvailabilityPending ? (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CircularProgress size="1em" />
                  {registerFormMessages.messages.emailChecking}
                </Box>
              ) : emailAvailabilityChecked && isEmailExists ? (
                <span>
                  {registerFormMessages.messages.emailAlreadyRegisteredPrefix}
                  <MuiLink href={routePaths.login}>
                    {
                      registerFormMessages.messages
                        .emailAlreadyRegisteredLinkText
                    }
                  </MuiLink>
                </span>
              ) : emailAvailabilityChecked && !emailAvailabilityError ? (
                <Box
                  component="span"
                  sx={{
                    color: "success.main",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CheckCircleOutlinedIcon fontSize="inherit" />
                  {registerFormMessages.messages.emailAvailable}
                </Box>
              ) : emailAvailabilityError ? (
                emailAvailabilityError
              ) : undefined
            }
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            onBlur={handleEmailBlur}
            required
            fullWidth
            slotProps={shrinkInputLabelSlotProps}
          />
          <TextField
            label={registerFormMessages.labels.displayName}
            name="displayName"
            error={Boolean(displayNameError)}
            helperText={displayNameError || undefined}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            onBlur={handleDisplayNameBlur}
            required
            fullWidth
            slotProps={shrinkInputLabelSlotProps}
          />
          <TextField
            label={registerFormMessages.labels.password}
            name="password"
            type="password"
            autoComplete="new-password"
            error={Boolean(passwordError)}
            helperText={passwordError || undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={handlePasswordBlur}
            required
            fullWidth
            slotProps={shrinkInputLabelSlotProps}
          />
          <TextField
            label={registerFormMessages.labels.passwordConfirm}
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            error={Boolean(passwordConfirmError)}
            helperText={passwordConfirmError || undefined}
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            onBlur={handlePasswordConfirmBlur}
            required
            fullWidth
            slotProps={shrinkInputLabelSlotProps}
          />
          <input
            name="turnstileToken"
            type="hidden"
            value={turnstileToken}
            readOnly
          />
          {shouldShowTurnstile ? <Box ref={turnstileContainerRef} /> : null}
          {retryTurnstileButton}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canRequestOtp}
            fullWidth
          >
            {isRequestOtpPending
              ? registerFormMessages.requestOtpPending
              : registerFormMessages.requestOtp}
          </Button>
        </Box>
      ) : null}

      {isFieldsLocked ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Typography color="text.secondary" variant="body2">
            {registerFormMessages.otpInstruction}
            {cooldownSeconds > 0
              ? ` ${registerFormMessages.getResendCooldownText(cooldownSeconds)}`
              : ""}
          </Typography>
          <Box
            component="form"
            action={submitOtpFormAction}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label={registerFormMessages.labels.email}
              name="email"
              value={requestValues.email}
              fullWidth
              slotProps={readonlyFieldSlotProps}
            />
            <TextField
              label={registerFormMessages.labels.displayName}
              value={requestValues.displayName}
              fullWidth
              slotProps={readonlyFieldSlotProps}
            />
            <TextField
              label={registerFormMessages.labels.otp}
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              error={Boolean(otpCodeError)}
              helperText={otpCodeError || undefined}
              value={otpCode}
              onChange={(event) => handleOtpCodeChange(event.target.value)}
              onBlur={handleOtpCodeBlur}
              required
              fullWidth
              slotProps={shrinkInputLabelSlotProps}
            />
            {submitOtpState.remainingAttempts !== undefined ? (
              <Typography color="text.secondary" variant="body2">
                {registerFormMessages.getRemainingAttemptsText(
                  submitOtpState.remainingAttempts,
                )}
              </Typography>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmitOtp}
              fullWidth
            >
              {isSubmitOtpPending
                ? registerFormMessages.submitOtpPending
                : registerFormMessages.submitOtp}
            </Button>
          </Box>
          {cooldownSeconds <= 0 &&
          !isResendPreparing &&
          !isSubmitOtpPending &&
          !isDonePhase ? (
            <Button type="button" variant="text" onClick={handlePrepareResend}>
              {registerFormMessages.resendOtp}
            </Button>
          ) : null}
          {isResendPreparing && !isDonePhase ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box ref={turnstileContainerRef} />
              {retryTurnstileButton}
              <Button
                type="button"
                variant="outlined"
                disabled={!canResendOtp}
                onClick={handleResendOtp}
                fullWidth
              >
                {isRequestOtpPending
                  ? registerFormMessages.requestOtpPending
                  : registerFormMessages.resendOtp}
              </Button>
            </Box>
          ) : null}
          <Button
            type="button"
            variant="text"
            disabled={isAnyRequestPending}
            onClick={handleModifyRegisterInfo}
          >
            {registerFormMessages.modifyRegisterInfo}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
