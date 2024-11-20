type AsyncFunction = (...args: any[]) => Promise<any>;

export function rateLimit(fn: AsyncFunction, limit: number, interval: number) {
  const calls: number[] = [];

  return async function(...args: any[]) {
    const now = Date.now();
    calls.push(now);
    
    // Remove calls outside the interval window
    while (calls.length && calls[0] <= now - interval) {
      calls.shift();
    }

    if (calls.length > limit) {
      throw new Error('Rate limit exceeded');
    }

    return fn.apply(this, args);
  };
}