import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { archiveMerchant, archiveMerchantAlias } from "./actions";
import { MerchantAliasForm } from "./merchant-alias-form";
import { MerchantEditForm } from "./merchant-edit-form";
import { getMerchantInitial, type MerchantRow } from "./types";

type MerchantListProps = {
  errorMerchantId: string | null;
  errorMessage: string | null;
  merchants: MerchantRow[];
};

export function MerchantList({
  errorMerchantId,
  errorMessage,
  merchants,
}: MerchantListProps) {
  if (merchants.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ mt: 4, p: 3, border: "1px dashed", borderColor: "divider" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          还没有商家
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          请先新增一个常用商家。
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ mt: 4 }}>
      {merchants.map((merchant) => {
        const merchantErrorMessage =
          errorMerchantId === merchant.id ? errorMessage : null;

        return (
          <Paper
            key={merchant.id}
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: merchantErrorMessage ? "error.main" : "divider",
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
                action={archiveMerchant}
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
                    action={archiveMerchantAlias}
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

            <MerchantAliasForm merchantId={merchant.id} />

            <Divider sx={{ my: 3 }} />
            <MerchantEditForm merchant={merchant} />
          </Paper>
        );
      })}
    </Stack>
  );
}
