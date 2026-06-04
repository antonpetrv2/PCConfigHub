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

export type Visibility = 'private' | 'public';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApiCategory =
  | 'motherboard'
  | 'cpu'
  | 'gpu'
  | 'ram'
  | 'psu'
  | 'case'
  | 'storage'
  | 'soundcard';

export type PartRecord = {
  id: number;
  category: ApiCategory;
  ownerUserId: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  visibility: Visibility;
  approvalStatus: ApprovalStatus;
  specs: Record<string, unknown>;
  images: { url: string; altText: string | null }[];
};

export type ConfigSummary = {
  id: number;
  name: string;
  ownerName: string;
  description: string | null;
  visibility: Visibility;
  approvalStatus: ApprovalStatus;
  ownerUserId: number;
  createdAt: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  partsCount: number;
  estimatedWattage: number;
};

export type ConfigDetails = Omit<ConfigSummary, 'partsCount' | 'estimatedWattage'> & {
  compatibility: {
    compatible: boolean;
    warnings: string[];
    errors: string[];
  };
  parts: PartRecord[];
};

export type SaveConfigPayload = {
  name: string;
  description?: string;
  visibility: Visibility;
  parts: number[];
};

export type SaveConfigResult = {
  id: number;
  compatibility: {
    compatible: boolean;
    warnings: string[];
    errors: string[];
  };
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

export function forgotPasswordRequest(email: string) {
  return apiRequest<{ success: boolean; resetUrl: string | null }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordRequest(token: string, password: string) {
  return apiRequest<{ success: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function changePasswordRequest(
  currentPassword: string,
  newPassword: string,
  token: string
) {
  return apiRequest<{ success: boolean }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
    token,
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

export function listConfigsRequest(token?: string | null) {
  return apiRequest<ConfigSummary[]>('/configs?limit=100', { token });
}

export function getConfigRequest(id: number, token?: string | null) {
  return apiRequest<ConfigDetails>(`/configs/${id}`, { token });
}

export function listPartsRequest(category: ApiCategory, token?: string | null) {
  return apiRequest<PartRecord[]>(
    `/parts?category=${encodeURIComponent(category)}&limit=100`,
    { token }
  );
}

export function createConfigRequest(payload: SaveConfigPayload, token: string) {
  return apiRequest<SaveConfigResult>('/configs', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateConfigRequest(id: number, payload: SaveConfigPayload, token: string) {
  return apiRequest<SaveConfigResult>(`/configs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  });
}
