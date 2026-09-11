import { api, type PaginatedResult, type PaginationParams } from './client';

export type Appointment = {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  status: string;
  rawStatus?: string;
  notes: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  staff?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export interface QueryAppointmentsParams extends PaginationParams {
  search?: string;
  date?: string;
  status?: string;
  staffId?: string;
  customerId?: string;
}

export interface CreateAppointmentPayload {
  customerId: string;
  serviceId: string;
  staffId: string;
  startsAt?: string;
  date?: string;
  time?: string;
  status?: string;
  notes?: string;
}

export interface UpdateAppointmentPayload extends Partial<CreateAppointmentPayload> {}

export const appointmentsKey = (slug: string, params?: QueryAppointmentsParams) =>
  ['tenant', slug, 'appointments', params] as const;

export async function getAppointments(
  slug: string,
  params?: QueryAppointmentsParams,
): Promise<PaginatedResult<Appointment>> {
  const res = await api.get<PaginatedResult<Appointment>>(
    `/tenants/${slug}/appointments`,
    { params },
  );
  return res.data;
}

export async function getAppointment(
  slug: string,
  id: string,
): Promise<Appointment> {
  const res = await api.get<Appointment>(`/tenants/${slug}/appointments/${id}`);
  return res.data;
}

export async function createAppointment(
  slug: string,
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  const res = await api.post<Appointment>(
    `/tenants/${slug}/appointments`,
    payload,
  );
  return res.data;
}

export async function updateAppointment(
  slug: string,
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  const res = await api.patch<Appointment>(
    `/tenants/${slug}/appointments/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteAppointment(
  slug: string,
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/tenants/${slug}/appointments/${id}`,
  );
  return res.data;
}
