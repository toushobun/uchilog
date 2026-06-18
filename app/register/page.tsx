import { requestRegisterOtp, submitRegisterOtp } from "server/actions/auth";
import { redirectIfAuthenticated } from "server/loaders/login";
import { RegisterTemplate } from "templates/register/Register";

export default async function RegisterRoute() {
  await redirectIfAuthenticated();

  return (
    <RegisterTemplate
      requestOtpAction={requestRegisterOtp}
      submitOtpAction={submitRegisterOtp}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
    />
  );
}
