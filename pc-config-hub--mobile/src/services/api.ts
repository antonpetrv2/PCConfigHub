const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3000/api';

export const API_URL = configuredApiUrl.replace(/\/$/, '');

type ApiEnvelope<T> = {
  data: T | null;
  error: string | null;
  meta: unknown;
};

export type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
};

export type LoginResult = {
  token: string;
  user: ApiUser;
};

export class ApiClientError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
) {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      accept: 'application/json',
      ...(requestOptions.body ? { 'content-type': 'application/json' } : null),
      ...(token ? { authorization: `Bearer ${token}` } : null),
      ...headers,
    },
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError('Unexpected API response.', response.status);
  }

  if (!response.ok || payload.error) {
    throw new ApiClientError(payload.error ?? 'Request failed.', response.status, payload.meta);
  }

  if (payload.data === null) {
    throw new ApiClientError('Missing API response data.', response.status, payload.meta);
  }

  return payload.data;
}

export function loginRequest(email: string, password: string) {
  return apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function meRequest(token: string) {
  return apiRequest<ApiUser>('/auth/me', { token });
}

export function logoutRequest(token: string | null) {
  return apiRequest<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    token,
  });
}
