import { API_URL, requestJson } from "../api";
import {
  MOCK_FOODS,
  MOCK_SHOPS,
  MOCK_DROP_ALERTS,
  MOCK_SEARCH_ALERTS,
  MOCK_REVIEWS,
} from "../data/offlineMockData";

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
): Promise<CommunityFood[]> {
  try {
    const params = new URLSearchParams();
    if (search?.trim()) params.set("search", search.trim());
    if (options.includeSearchDesignSamples) params.set("includeSearchDesignSamples", "true");
    if (options.includeSharingDesignSamples) params.set("includeSharingDesignSamples", "true");
    if (options.includeDropAlertDesignSamples) params.set("includeDropAlertDesignSamples", "true");
    const encodedParams = params.toString();
    const query = encodedParams ? `?${encodedParams}` : "";
    const result = await requestJson<{ items: CommunityFood[] }>(`/api/foods${query}`);
    if (result.items && result.items.length > 0) {
      return result.items;
    }
    return MOCK_FOODS;
  } catch {
    // Offline fallback: filter MOCK_FOODS by search if present
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      return MOCK_FOODS.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q)) ||
          f.shop_name.toLowerCase().includes(q)
      );
    }
    return MOCK_FOODS;
  }
}

export async function getCommunityShop(shopId: string): Promise<CommunityShop> {
  try {
    return await requestJson<CommunityShop>(`/api/shops/${encodeURIComponent(shopId)}`);
  } catch {
    const found = MOCK_SHOPS.find((s) => s.id === shopId);
    return found || MOCK_SHOPS[0];
  }
}

export async function getShopReviews(shopId: string, userId: string) {
  try {
    return await requestJson<{ items: ShopReview[]; eligibleOrder: EligibleReviewOrder | null }>(
      `/api/shops/${encodeURIComponent(shopId)}/reviews?userId=${encodeURIComponent(userId)}`,
    );
  } catch {
    return {
      items: MOCK_REVIEWS,
      eligibleOrder: { id: "order-mock-888", created_at: new Date().toISOString(), total_amount: 35000 },
    };
  }
}

export async function submitShopReview(
  shopId: string,
  values: { authorId: string; orderId: string; rating: number; comment: string },
) {
  try {
    return await requestJson<ShopReview>(`/api/shops/${encodeURIComponent(shopId)}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
  } catch {
    return {
      id: `rev-${Date.now()}`,
      order_id: values.orderId,
      rating: values.rating,
      comment: values.comment,
      created_at: new Date().toISOString(),
      author_name: "You",
    };
  }
}

export async function saveSearchDropAlert(userId: string, keyword: string, radiusKm: number, options?: SearchAlertOptions) {
  try {
    return await requestJson<{ saved: boolean; keyword: string; radiusKm: number }>("/api/drop-alerts/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, keyword, radiusKm, options }),
    });
  } catch {
    return { saved: true, keyword, radiusKm };
  }
}

let localFavoriteFoodIds: string[] = ["44444444-4444-4444-8444-444444444441", "44444444-4444-4444-8444-444444444444"];

export async function getFavoriteFoodIds(userId: string) {
  try {
    const result = await requestJson<{ items: string[] }>(`/api/favorites?userId=${encodeURIComponent(userId)}`);
    return result.items || localFavoriteFoodIds;
  } catch {
    return localFavoriteFoodIds;
  }
}

export async function toggleFavoriteFood(userId: string, foodId: string) {
  try {
    return await requestJson<{ saved: boolean }>("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, foodId }),
    });
  } catch {
    const exists = localFavoriteFoodIds.includes(foodId);
    if (exists) {
      localFavoriteFoodIds = localFavoriteFoodIds.filter((id) => id !== foodId);
    } else {
      localFavoriteFoodIds.push(foodId);
    }
    return { saved: !exists };
  }
}

let localSavedShopIds: string[] = ["33333333-3333-4333-8333-333333333336", "33333333-3333-4333-8333-333333333338"];

export async function getSavedShops(userId: string, options: { includeDesignSamples?: boolean } = {}): Promise<SavedShop[]> {
  try {
    const params = new URLSearchParams({ userId });
    if (options.includeDesignSamples) params.set("includeDesignSamples", "true");
    const res = await requestJson<{ items: SavedShop[] }>(`/api/favorite-shops?${params.toString()}`);
    if (res.items && res.items.length > 0) return res.items;
    return MOCK_SHOPS.filter((s) => localSavedShopIds.includes(s.id));
  } catch {
    return MOCK_SHOPS.filter((s) => localSavedShopIds.includes(s.id));
  }
}

export async function toggleSavedShop(userId: string, shopId: string) {
  try {
    return await requestJson<{ saved: boolean }>("/api/favorite-shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, shopId }),
    });
  } catch {
    const exists = localSavedShopIds.includes(shopId);
    if (exists) {
      localSavedShopIds = localSavedShopIds.filter((id) => id !== shopId);
    } else {
      localSavedShopIds.push(shopId);
    }
    return { saved: !exists };
  }
}

export async function getSearchDropAlerts(userId: string): Promise<SearchDropAlert[]> {
  try {
    const res = await requestJson<{ items: SearchDropAlert[] }>(
      `/api/drop-alerts/search?userId=${encodeURIComponent(userId)}`,
    );
    if (res.items && res.items.length > 0) return res.items;
    return MOCK_SEARCH_ALERTS;
  } catch {
    return MOCK_SEARCH_ALERTS;
  }
}

export async function updateSearchDropAlert(userId: string, alertId: string, enabled: boolean) {
  try {
    return await requestJson<{ enabled: boolean }>(`/api/drop-alerts/search/${encodeURIComponent(alertId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, enabled }),
    });
  } catch {
    return { enabled };
  }
}

