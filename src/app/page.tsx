import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function Home() {
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
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            UchiLog
          </Typography>
          <Typography color="text.secondary">记账应用开发中</Typography>
        </Paper>
      </Container>
    </Box>
  );
}
