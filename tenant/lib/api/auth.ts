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

export type RegistrationPlan = {
  id: string;
  name: string;
  price: number;
  interval: string;
  staffLimit: number | null;
  features: string[];
};

export async function getRegistrationPlans(): Promise<RegistrationPlan[]> {
  return (await api.get<RegistrationPlan[]>("/auth/registration/plans")).data;
}

export type TenantRegistration = {
  businessName: string;
  ownerName: string;
  slug: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  planId?: string;
};

export async function registerTenant(payload: TenantRegistration) {
  return (await api.post("/auth/register/tenant", payload)).data;
}
