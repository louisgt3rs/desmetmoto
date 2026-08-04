import { describe, it, expect } from "vitest";
import { pickUpcomingEvent } from "./events";

type TestEvent = { event_date?: string | null; date?: string | null; is_upcoming?: boolean | null; title: string };

describe("pickUpcomingEvent", () => {
  it("returns the earliest event on or after today", () => {
    const events: TestEvent[] = [
      { date: "2026-04-21", title: "Past event" },
      { date: "2026-09-10", title: "Next upcoming" },
      { date: "2026-12-01", title: "Later upcoming" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result?.title).toBe("Next upcoming");
  });

  it("prefers event_date over date when both are present", () => {
    const events: TestEvent[] = [
      { date: "2026-01-01", event_date: "2026-09-10", title: "Uses event_date" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result?.title).toBe("Uses event_date");
  });

  it("returns null when every event is in the past", () => {
    const events: TestEvent[] = [
      { date: "2026-04-21", title: "Past event 1" },
      { date: "2026-05-01", title: "Past event 2" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(pickUpcomingEvent([], "2026-08-04")).toBeNull();
  });

  it("excludes events explicitly marked is_upcoming: false even if dated in the future", () => {
    const events: TestEvent[] = [
      { date: "2026-09-10", is_upcoming: false, title: "Hidden" },
      { date: "2026-10-01", title: "Visible" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result?.title).toBe("Visible");
  });
});
