import { api } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  tenantSlug: string | null;
};

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await api.post<{ user: AuthUser }>("/auth/login", {
    email,
    password,
  });
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<AuthUser>("/auth/me");
  return res.data;
}
