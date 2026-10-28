let counter = 0;

/** Locally unique id for demo records. A backend would assign real ids. */
export function createId(prefix: string): string {
  counter = (counter + 1) % 10_000;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
