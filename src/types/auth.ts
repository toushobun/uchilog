export type BaseActionState = {
  error?: string;
  success?: string;
};

export type LoginActionState = Pick<BaseActionState, "error">;
