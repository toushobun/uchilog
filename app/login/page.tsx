import { login } from "server/actions/auth";
import { redirectIfAuthenticated } from "server/loaders/login";
import { LoginTemplate } from "templates/login/Login";

type LoginRouteProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

function getInitialEmail(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LoginRoute({ searchParams }: LoginRouteProps) {
  await redirectIfAuthenticated();

  const params = await searchParams;

  return (
    <LoginTemplate action={login} initialEmail={getInitialEmail(params.email)} />
  );
}
