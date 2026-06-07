import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { MerchantAliasForm } from "merchants/MerchantAliasForm";
import { MerchantEditForm } from "merchants/MerchantEditForm";
import type { MerchantRow } from "types/merchants";
import { GlassCard } from "ui/GlassCard";
import { EmptyState } from "ui-molecules/EmptyState";
import { getMerchantInitial } from "utils/merchants";

type MerchantAction = (formData: FormData) => void | Promise<void>;

type MerchantListProps = {
  archiveAliasAction: MerchantAction;
  archiveMerchantAction: MerchantAction;
  createAliasAction: MerchantAction;
  errorMerchantId: string | null;
  errorMessage: string | null;
  merchants: MerchantRow[];
  updateMerchantAction: MerchantAction;
};

export function MerchantList({
  archiveAliasAction,
  archiveMerchantAction,
  createAliasAction,
  errorMerchantId,
  errorMessage,
  merchants,
  updateMerchantAction,
}: MerchantListProps) {
  if (merchants.length === 0) {
    return (
      <EmptyState title="还没有商家" description="请先新增一个常用商家。" />
    );
  }

  return (
    <Stack spacing={2.5} sx={{ mt: 4 }}>
      {merchants.map((merchant) => {
        const merchantErrorMessage =
          errorMerchantId === merchant.id ? errorMessage : null;

        return (
          <GlassCard
            key={merchant.id}
            sx={{
              borderColor: merchantErrorMessage
                ? "error.main"
                : "var(--user-theme-card-border)",
              p: 3,
            }}
          >
            {merchantErrorMessage ? (
              <Typography color="error" role="alert" sx={{ mb: 2 }}>
                {merchantErrorMessage}
              </Typography>
            ) : null}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
                <Avatar src={merchant.icon_url ?? undefined}>
                  {getMerchantInitial(merchant.name)}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="h2"
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    {merchant.name}
                  </Typography>

                  {merchant.website_url ? (
                    <Link
                      href={merchant.website_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {merchant.website_url}
                    </Link>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      网址未设置
                    </Typography>
                  )}

                  {merchant.note ? (
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      variant="body2"
                    >
                      {merchant.note}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>

              <Stack
                component="form"
                action={archiveMerchantAction}
                sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
              >
                <input name="merchantId" type="hidden" value={merchant.id} />
                <Button color="error" type="submit" variant="outlined">
                  归档商家
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              别名
            </Typography>

            {merchant.aliases.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, flexWrap: "wrap" }}
              >
                {merchant.aliases.map((alias) => (
                  <Stack
                    key={alias.id}
                    component="form"
                    action={archiveAliasAction}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <input name="aliasId" type="hidden" value={alias.id} />
                    <Chip label={alias.alias} size="small" />
                    <Button
                      color="error"
                      size="small"
                      type="submit"
                      variant="text"
                    >
                      移除
                    </Button>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                还没有别名。
              </Typography>
            )}

            <MerchantAliasForm
              action={createAliasAction}
              merchantId={merchant.id}
            />

            <Divider sx={{ my: 3 }} />
            <MerchantEditForm
              action={updateMerchantAction}
              merchant={merchant}
            />
          </GlassCard>
        );
      })}
    </Stack>
  );
}
