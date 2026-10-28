/**
 * Wraps local reads in a short delay so loading states are visible, and can inject a failure
 * when "Simulate load errors" is on. This stands in for future API calls.
 */
export class SimulatedNetworkError extends Error {
  constructor() {
    super('Could not load drivers. This failure was simulated from Settings.');
    this.name = 'SimulatedNetworkError';
  }
}

export async function simulateRequest<T>(produce: () => T, opts: { fail?: boolean; delayMs?: number } = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, opts.delayMs ?? 650));
  if (opts.fail) throw new SimulatedNetworkError();
  return produce();
}
