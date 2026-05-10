const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
const placeholderApiBases = [
  'https://api.lebolink.com',
  'https://your-api-url.com',
  'https://api.yourdomain.com',
];
const runtimeApiBase = placeholderApiBases.includes(rawApiBase) ? '' : rawApiBase;

export function getApiBase() {
  if (runtimeApiBase) {
    return runtimeApiBase;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export const apiBase = getApiBase();

type Options = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export async function apiFetch<T>({ path, method = 'GET', body, headers = {} }: Options): Promise<T> {
  const base = runtimeApiBase || '';
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
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
}
