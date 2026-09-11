import { api } from "./client";
export type Notification = {
  id: string;
  kind: string;
  channel: string;
  recipient: string;
  status: string;
  scheduledFor: string;
  sentAt: string | null;
  failureReason: string | null;
};
export const getNotifications = async (slug: string) =>
  (await api.get<Notification[]>(`/tenants/${slug}/notifications`)).data;
export const dispatchNotifications = async (slug: string) =>
  (await api.post(`/tenants/${slug}/notifications/dispatch`)).data;
