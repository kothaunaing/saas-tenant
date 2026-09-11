import { api } from "./client";
import type { Customer } from "./customers";
import type { Service } from "./services";
import type { Staff } from "./staff";
import type { Appointment } from "./appointments";
import type { Reward } from "./rewards";

export type WorkspaceSettings = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  currency: string;
  timezone: string;
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

export async function getWorkspace(slug: string): Promise<WorkspaceData> {
  const res = await api.get<WorkspaceData>(`/tenants/${slug}/workspace`);
  return res.data;
}

export async function saveWorkspace(
  slug: string,
  data: WorkspaceData,
): Promise<WorkspaceData> {
  const payload = {
    ...data,
    customers: data.customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      points: customer.points,
      notes: customer.notes,
    })),
  };
  const res = await api.put<WorkspaceData>(
    `/tenants/${slug}/workspace`,
    payload,
  );
  return res.data;
}
