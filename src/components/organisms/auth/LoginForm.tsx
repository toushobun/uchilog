"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useActionState } from "react";

import type { LoginActionState } from "types/auth";

type LoginFormProps = {
  action: (
    prevState: LoginActionState,
    formData: FormData,
  ) => Promise<LoginActionState>;
};

const initialState: LoginActionState = {};
const shrinkInputLabelSlotProps = {
  inputLabel: {
    shrink: true,
  },
} as const;

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Box
      component="form"
      action={formAction}
      sx={{
        display: "grid",
        gap: 2,
      }}
    >
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}

      <TextField
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        required
        fullWidth
        slotProps={shrinkInputLabelSlotProps}
      />

      <TextField
        label="密码"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        fullWidth
        slotProps={shrinkInputLabelSlotProps}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isPending}
        fullWidth
      >
        {isPending ? "登录中..." : "登录"}
      </Button>
    </Box>
  );
}
