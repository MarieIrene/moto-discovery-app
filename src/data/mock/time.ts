/** Mock dates are generated relative to the moment the demo data is seeded, so date filters stay meaningful. */
export function hoursAgo(hours: number, from: Date = new Date()): string {
  return new Date(from.getTime() - hours * 3_600_000).toISOString();
}

export function daysAgo(days: number, hour = 9, from: Date = new Date()): string {
  const d = new Date(from.getTime() - days * 86_400_000);
  d.setHours(hour, (days * 17) % 60, 0, 0);
  return d.toISOString();
}
