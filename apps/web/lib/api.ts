export const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type Options = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export async function apiFetch<T>({ path, method = 'GET', body, headers = {} }: Options): Promise<T> {
  const bases = Array.from(
    new Set([
      apiBase,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ].filter(Boolean))
  );

  let lastErr: any;
  for (const base of bases) {
    try {
      const res = await fetch(`${base}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        mode: 'cors',
      });
      if (!res.ok) {
        const text = await res.text();
        let errorMsg = text || res.statusText;
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || json.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (err) {
      lastErr = err;
      // try next base
    }
  }
  throw new Error((lastErr as Error)?.message || 'Failed to reach API');
}
