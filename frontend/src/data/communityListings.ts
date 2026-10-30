import type { CommunityFood } from "../services/communityApi";

export type CommunityListing = CommunityFood & {
  badge: string;
  priceLabel: string;
  kind: "free" | "budget";
};

const money = (value: string | number) =>
  `${Number(value).toLocaleString("vi-VN")}₫`;

export function toCommunityListing(food: CommunityFood): CommunityListing {
  const currentPrice = Number(food.current_price);
  const originalPrice = Number(food.original_price);
  const isFree = currentPrice === 0;
  const discount = originalPrice > 0
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;
  return {
    ...food,
    badge: isFree ? "0đ" : `${discount}% OFF`,
    priceLabel: isFree ? "Miễn phí" : money(currentPrice),
    kind: isFree ? "free" : "budget",
  };
}

export function isAvailableNow(food: CommunityFood, now = Date.now()) {
  const startsAt = food.pickup_starts_at ? new Date(food.pickup_starts_at).getTime() : 0;
  const endsAt = food.pickup_ends_at ? new Date(food.pickup_ends_at).getTime() : Number.POSITIVE_INFINITY;
  return food.quantity_available > 0 && startsAt <= now && endsAt > now;
}

export function hasDiscount(food: CommunityFood) {
  return Number(food.current_price) > 0
    && Number(food.original_price) > Number(food.current_price);
}
