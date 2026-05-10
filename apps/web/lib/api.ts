const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
const placeholderApiBases = [
  'https://api.lebolink.com',
  'https://your-api-url.com',
  'https://api.yourdomain.com',
];
const runtimeApiBase = placeholderApiBases.includes(rawApiBase) ? '' : rawApiBase;

function requireApiBase() {
  if (runtimeApiBase) {
    return runtimeApiBase;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing NEXT_PUBLIC_API_BASE_URL in Vercel environment variables. ' +
        'Set NEXT_PUBLIC_API_BASE_URL to your deployed backend API URL, for example https://lebolink-api.onrender.com.'
    );
  }
  return 'http://localhost:3001';
}

export function getApiBase() {
  return requireApiBase();
}

export const apiBase = getApiBase();

type Options = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export async function apiFetch<T>({ path, method = 'GET', body, headers = {} }: Options): Promise<T> {
  const base = requireApiBase();
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

export async function parseResponseBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return { message: text || response.statusText } as unknown as T;
  }
}
