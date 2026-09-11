import { api, type PaginatedResult, type PaginationParams } from "./client";

export type Service = {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  active: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface QueryServicesParams extends PaginationParams {
  search?: string;
  category?: string;
}

export interface CreateServicePayload {
  name: string;
  category: string;
  duration: number;
  price: number;
  active?: boolean;
  description?: string;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

export const servicesKey = (slug: string, params?: QueryServicesParams) =>
  ["tenant", slug, "services", params] as const;

export async function getServices(
  slug: string,
  params?: QueryServicesParams,
): Promise<PaginatedResult<Service>> {
  const res = await api.get<PaginatedResult<Service>>(
    `/tenants/${slug}/services`,
    { params },
  );
  return res.data;
}

export async function getService(slug: string, id: string): Promise<Service> {
  const res = await api.get<Service>(`/tenants/${slug}/services/${id}`);
  return res.data;
}

export async function createService(
  slug: string,
  payload: CreateServicePayload,
): Promise<Service> {
  const res = await api.post<Service>(`/tenants/${slug}/services`, payload);
  return res.data;
}

export async function updateService(
  slug: string,
  id: string,
  payload: UpdateServicePayload,
): Promise<Service> {
  const res = await api.patch<Service>(
    `/tenants/${slug}/services/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteService(
  slug: string,
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/tenants/${slug}/services/${id}`,
  );
  return res.data;
}
