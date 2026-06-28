"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { typographyStyles } from "theme/typographyTokens";

type TransactionFormHeaderProps = {
  closeHref: string;
  formId?: string;
  isSubmitDisabled: boolean;
  ledgerName?: string;
  title: string;
};

export function TransactionFormHeader({
  closeHref,
  formId,
  isSubmitDisabled,
  ledgerName,
  title,
}: TransactionFormHeaderProps) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Button
          component={Link}
          href={closeHref}
          variant="text"
          sx={{ color: "var(--user-theme-action-text)" }}
        >
          关闭
        </Button>
        <Typography
          component="h1"
          variant="h5"
          sx={{ ...typographyStyles.pageTitle, textAlign: "center" }}
        >
          {title}
        </Typography>
        <Button
          disabled={isSubmitDisabled}
          form={formId}
          type="submit"
          variant="contained"
          sx={{
            "&:not(.Mui-disabled)": {
              background: "var(--user-theme-fab-bg)",
              color: "white",
            },
          }}
        >
          保存
        </Button>
      </Stack>
      {ledgerName ? (
        <Typography
          color="text.secondary"
          sx={{ ...typographyStyles.body, textAlign: "center" }}
          variant="body2"
        >
          当前账本：{ledgerName}
        </Typography>
      ) : null}
    </Stack>
  );
}
