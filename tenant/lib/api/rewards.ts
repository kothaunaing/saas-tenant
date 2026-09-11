import { api, type PaginatedResult, type PaginationParams } from './client';

export type Reward = {
  id: string;
  name: string;
  points: number;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export interface QueryRewardsParams extends PaginationParams {
  search?: string;
}

export interface CreateRewardPayload {
  name: string;
  points: number;
  description?: string;
  active?: boolean;
}

export type UpdateRewardPayload = Partial<CreateRewardPayload>;

export const rewardsKey = (slug: string, params?: QueryRewardsParams) =>
  ['tenant', slug, 'rewards', params] as const;

export async function getRewards(
  slug: string,
  params?: QueryRewardsParams,
): Promise<PaginatedResult<Reward>> {
  const res = await api.get<PaginatedResult<Reward>>(
    `/tenants/${slug}/rewards`,
    { params },
  );
  return res.data;
}

export async function getReward(
  slug: string,
  id: string,
): Promise<Reward> {
  const res = await api.get<Reward>(`/tenants/${slug}/rewards/${id}`);
  return res.data;
}

export async function createReward(
  slug: string,
  payload: CreateRewardPayload,
): Promise<Reward> {
  const res = await api.post<Reward>(`/tenants/${slug}/rewards`, payload);
  return res.data;
}

export async function updateReward(
  slug: string,
  id: string,
  payload: UpdateRewardPayload,
): Promise<Reward> {
  const res = await api.patch<Reward>(
    `/tenants/${slug}/rewards/${id}`,
    payload,
  );
  return res.data;
}

export async function deleteReward(
  slug: string,
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = await api.delete<{ success: boolean; id: string }>(
    `/tenants/${slug}/rewards/${id}`,
  );
  return res.data;
}
