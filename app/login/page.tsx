import { login } from "server/actions/auth";
import { redirectIfAuthenticated } from "server/loaders/login";
import { LoginTemplate } from "templates/login/Login";

export default async function LoginRoute() {
  await redirectIfAuthenticated();

  return <LoginTemplate action={login} />;
}
