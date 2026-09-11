import axios, { type AxiosError } from "axios";

// All requests go to /api/* which Next.js rewrites to http://localhost:4010/* (or backend port)
// The backend sets an httpOnly cookie on login — axios sends it automatically.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "x-serenity-portal": "tenant",
  },
});

export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export function apiError(cause: unknown, fallback: string): string {
  const err = cause as AxiosError<{ message?: string | string[] }>;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0];
  if (typeof msg === "string") return msg;
  return fallback;
}