export async function saveNotificationRadius(userId: string, radiusKm: number) {
  try {
    const current = await requestJson<{ quiet_start: string; quiet_end: string }>(
      `/api/users/${encodeURIComponent(userId)}/preferences`,
    );
    return await requestJson<{ notification_radius_km: number }>(
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
  } catch {
    return { notification_radius_km: radiusKm };
  }
}

export async function reserveCommunityFood(foodItemId: string, buyerId: string) {
  try {
    return await requestJson<{ reservation: { id: string }; holdMinutes: number }>("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodItemId, buyerId, quantity: 1 }),
    });
  } catch {
    return { reservation: { id: `mock-res-${Date.now()}` }, holdMinutes: 20 };
  }
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
  try {
    const result = await requestJson<{ items: DropAlert[] }>(
      `/api/drop-alerts?userId=${encodeURIComponent(userId)}&shopId=${encodeURIComponent(shopId)}`,
    );
    return result.items[0] ?? null;
  } catch {
    return MOCK_DROP_ALERTS.find((a) => a.shop_id === shopId) ?? null;
  }
}

export async function saveShopDropAlert(userId: string, shopId: string, enabled: boolean) {
  try {
    return await requestJson<{ enabled: boolean }>("/api/drop-alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, shopId, enabled }),
    });
  } catch {
    return { enabled };
  }
}

export async function getShopDropAlerts(userId: string) {
  try {
    const result = await requestJson<{ items: DropAlert[] }>(
      `/api/drop-alerts?userId=${encodeURIComponent(userId)}`,
    );
    if (result.items && result.items.length > 0) return result.items;
    return MOCK_DROP_ALERTS;
  } catch {
    return MOCK_DROP_ALERTS;
  }
}

export async function getGlobalDropAlertSettings(userId: string) {
  try {
    return await requestJson<GlobalDropAlertSettings>(
      `/api/drop-alerts/global?userId=${encodeURIComponent(userId)}`,
    );
  } catch {
    return {
      instantPush: true,
      vibrateEmergencyDrops: true,
      pushNotifications: true,
      emailAlerts: false,
      soundAlerts: true,
    };
  }
}

export async function saveGlobalDropAlertSettings(
  userId: string,
  settings: GlobalDropAlertSettings,
) {
  try {
    return await requestJson<GlobalDropAlertSettings>("/api/drop-alerts/global", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...settings }),
    });
  } catch {
    return settings;
  }
}
