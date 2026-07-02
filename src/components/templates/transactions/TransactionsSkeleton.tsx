import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export function TransactionsSkeleton() {
  return (
    <Stack spacing={1.2}>
      {[0, 1, 2].map((index) => (
        <Stack
          key={index}
          spacing={1.2}
          sx={{
            borderBottom: "1px solid var(--user-theme-card-border)",
            py: 1.1,
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Skeleton height={24} sx={{ borderRadius: 1 }} width="36%" />
            <Skeleton height={24} sx={{ borderRadius: 1 }} width="42%" />
          </Stack>
          <Skeleton height={60} sx={{ borderRadius: 0.75 }} variant="rounded" />
          <Skeleton height={60} sx={{ borderRadius: 0.75 }} variant="rounded" />
        </Stack>
      ))}
    </Stack>
  );
}
