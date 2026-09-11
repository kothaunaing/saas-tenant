import { api, type PaginatedResult, type PaginationParams } from './client';

export type WorkDay = {
  dayOfWeek: number;
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  breaks: { start: string; end: string }[];
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  services: string[];
  hours: WorkDay[];
  createdAt?: string;
  updatedAt?: string;
};

export interface QueryStaffParams extends PaginationParams {
  search?: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  phone?: string;
  role: string;
  active?: boolean;
  services?: string[];
  hours?: WorkDay[];
}

export type UpdateStaffPayload = Partial<CreateStaffPayload>;

export const staffKey = (slug: string, params?: QueryStaffParams) =>
  ['tenant', slug, 'staff', params] as const;

export async function getStaffList(
  slug: string,
  params?: QueryStaffParams,
): Promise<PaginatedResult<Staff>> {
  const res = await api.get<PaginatedResult<Staff>>(
    `/tenants/${slug}/staff`,
    { params },
  );
  return res.data;
}

export async function getStaffMember(
  slug: string,
  id: string,
): Promise<Staff> {
  const res = await api.get<Staff>(`/tenants/${slug}/staff/${id}`);
  return res.data;
}

export async function createStaff(
  slug: string,
  payload: CreateStaffPayload,
): Promise<Staff> {
  const res = await api.post<Staff>(`/tenants/${slug}/staff`, payload);
  return res.data;
}

export async function updateStaff(
  slug: string,
  id: string,
  payload: UpdateStaffPayload,
): Promise<Staff> {
  const res = await api.patch<Staff>(`/tenants/${slug}/staff/${id}`, payload);
  return res.data;
}

export async function deleteStaff(
  slug: string,
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/tenants/${slug}/staff/${id}`,
  );
  return res.data;
}
