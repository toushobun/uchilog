import type { TurnstileAdapter, TurnstileRenderOptions } from "./turnstile";

export function createMockTurnstileAdapter(
  token = "mock-turnstile-token",
): TurnstileAdapter {
  let nextId = 1;
  const containers = new Map<string, HTMLElement>();
  const optionsById = new Map<string, TurnstileRenderOptions>();

  return {
    render(container, options) {
      const widgetId = `mock-turnstile-${nextId}`;
      nextId += 1;
      containers.set(widgetId, container);
      optionsById.set(widgetId, options);

      container.replaceChildren();

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "通过人机验证";
      button.addEventListener("click", () => {
        options.callback(token);
      });

      container.appendChild(button);

      return widgetId;
    },
    reset(widgetId) {
      optionsById.get(widgetId)?.callback("");
    },
    remove(widgetId) {
      containers.get(widgetId)?.replaceChildren();
      containers.delete(widgetId);
      optionsById.delete(widgetId);
    },
  };
}
