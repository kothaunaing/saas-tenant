import { api } from "./client";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  type Customer,
  type CreateCustomerPayload,
} from "./customers";
import {
  createService,
  deleteService,
  getServices,
  updateService,
  type Service,
  type CreateServicePayload,
} from "./services";
import {
  createStaff,
  deleteStaff,
  getStaffList,
  updateStaff,
  type Staff,
  type CreateStaffPayload,
} from "./staff";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
  type Appointment,
  type CreateAppointmentPayload,
} from "./appointments";
import {
  createReward,
  deleteReward,
  getRewards,
  updateReward,
  type Reward,
  type CreateRewardPayload,
} from "./rewards";
import type { PaginatedResult } from "./client";

export type WorkspaceSettings = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  currency: string;
  confirmation: boolean;
  reminders: boolean;
  loyalty: boolean;
  pointsPerDollar: number;
  plan: string | null;
};

export type WorkspaceData = {
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  appointments: Appointment[];
  rewards: Reward[];
  settings: WorkspaceSettings;
};

export const workspaceKey = (slug: string) =>
  ["tenant", slug, "workspace"] as const;

async function getAllPages<T>(
  request: (page: number, size: number) => Promise<PaginatedResult<T>>,
): Promise<T[]> {
  const size = 100;
  const first = await request(1, size);
  if (first.meta.totalPages <= 1) return first.data;

  const remaining = await Promise.all(
    Array.from({ length: first.meta.totalPages - 1 }, (_, index) =>
      request(index + 2, size),
    ),
  );
  return [first, ...remaining].flatMap((page) => page.data);
}

export async function getWorkspace(slug: string): Promise<WorkspaceData> {
  const [settings, customers, services, staff, appointments, rewards] =
    await Promise.all([
      api
        .get<WorkspaceSettings>(`/tenants/${slug}/settings`)
        .then((response) => response.data),
      getAllPages((page, size) => getCustomers(slug, { page, size })),
      getAllPages((page, size) => getServices(slug, { page, size })),
      getAllPages((page, size) => getStaffList(slug, { page, size })),
      getAllPages((page, size) => getAppointments(slug, { page, size })),
      getAllPages((page, size) => getRewards(slug, { page, size })),
    ]);

  return { settings, customers, services, staff, appointments, rewards };
}

export async function saveWorkspace(
  slug: string,
  current: WorkspaceData,
  updated: WorkspaceData,
): Promise<WorkspaceData> {
  const removed = <T extends { id: string }>(before: T[], after: T[]) => {
    const ids = new Set(after.map((item) => item.id));
    return before.filter((item) => !ids.has(item.id));
  };
  const existing = <T extends { id: string }>(items: T[]) =>
    new Map(items.map((item) => [item.id, item]));
  const changed = (before: unknown, after: unknown) =>
    JSON.stringify(before) !== JSON.stringify(after);

  const customerPayload = (item: Customer): CreateCustomerPayload => ({
    name: item.name,
    email: item.email,
    phone: item.phone || undefined,
    points: item.points,
    notes: item.notes || undefined,
  });
  const servicePayload = (item: Service): CreateServicePayload => ({
    name: item.name,
    category: item.category,
    duration: item.duration,
    price: item.price,
    active: item.active,
    description: item.description || undefined,
  });
  const rewardPayload = (item: Reward): CreateRewardPayload => ({
    name: item.name,
    points: item.points,
    description: item.description || undefined,
    active: item.active,
  });
  const status = (value: string) =>
    ({
      Pending: "PENDING",
      Confirmed: "CONFIRMED",
      "In progress": "IN_PROGRESS",
      Completed: "COMPLETED",
      Cancelled: "CANCELLED",
      "No-show": "NO_SHOW",
    })[value] ?? value;

  await Promise.all(
    removed(current.appointments, updated.appointments).map((item) =>
      deleteAppointment(slug, item.id),
    ),
  );
  await Promise.all([
    ...removed(current.staff, updated.staff).map((item) =>
      deleteStaff(slug, item.id),
    ),
    ...removed(current.rewards, updated.rewards).map((item) =>
      deleteReward(slug, item.id),
    ),
    ...removed(current.services, updated.services).map((item) =>
      deleteService(slug, item.id),
    ),
    ...removed(current.customers, updated.customers).map((item) =>
      deleteCustomer(slug, item.id),
    ),
  ]);

  const customerIds = new Map<string, string>();
  const serviceIds = new Map<string, string>();
  const staffIds = new Map<string, string>();
  const oldCustomers = existing(current.customers);
  const oldServices = existing(current.services);
  const oldStaff = existing(current.staff);
  const oldRewards = existing(current.rewards);
  const oldAppointments = existing(current.appointments);

  for (const item of updated.customers) {
    const payload = customerPayload(item);
    const before = oldCustomers.get(item.id);
    const saved = before
      ? changed(customerPayload(before), payload)
        ? await updateCustomer(slug, item.id, payload)
        : item
      : await createCustomer(slug, payload);
    customerIds.set(item.id, saved.id);
  }

  for (const item of updated.services) {
    const payload = servicePayload(item);
    const before = oldServices.get(item.id);
    const saved = before
      ? changed(servicePayload(before), payload)
        ? await updateService(slug, item.id, payload)
        : item
      : await createService(slug, payload);
    serviceIds.set(item.id, saved.id);
  }

  const staffPayload = (item: Staff): CreateStaffPayload => ({
    name: item.name,
    email: item.email,
    phone: item.phone || undefined,
    role: item.role,
    active: item.active,
    services: item.services.map((id) => serviceIds.get(id) ?? id),
    hours: item.hours,
  });
  for (const item of updated.staff) {
    const payload = staffPayload(item);
    const before = oldStaff.get(item.id);
    const saved = before
      ? changed(staffPayload(before), payload)
        ? await updateStaff(slug, item.id, payload)
        : item
      : await createStaff(slug, payload);
    staffIds.set(item.id, saved.id);
  }

  for (const item of updated.rewards) {
    const payload = rewardPayload(item);
    const before = oldRewards.get(item.id);
    if (!before) await createReward(slug, payload);
    else if (changed(rewardPayload(before), payload))
      await updateReward(slug, item.id, payload);
  }

  const appointmentPayload = (
    item: Appointment,
  ): CreateAppointmentPayload => ({
    customerId: customerIds.get(item.customerId) ?? item.customerId,
    serviceId: serviceIds.get(item.serviceId) ?? item.serviceId,
    staffId: staffIds.get(item.staffId) ?? item.staffId,
    date: item.date,
    time: item.time,
    status: status(item.status),
    notes: item.notes || undefined,
  });
  for (const item of updated.appointments) {
    const payload = appointmentPayload(item);
    const before = oldAppointments.get(item.id);
    if (!before) await createAppointment(slug, payload);
    else if (changed(appointmentPayload(before), payload))
      await updateAppointment(slug, item.id, payload);
  }

  const { plan: _plan, ...settings } = updated.settings;
  const { plan: _currentPlan, ...currentSettings } = current.settings;
  if (changed(currentSettings, settings)) {
    await api.put(`/tenants/${slug}/settings`, settings);
  }

  return getWorkspace(slug);
}
