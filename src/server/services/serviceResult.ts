export type ServiceOk = { ok: true };

export type ServiceError<TError extends string = string> = {
  ok: false;
  error: TError;
};

export type ServiceResult<TError extends string = string> =
  | ServiceOk
  | ServiceError<TError>;
