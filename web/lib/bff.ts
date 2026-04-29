export const BFF_URL =
  process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:4000";

export async function bffFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BFF_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`BFF ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
