import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export function HomeTemplate() {
  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        minHeight: "100vh",
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            p: { xs: 4, sm: 6 },
            textAlign: "center",
          }}
        >
          <Typography
            component="h1"
            gutterBottom
            variant="h3"
            sx={{ fontWeight: 700 }}
          >
            UchiLog
          </Typography>
          <Typography color="text.secondary">记账应用开发中</Typography>
        </Paper>
      </Container>
    </Box>
  );
}
