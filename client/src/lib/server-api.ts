const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResult<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export async function serverFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const json: ApiResult<T> = await res.json();
  if (!json.success) throw new Error(json.message || 'Request failed');
  return json.data;
}

export async function serverFetchWithMeta<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; pagination?: ApiResult<T>['pagination'] }> {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    next: { revalidate: 30 },
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const json: ApiResult<T> = await res.json();
  if (!json.success) throw new Error(json.message || 'Request failed');
  return { data: json.data, pagination: json.pagination };
}

export { API_URL };
