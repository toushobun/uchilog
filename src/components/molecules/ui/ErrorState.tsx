import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { SectionCard } from "molecules/ui/SectionCard";

type ErrorStateProps = {
  action?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};

export function ErrorState({
  action,
  description = "请稍后再试，或返回上一页重新操作。",
  title = "发生错误",
}: ErrorStateProps) {
  return (
    <SectionCard role="alert" sx={{ borderColor: "error.light" }}>
      <Stack spacing={2}>
        <Typography color="error.main" variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary">{description}</Typography>
        ) : null}
        {action ? <Box>{action}</Box> : null}
      </Stack>
    </SectionCard>
  );
}

export function ErrorRetryButton({
  children = "重试",
}: {
  children?: ReactNode;
}) {
  return <Button variant="outlined">{children}</Button>;
}
