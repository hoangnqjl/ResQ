import { API_URL, requestJson } from "../api";

export type CommunityFood = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  original_price: number | string;
  current_price: number | string;
  quantity_available: number;
  allergens?: string[] | string;
  storage_instructions?: string | null;
  expires_at?: string | null;
  pickup_starts_at?: string | null;
  pickup_ends_at?: string | null;
  shop_id: string;
  shop_name: string;
  address: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  verified?: number | boolean;
  reputation_score?: number | string;
};

export type CommunityShop = {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  address: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  safety_certificate_url?: string | null;
  verified: number | boolean;
  reputation_score: number | string;
  average_rating: number | string;
  review_count: number;
};

export type DropAlert = {
  id: string;
  user_id: string;
  shop_id: string | null;
  enabled: number | boolean;
  name?: string;
  address?: string;
};

export type GlobalDropAlertSettings = {
  instantPush: boolean;
  vibrateEmergencyDrops: boolean;
};

export async function getCommunityFoods(search?: string) {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const result = await requestJson<{ items: CommunityFood[] }>(`/api/foods${query}`);
  return result.items;
}

export async function getCommunityShop(shopId: string) {
  return requestJson<CommunityShop>(`/api/shops/${encodeURIComponent(shopId)}`);
}

export async function reserveCommunityFood(foodItemId: string, buyerId: string) {
  return requestJson<{ reservation: { id: string }; holdMinutes: number }>("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foodItemId, buyerId, quantity: 1 }),
  });
}

export function imageUrl(value?: string | null) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/^http:\/\/(?:localhost|127\.0\.0\.1)(?=[:/])/i, API_URL);
  }
  return `${API_URL}/${value.replace(/^\/+/, "")}`;
}

export async function getShopDropAlert(userId: string, shopId: string) {
  const result = await requestJson<{ items: DropAlert[] }>(
    `/api/drop-alerts?userId=${encodeURIComponent(userId)}&shopId=${encodeURIComponent(shopId)}`,
  );
  return result.items[0] ?? null;
}

export async function saveShopDropAlert(userId: string, shopId: string, enabled: boolean) {
  return requestJson<{ enabled: boolean }>("/api/drop-alerts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, shopId, enabled }),
  });
}

export async function getShopDropAlerts(userId: string) {
  const result = await requestJson<{ items: DropAlert[] }>(
    `/api/drop-alerts?userId=${encodeURIComponent(userId)}`,
  );
  return result.items;
}

export async function getGlobalDropAlertSettings(userId: string) {
  return requestJson<GlobalDropAlertSettings>(
    `/api/drop-alerts/global?userId=${encodeURIComponent(userId)}`,
  );
}

export async function saveGlobalDropAlertSettings(
  userId: string,
  settings: GlobalDropAlertSettings,
) {
  return requestJson<GlobalDropAlertSettings>("/api/drop-alerts/global", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...settings }),
  });
}
