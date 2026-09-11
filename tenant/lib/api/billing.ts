import { api } from "./client";
export type BillingOverview = {
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
  } | null;
  availablePlans: AvailablePlan[];
  paymentMethods: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  }[];
  invoices: {
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
    plan: { name: string } | null;
  }[];
};
export type AvailablePlan = {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  active: boolean;
  staffLimit: number | null;
};
export const getBilling = async (slug: string) =>
  (await api.get<BillingOverview>(`/tenants/${slug}/billing`)).data;
export const changePlan = async (slug: string, planId: string) =>
  (await api.put<BillingOverview>(`/tenants/${slug}/billing/plan`, { planId }))
    .data;
export const updatePaymentMethod = async (
  slug: string,
  data: { brand: string; last4: string; expMonth: number; expYear: number },
) => (await api.put(`/tenants/${slug}/billing/payment-method`, data)).data;
