import { api, type PaginatedResult, type PaginationParams } from './client';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  notes: string;
  visits: number;
  noShow: number;
  spent: number;
  last: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface QueryCustomersParams extends PaginationParams {
  search?: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  points?: number;
  notes?: string;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {}

export const customersKey = (slug: string, params?: QueryCustomersParams) =>
  ['tenant', slug, 'customers', params] as const;

export async function getCustomers(
  slug: string,
  params?: QueryCustomersParams,
): Promise<PaginatedResult<Customer>> {
  const res = await api.get<PaginatedResult<Customer>>(
    `/tenants/${slug}/customers`,
    { params },
  );
  return res.data;
}

export async function getCustomer(
  slug: string,
  id: string,
): Promise<Customer> {
  const res = await api.get<Customer>(`/tenants/${slug}/customers/${id}`);
  return res.data;
}

export async function createCustomer(
  slug: string,
  payload: CreateCustomerPayload,
): Promise<Customer> {
  const res = await api.post<Customer>(
    `/tenants/${slug}/customers`,
    payload,
  );
  return res.data;
}

export async function updateCustomer(
  slug: string,
  id: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  const res = await api.patch<Customer>(
    `/tenants/${slug}/customers/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteCustomer(
  slug: string,
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/tenants/${slug}/customers/${id}`,
  );
  return res.data;
}
