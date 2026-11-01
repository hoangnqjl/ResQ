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
  pickup_window?: string | null;
  image_url?: string | null;
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
  pushNotifications?: boolean;
  emailAlerts?: boolean;
  soundAlerts?: boolean;
};

export type ShopReview = {
  id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author_name: string;
};

export type EligibleReviewOrder = { id: string; created_at: string; total_amount: number | string };
export type SearchAlertOptions = {
  target: "food" | "shop";
  shopIds: string[];
  discountsOnly: boolean;
  freeOnly: boolean;
  timeWindow: string;
};
export type SearchDropAlert = {
  id: string;
  keyword: string;
  radius_km: number | string;
  enabled: number | boolean;
  created_at: string;
  quiet_hours?: SearchAlertOptions | string;
};
export type SavedShop = Pick<CommunityShop, "id" | "name" | "address" | "verified" | "reputation_score"> & { image_url?: string | null };

export async function getCommunityFoods(
  search?: string,
  options: {
    includeSearchDesignSamples?: boolean;
    includeSharingDesignSamples?: boolean;
    includeDropAlertDesignSamples?: boolean;
  } = {},
) {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (options.includeSearchDesignSamples) params.set("includeSearchDesignSamples", "true");
  if (options.includeSharingDesignSamples) params.set("includeSharingDesignSamples", "true");
  if (options.includeDropAlertDesignSamples) params.set("includeDropAlertDesignSamples", "true");
  const encodedParams = params.toString();
  const query = encodedParams ? `?${encodedParams}` : "";
  const result = await requestJson<{ items: CommunityFood[] }>(`/api/foods${query}`);
  return result.items;
}

export async function getCommunityShop(shopId: string) {
  return requestJson<CommunityShop>(`/api/shops/${encodeURIComponent(shopId)}`);
}

export async function getShopReviews(shopId: string, userId: string) {
  return requestJson<{ items: ShopReview[]; eligibleOrder: EligibleReviewOrder | null }>(
    `/api/shops/${encodeURIComponent(shopId)}/reviews?userId=${encodeURIComponent(userId)}`,
  );
}

export async function submitShopReview(
  shopId: string,
  values: { authorId: string; orderId: string; rating: number; comment: string },
) {
  return requestJson<ShopReview>(`/api/shops/${encodeURIComponent(shopId)}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export async function saveSearchDropAlert(userId: string, keyword: string, radiusKm: number, options?: SearchAlertOptions) {
  return requestJson<{ saved: boolean; keyword: string; radiusKm: number }>("/api/drop-alerts/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, keyword, radiusKm, options }),
  });
}

export async function getFavoriteFoodIds(userId: string) {
  const result = await requestJson<{ items: string[] }>(`/api/favorites?userId=${encodeURIComponent(userId)}`);
  return result.items;
}

export async function toggleFavoriteFood(userId: string, foodId: string) {
  return requestJson<{ saved: boolean }>("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, foodId }),
  });
}

export async function getSavedShops(userId: string, options: { includeDesignSamples?: boolean } = {}) {
  const params = new URLSearchParams({ userId });
  if (options.includeDesignSamples) params.set("includeDesignSamples", "true");
  return requestJson<{ items: SavedShop[] }>(`/api/favorite-shops?${params.toString()}`);
}

export async function toggleSavedShop(userId: string, shopId: string) {
  return requestJson<{ saved: boolean }>("/api/favorite-shops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, shopId }),
  });
}

export async function getSearchDropAlerts(userId: string) {
  return requestJson<{ items: SearchDropAlert[] }>(
    `/api/drop-alerts/search?userId=${encodeURIComponent(userId)}`,
  );
}

export async function updateSearchDropAlert(userId: string, alertId: string, enabled: boolean) {
  return requestJson<{ enabled: boolean }>(`/api/drop-alerts/search/${encodeURIComponent(alertId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, enabled }),
  });
}

export async function saveNotificationRadius(userId: string, radiusKm: number) {
  const current = await requestJson<{ quiet_start: string; quiet_end: string }>(
    `/api/users/${encodeURIComponent(userId)}/preferences`,
  );
  return requestJson<{ notification_radius_km: number }>(
    `/api/users/${encodeURIComponent(userId)}/preferences`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notification_radius_km: radiusKm,
        quiet_start: current.quiet_start.slice(0, 5),
        quiet_end: current.quiet_end.slice(0, 5),
      }),
    },
  );
}

export async function reserveCommunityFood(foodItemId: string, buyerId: string) {
  return requestJson<{ reservation: { id: string }; holdMinutes: number }>("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foodItemId, buyerId, quantity: 1 }),
  });
}

export function imageUrl(value?: string | null): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Catch unreplaced template tags like {{image.jpg}}
  if (/^\{\{.*\}\}$/.test(trimmed)) return undefined;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        const apiParsed = new URL(API_URL);
        parsed.protocol = apiParsed.protocol;
        parsed.hostname = apiParsed.hostname;
        parsed.port = apiParsed.port;
      }
      return encodeURI(decodeURI(parsed.toString()));
    }

    const cleanPath = trimmed.replace(/^\/+/, "");
    const base = API_URL.replace(/\/+$/, "");
    const full = `${base}/${cleanPath}`;
    const parsed = new URL(full);
    return encodeURI(decodeURI(parsed.toString()));
  } catch {
    return undefined;
  }
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
