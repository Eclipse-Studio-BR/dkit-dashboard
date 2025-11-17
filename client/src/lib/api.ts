import type { ApiKey, MeResponse, MetricsResponse, Transaction } from "@shared/schema";

export type SerializedApiKey = Omit<ApiKey, "createdAt"> & { createdAt: string };

export type TimeRange = "1D" | "7D" | "1M" | "3M" | "All";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    const message = (await res.text()) || res.statusText;
    throw new Error(message);
  }

  if (res.status === 204) {
    // @ts-expect-error - void response
    return undefined;
  }

  return res.json();
}

export function buildTimeRangeParams(range: TimeRange) {
  const now = new Date();
  const to = now.toISOString();
  let from: string;

  switch (range) {
    case "1D":
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      break;
    case "7D":
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "1M":
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "3M":
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "All":
    default:
      from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      break;
  }

  const params = new URLSearchParams({ from, to });
  return `?${params.toString()}`;
}

// Auth / session
export function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/me");
}

// Metrics
export function getMetrics(range: TimeRange): Promise<MetricsResponse> {
  const params = buildTimeRangeParams(range);
  return request<MetricsResponse>(`/api/metrics${params}`);
}

export function getTransactions(limit?: number): Promise<Transaction[]> {
  const query = limit ? `?limit=${limit}` : "";
  return request<Transaction[]>(`/api/transactions${query}`);
}

// API Keys
export function listApiKeys(): Promise<SerializedApiKey[]> {
  return request<SerializedApiKey[]>("/api/keys");
}

export function createApiKey(name: string): Promise<SerializedApiKey> {
  return request<SerializedApiKey>("/api/keys", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ name }),
  });
}

export function deleteApiKey(id: string): Promise<void> {
  return request<void>(`/api/keys/${id}`, {
    method: "DELETE",
  });
}
