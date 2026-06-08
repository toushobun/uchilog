import Stack from "@mui/material/Stack";

import type { MerchantRow } from "types/merchants";
import { EmptyState } from "ui-molecules/EmptyState";

import { MerchantCard } from "./MerchantCard";
import type { MerchantAction } from "./types";

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
      {merchants.map((merchant) => (
        <MerchantCard
          archiveAliasAction={archiveAliasAction}
          archiveMerchantAction={archiveMerchantAction}
          createAliasAction={createAliasAction}
          errorMessage={errorMerchantId === merchant.id ? errorMessage : null}
          key={merchant.id}
          merchant={merchant}
          updateMerchantAction={updateMerchantAction}
        />
      ))}
    </Stack>
  );
}
