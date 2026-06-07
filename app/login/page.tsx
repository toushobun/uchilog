import { LoginPage as LoginPageView } from "login-page/LoginPage";
import { loadLoginView } from "server/loaders/login";

export default async function LoginPage() {
  await loadLoginView();

  return <LoginPageView />;
}
