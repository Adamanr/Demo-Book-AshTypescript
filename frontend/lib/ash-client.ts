const PHOENIX_URL = process.env.PHOENIX_URL ?? "http://localhost:4000";

/**
 * Use this as `customFetch` in Server Components — calls Phoenix directly.
 * Client Components use the default fetch (proxied via next.config.ts rewrites).
 */
export const serverFetch = (
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => fetch(`${PHOENIX_URL}${url}`, init);
