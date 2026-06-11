import Stack, { type StackProps } from "@mui/material/Stack";
import type { ReactNode } from "react";

type FormActionsProps = StackProps & {
  children: ReactNode;
};

export function FormActions({ children, sx, ...props }: FormActionsProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={[
        {
          justifyContent: "flex-end",
          pt: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Stack>
  );
}
