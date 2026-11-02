import { requestJson } from "../api";
import type { CommunityFood } from "./communityApi";
import {
  getMockSafetyDetail,
  getMockReservationResult,
  getMockDepositResult,
  getMockWaitlistStatus,
} from "../data/offlineMockData";

export interface FoodSafetyDetail extends CommunityFood {
  manufacturing_date: string;
  recommended_expiry: string;
  label_image_url?: string | null;
  safety_certificate_url?: string | null;
  storage_type: "refrigerated" | "room_temperature" | "freezer";
  reheating_instructions: string;
  refrigeration_requirement: string;
  origin_info: {
    business_permit: string;
    certificate_no: string;
    issue_date: string;
    inspected_by: string;
    activity_start: string;
    ingredient_source?: string;
  };
  seller_commitments: string[];
}

export interface SpotReservationResult {
  reservationId: string;
  orderId: string;
  pickupCode: string;
  holdMinutes: number;
  holdExpiresAt: string;
  depositAmount: number;
  quantity: number;
  totalAmount: number;
}

export interface DepositPaymentResult {
  success: boolean;
  transactionId: string;
  paidAt: string;
  amount: number;
  paymentMethod: string;
  depositStatus: string;
  heldUntil: string;
}

export interface WaitlistStatus {
  heldCount: number;
  waitlistCount: number;
  waitlist: Array<{
    id: string;
    user_id: string;
    user_name: string;
    queue_position: number;
    quantity: number;
    status: string;
  }>;
}

// Module 3: Food Safety & Details API
export async function getFoodSafetyDetail(foodId: string): Promise<FoodSafetyDetail> {
  try {
    return await requestJson<FoodSafetyDetail>(`/api/foods/${encodeURIComponent(foodId)}`);
  } catch {
    // Fallback Mock Data adhering to Figma M3 specifications
    return getMockSafetyDetail(foodId);
  }
}

// Module 4: Spot Reservation (Hold 15-30 min)
export async function holdSpotReservation(
  foodItemId: string,
  buyerId: string,
  holdMinutes: number = 20,
  quantity: number = 1
): Promise<SpotReservationResult> {
  try {
    return await requestJson<SpotReservationResult>("/api/reservations/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodItemId, buyerId, holdMinutes, quantity })
    });
  } catch {
    return getMockReservationResult(foodItemId, buyerId, holdMinutes, quantity);
  }
}

// Module 4: Pay Deposit ($1 / 10,000 VND)
export async function payReservationDeposit(
  reservationId: string,
  paymentMethod: string = "momo",
  amount: number = 10000
): Promise<DepositPaymentResult> {
  try {
    return await requestJson<DepositPaymentResult>(`/api/reservations/${reservationId}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod, amount })
    });
  } catch {
    return getMockDepositResult(amount, paymentMethod);
  }
}

// Module 4: Select Pickup Time Slot
export async function selectPickupSlot(
  reservationId: string,
  slotStart: string,
  slotEnd: string,
  dateStr?: string
) {
  try {
    return await requestJson<{ success: boolean; slot: string }>(`/api/reservations/${reservationId}/slot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotStart, slotEnd, dateStr })
    });
  } catch {
    return { success: true, slot: `${slotStart} - ${slotEnd}` };
  }
}

// Module 4: Cancel & Release to Waitlist
export async function cancelAndReleaseOrder(reservationId: string) {
  try {
    return await requestJson<{
      success: boolean;
      portionsReleased: number;
      assignedToWaitlist: boolean;
      nextBuyerName?: string | null;
      depositTransferred: boolean;
    }>(`/api/reservations/${reservationId}/cancel-release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return {
      success: true,
      portionsReleased: 1,
      assignedToWaitlist: true,
      nextBuyerName: "Trần Bảo Long (Người chờ số 1)",
      depositTransferred: true
    };
  }
}

// Module 4: Waitlist Status & Join
export async function getFoodWaitlist(foodId: string): Promise<WaitlistStatus> {
  try {
    return await requestJson<WaitlistStatus>(`/api/foods/${encodeURIComponent(foodId)}/waitlist`);
  } catch {
    return getMockWaitlistStatus();
  }
}

export async function joinFoodWaitlist(foodId: string, userId: string, quantity: number = 1) {
  try {
    return await requestJson<{ success: boolean; waitlistId: string; position: number }>(`/api/foods/${encodeURIComponent(foodId)}/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, quantity })
    });
  } catch {
    return { success: true, waitlistId: `mock-wl-${Date.now()}`, position: 3 };
  }
}
