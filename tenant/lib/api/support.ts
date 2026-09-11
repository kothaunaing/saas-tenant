import { api } from "./client";
export type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  message: string;
  createdAt: string;
};
export const getSupportTickets = async (slug: string) =>
  (await api.get<SupportTicket[]>(`/tenants/${slug}/support-tickets`)).data;
export const createSupportTicket = async (
  slug: string,
  data: {
    subject: string;
    category: string;
    priority?: string;
    message: string;
  },
) =>
  (await api.post<SupportTicket>(`/tenants/${slug}/support-tickets`, data))
    .data;
