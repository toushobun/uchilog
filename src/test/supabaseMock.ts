import { vi, type Mock } from "vitest";

export type SupabaseMockResponse = {
  count?: number | null;
  data?: unknown;
  error: unknown | null;
};

type QueryMethodName =
  | "eq"
  | "in"
  | "insert"
  | "is"
  | "limit"
  | "maybeSingle"
  | "or"
  | "order"
  | "select"
  | "update";

export type SupabaseQueryMethodCall = {
  args: unknown[];
  method: QueryMethodName;
};

export type SupabaseQueryRecord = {
  calls: SupabaseQueryMethodCall[];
  response: SupabaseMockResponse;
  table: string;
};

type SupabaseQueryMock = PromiseLike<SupabaseMockResponse> &
  Record<QueryMethodName, Mock>;

function toResponse(
  response: Partial<SupabaseMockResponse> = {},
): SupabaseMockResponse {
  return {
    count: null,
    data: null,
    error: null,
    ...response,
  };
}

function createQueryMock(record: SupabaseQueryRecord): SupabaseQueryMock {
  const query = {} as SupabaseQueryMock;

  const addCall = (method: QueryMethodName, args: unknown[]) => {
    record.calls.push({ args, method });
    return query;
  };

  query.select = vi.fn((...args: unknown[]) => addCall("select", args));
  query.insert = vi.fn((...args: unknown[]) => addCall("insert", args));
  query.update = vi.fn((...args: unknown[]) => addCall("update", args));
  query.eq = vi.fn((...args: unknown[]) => addCall("eq", args));
  query.is = vi.fn((...args: unknown[]) => addCall("is", args));
  query.order = vi.fn((...args: unknown[]) => addCall("order", args));
  query.limit = vi.fn((...args: unknown[]) => addCall("limit", args));
  query.or = vi.fn((...args: unknown[]) => addCall("or", args));
  query.in = vi.fn((...args: unknown[]) => addCall("in", args));
  query.maybeSingle = vi.fn(async (...args: unknown[]) => {
    addCall("maybeSingle", args);
    return record.response;
  });
  query.then = <TResult1 = SupabaseMockResponse, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseMockResponse) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => Promise.resolve(record.response).then(onfulfilled, onrejected);

  return query;
}

export function createSupabaseMock(
  options: {
    queryResponses?: Partial<SupabaseMockResponse>[];
    rpcResponse?: Partial<SupabaseMockResponse>;
  } = {},
) {
  const queryResponses = (options.queryResponses ?? []).map(toResponse);
  const queries: SupabaseQueryRecord[] = [];
  const rpc = vi.fn(async () => toResponse(options.rpcResponse));
  const from = vi.fn((table: string) => {
    const response = queryResponses.shift() ?? toResponse();
    const record: SupabaseQueryRecord = {
      calls: [],
      response,
      table,
    };

    queries.push(record);

    return createQueryMock(record);
  });

  return {
    client: { from, rpc },
    from,
    queries,
    queueQueryResponse(response: Partial<SupabaseMockResponse>) {
      queryResponses.push(toResponse(response));
    },
    rpc,
  };
}
