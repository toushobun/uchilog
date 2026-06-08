import {
  archiveMerchant,
  archiveMerchantAlias,
  createMerchant,
  createMerchantAlias,
  updateMerchant,
} from "server/actions/merchants";
import { loadMerchantsView } from "server/loaders/merchants";
import { MerchantsTemplate } from "templates/merchants/Merchants";
import { getMerchantErrorMessage } from "utils/pageErrors";

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; merchantId?: string; q?: string }>;
}) {
  const params = await searchParams;
  const keyword = params.q ?? "";
  const view = await loadMerchantsView(keyword);

  return (
    <MerchantsTemplate
      archiveMerchantAction={archiveMerchant}
      archiveMerchantAliasAction={archiveMerchantAlias}
      createMerchantAction={createMerchant}
      createMerchantAliasAction={createMerchantAlias}
      errorMerchantId={params.merchantId ?? null}
      errorMessage={getMerchantErrorMessage(params.error)}
      keyword={keyword}
      ledgerName={view.ledgerName}
      merchants={view.merchants}
      updateMerchantAction={updateMerchant}
    />
  );
}
