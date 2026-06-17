import "server-only";

type TurnstileSiteVerifyResponse = {
  success?: boolean;
};

function isTurnstileSiteVerifyResponse(
  value: unknown,
): value is TurnstileSiteVerifyResponse {
  return typeof value === "object" && value !== null;
}

export async function verifyTurnstileToken(params: {
  remoteIp?: string | null;
  token: string;
}) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret || !params.token) {
    return false;
  }

  const body = new URLSearchParams({
    response: params.token,
    secret,
  });

  if (params.remoteIp) {
    body.set("remoteip", params.remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body,
        method: "POST",
      },
    );

    if (!response.ok) {
      return false;
    }

    const data: unknown = await response.json();

    return isTurnstileSiteVerifyResponse(data) && data.success === true;
  } catch {
    return false;
  }
}
