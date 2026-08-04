export interface UpcomingEventCandidate {
  event_date?: string | null;
  date?: string | null;
  is_upcoming?: boolean | null;
}

export function pickUpcomingEvent<T extends UpcomingEventCandidate>(
  events: T[],
  todayISO: string
): T | null {
  return events.find(
    (event) => (event.event_date || event.date || "") >= todayISO && event.is_upcoming !== false
  ) ?? null;
}
