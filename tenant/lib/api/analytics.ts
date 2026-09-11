import { api } from "./client";
export type TenantAnalytics = {
  date: string;
  days: number;
  revenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  averageTicket: number;
  staffUtilization: number;
  popularServices: {
    serviceId: string;
    name: string;
    bookings: number;
    revenue: number;
  }[];
  staff: { staffId: string; name: string; utilization: number }[];
  dailyRevenue: { date: string; revenue: number }[];
};
export const getTenantAnalytics = async (slug: string, days: number) =>
  (
    await api.get<TenantAnalytics>(`/tenants/${slug}/analytics`, {
      params: { days },
    })
  ).data;
