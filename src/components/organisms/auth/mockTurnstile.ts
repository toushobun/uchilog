import type { TurnstileApi, TurnstileRenderOptions } from "./turnstile";

export function installMockTurnstile(responseValue = "turnstile-ok") {
  let widgetIndex = 0;
  const widgetOptions = new Map<string, TurnstileRenderOptions>();

  const mockTurnstile: TurnstileApi = {
    render: (container, options) => {
      const widgetId = `mock-turnstile-${widgetIndex}`;
      widgetIndex += 1;
      widgetOptions.set(widgetId, options);
      container.setAttribute("data-turnstile-widget-id", widgetId);
      options.callback(responseValue);
      return widgetId;
    },
    remove: (widgetId) => {
      widgetOptions.delete(widgetId);
    },
    reset: (widgetId) => {
      widgetOptions.get(widgetId)?.callback(responseValue);
    },
  };

  window.turnstile = mockTurnstile;

  return mockTurnstile;
}
