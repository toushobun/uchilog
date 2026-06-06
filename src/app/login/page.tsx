import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { redirect } from "next/navigation";

import { createClient } from "lib/supabase/server";

import { LoginForm } from "auth/LoginForm";

import { login } from "server/actions/auth";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: 8,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            UchiLog
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            登录后开始使用记账功能
          </Typography>

          <LoginForm action={login} />
        </Paper>
      </Container>
    </Box>
  );
}
