import { turnstileTestSiteKey } from "config/turnstile";
import { requestRegisterOtp, submitRegisterOtp } from "server/actions/auth";
import { redirectIfAuthenticated } from "server/loaders/login";
import { RegisterTemplate } from "templates/register/Register";

function getTurnstileSiteKey() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (siteKey) return siteKey;
  if (process.env.NODE_ENV !== "production") return turnstileTestSiteKey;

  throw new Error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is required in production.");
}

export default async function RegisterRoute() {
  await redirectIfAuthenticated();

  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <RegisterTemplate
      requestOtpAction={requestRegisterOtp}
      submitOtpAction={submitRegisterOtp}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}
