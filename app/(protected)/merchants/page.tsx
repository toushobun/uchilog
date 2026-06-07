import { MerchantsHome } from "merchants-page/MerchantsHome";
import { loadMerchantsView } from "server/loaders/merchants";
import { getMerchantErrorMessage } from "utils/pageErrors";

type MerchantsPageProps = {
  searchParams: Promise<{
    error?: string;
    merchantId?: string;
    q?: string;
  }>;
};

export default async function MerchantsPage({
  searchParams,
}: MerchantsPageProps) {
  const params = await searchParams;
  const keyword = params.q ?? "";
  const view = await loadMerchantsView(keyword);

  return (
    <MerchantsHome
      errorMerchantId={params.merchantId ?? null}
      errorMessage={getMerchantErrorMessage(params.error)}
      keyword={keyword}
      ledgerName={view.ledgerName}
      merchants={view.merchants}
    />
  );
}
