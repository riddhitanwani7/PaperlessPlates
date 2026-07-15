import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  let body: ApiResponse<T> | { success: false; message?: string };
  try {
    body = await response.json();
  } catch {
    throw new ApiError("Unexpected server response", response.status);
  }

  if (!response.ok || !body.success) {
    throw new ApiError(body.message ?? "Request failed", response.status);
  }

  return body.data;
}

export function authHeaders(token: string, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function apiRequestAuth<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...options,
    headers: authHeaders(token, options.headers),
  });
}

export async function apiUploadAuth<T>(
  path: string,
  token: string,
  formData: FormData,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  let body: ApiResponse<T> | { success: false; message?: string };
  try {
    body = await response.json();
  } catch {
    throw new ApiError("Unexpected server response", response.status);
  }

  if (!response.ok || !body.success) {
    throw new ApiError(body.message ?? "Request failed", response.status);
  }

  return body.data;
}
