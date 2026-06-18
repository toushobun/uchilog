import { emailMaxLength, isValidEmailFormat } from "lib/validators/auth";
import { login } from "server/actions/auth";
import { redirectIfAuthenticated } from "server/loaders/login";
import { LoginTemplate } from "templates/login/Login";

type LoginRouteProps = {
  searchParams?: Promise<{ email?: string | string[] }>;
};

function getDefaultEmail(email: string | string[] | undefined) {
  if (typeof email !== "string") return "";

  const normalizedEmail = email.trim();

  if (normalizedEmail.length > emailMaxLength) return "";
  if (!isValidEmailFormat(normalizedEmail)) return "";

  return normalizedEmail;
}

export default async function LoginRoute({ searchParams }: LoginRouteProps) {
  await redirectIfAuthenticated();
  const params = await searchParams;

  return (
    <LoginTemplate
      action={login}
      defaultEmail={getDefaultEmail(params?.email)}
    />
  );
}
