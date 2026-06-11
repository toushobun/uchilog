import { afterEach, describe, expect, it } from "vitest";

import { getDashboardDateRange } from "./dashboardDateRange";

const originalTimezone = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTimezone;
});

describe("getDashboardDateRange", () => {
  it("converts JST month start and next month start to UTC ISO", () => {
    const range = getDashboardDateRange(new Date("2026-06-15T12:00:00.000Z"));

    expect(range.month).toBe("2026-06");
    expect(range.monthStartIso).toBe("2026-05-31T15:00:00.000Z");
    expect(range.monthEndIso).toBe("2026-06-30T15:00:00.000Z");
  });

  it("uses the JST month when UTC is still in the previous month", () => {
    const range = getDashboardDateRange(new Date("2026-05-31T16:00:00.000Z"));

    expect(range.month).toBe("2026-06");
    expect(range.monthStartIso).toBe("2026-05-31T15:00:00.000Z");
    expect(range.monthEndIso).toBe("2026-06-30T15:00:00.000Z");
  });

  it("converts JST today 00:00 to UTC ISO", () => {
    const range = getDashboardDateRange(new Date("2026-06-07T16:00:00.000Z"));

    expect(range.todayStartIso).toBe("2026-06-07T15:00:00.000Z");
  });

  it("uses JST Monday 00:00 as the week start", () => {
    const range = getDashboardDateRange(new Date("2026-06-10T03:00:00.000Z"));

    expect(range.weekStartIso).toBe("2026-06-07T15:00:00.000Z");
  });

  it("keeps JST Sunday in the week that started on the previous Monday", () => {
    const range = getDashboardDateRange(new Date("2026-06-07T14:59:00.000Z"));

    expect(range.todayStartIso).toBe("2026-06-06T15:00:00.000Z");
    expect(range.weekStartIso).toBe("2026-05-31T15:00:00.000Z");
  });

  it("rolls the week start back to the previous month at the beginning of a month", () => {
    const range = getDashboardDateRange(new Date("2026-06-30T16:00:00.000Z"));

    expect(range.todayStartIso).toBe("2026-06-30T15:00:00.000Z");
    expect(range.weekStartIso).toBe("2026-06-28T15:00:00.000Z");
  });

  it("stays stable when the runtime timezone changes", () => {
    const now = new Date("2026-06-07T16:00:00.000Z");

    process.env.TZ = "UTC";
    const utcRange = getDashboardDateRange(now);

    process.env.TZ = "America/Los_Angeles";
    const losAngelesRange = getDashboardDateRange(now);

    expect(losAngelesRange).toEqual(utcRange);
  });
});
