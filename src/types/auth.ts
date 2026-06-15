export type BaseActionState = {
  success?: string;
  error?: string;
};

export type LoginActionState = Pick<BaseActionState, "error">;
