const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type OptionalTextResult =
  | { ok: true; value: string | null }
  | { ok: false };

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function getFormText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function parseOptionalText(
  value: string,
  maxLength: number,
): OptionalTextResult {
  if (value.length === 0) {
    return { ok: true, value: null };
  }

  if (value.length > maxLength) {
    return { ok: false };
  }

  return { ok: true, value };
}
