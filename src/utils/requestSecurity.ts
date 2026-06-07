export function rejectInvalidOrigin(request: Request) {
  const origin = request.headers.get("origin");

  // Origin 为空通常来自非浏览器客户端或同源服务端调用，此处仅拦截带 Origin 的跨站写请求。
  if (!origin) {
    return null;
  }

  const host = request.headers.get("host");
  if (!host) {
    return Response.json({ error: "origin_invalid" }, { status: 403 });
  }

  try {
    if (new URL(origin).host === host) {
      return null;
    }
  } catch {
    return Response.json({ error: "origin_invalid" }, { status: 403 });
  }

  return Response.json({ error: "origin_invalid" }, { status: 403 });
}
