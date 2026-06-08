import Stack from "@mui/material/Stack";

import type { ServerAction } from "types/actions";
import type { MerchantRow } from "types/merchants";
import { EmptyState } from "molecules/ui/EmptyState";

import { MerchantCard } from "./MerchantCard";

type MerchantListProps = {
  archiveAliasAction: ServerAction;
  archiveMerchantAction: ServerAction;
  createAliasAction: ServerAction;
  errorMerchantId: string | null;
  errorMessage: string | null;
  merchants: MerchantRow[];
  updateMerchantAction: ServerAction;
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
