// ==============================================================================
// MODULE 6: ĐĂNG MÓN, DYNAMIC PRICING & TẶNG KHẨN CẤP (US-F1 -> US-F4)
// ==============================================================================

export interface SurplusPostItem {
  id: string;
  name: string;
  originalPrice: number;
  currentPrice: number;
  quantity: number;
  category: "bakery" | "meal" | "produce" | "beverage" | "other";
  expiryHours: number;
  status: "draft" | "active" | "locked" | "donated_emergency";
  dynamicPricingEnabled: boolean;
  pricingTiers?: Array<{
    timeWindow: string; // e.g. "18:00 - 19:30"
    discountPercent: number; // e.g. 40
    calculatedPrice: number; // e.g. 39000
  }>;
  autoLockMinutesBeforeClose: number; // e.g. 30
  imageKey?: string;
  note?: string;
}

export interface DynamicPricingConfig {
  shopId: string;
  enabled: boolean;
  closingTime: string; // e.g. "21:30"
  lockCutoffMinutes: number; // 15 or 30 mins
  tiers: Array<{
    stage: string; // e.g. "Đầu ca (17:30 - 19:00)"
    discountPercent: number; // 30%
    description: string;
  }>;
}

export interface EmergencyDonationItem {
  id: string;
  orderId: string;
  originalBuyer: string;
  cancellationTime: string;
  foodName: string;
  portions: number;
  radiusLimitKm: number;
  claimedBy?: string;
  status: "available_0d" | "claimed";
}

export const MOCK_SURPLUS_POSTS: SurplusPostItem[] = [
  {
    id: "post-01",
    name: "Bánh Croissant Bơ Pháp (Tồn cuối ngày)",
    originalPrice: 85000,
    currentPrice: 42000,
    quantity: 6,
    category: "bakery",
    expiryHours: 6,
    status: "active",
    dynamicPricingEnabled: true,
    autoLockMinutesBeforeClose: 30,
    pricingTiers: [
      { timeWindow: "18:00 - 19:30", discountPercent: 40, calculatedPrice: 51000 },
      { timeWindow: "19:30 - 20:30", discountPercent: 50, calculatedPrice: 42500 },
      { timeWindow: "20:30 - 21:00", discountPercent: 70, calculatedPrice: 25500 },
    ],
    note: "Bánh mới ra lò lúc 10h sáng, còn nguyên độ xốp giòn.",
  },
  {
    id: "post-02",
    name: "Cơm Gà Nướng Ngũ Vị",
    originalPrice: 65000,
    currentPrice: 35000,
    quantity: 4,
    category: "meal",
    expiryHours: 4,
    status: "active",
    dynamicPricingEnabled: true,
    autoLockMinutesBeforeClose: 20,
    pricingTiers: [
      { timeWindow: "19:00 - 20:00", discountPercent: 45, calculatedPrice: 35750 },
      { timeWindow: "20:00 - 20:45", discountPercent: 60, calculatedPrice: 26000 },
    ],
    note: "Hộp giấy kraft tự hủy, kèm canh rong biển.",
  },
  {
    id: "post-03",
    name: "Salad Cầu Vồng Tươi Sốt Chanh Dây",
    originalPrice: 55000,
    currentPrice: 25000,
    quantity: 3,
    category: "produce",
    expiryHours: 3,
    status: "locked",
    dynamicPricingEnabled: false,
    autoLockMinutesBeforeClose: 30,
    note: "Rau củ hữu cơ Đà Lạt giao trong ngày.",
  },
];

export const MOCK_DYNAMIC_CONFIG: DynamicPricingConfig = {
  shopId: "33333333-3333-4333-8333-333333333336",
  enabled: true,
  closingTime: "21:30",
  lockCutoffMinutes: 30,
  tiers: [
    { stage: "Bậc 1: Trước đóng cửa 3h", discountPercent: 35, description: "Bắt đầu xả hàng ca chiều" },
    { stage: "Bậc 2: Trước đóng cửa 1.5h", discountPercent: 50, description: "Giảm sâu hỗ trợ sinh viên" },
    { stage: "Bậc 3: Trước đóng cửa 30p", discountPercent: 70, description: "Giải cứu tối đa, chống lãng phí" },
  ],
};

export const MOCK_EMERGENCY_DONATIONS: EmergencyDonationItem[] = [
  {
    id: "don-01",
    orderId: "ORD-99182",
    originalBuyer: "Khách bùng hẹn (User #812)",
    cancellationTime: "10 phút trước",
    foodName: "2x Cơm Gà Nướng Ngũ Vị (Hủy giờ chót)",
    portions: 2,
    radiusLimitKm: 0.5,
    status: "available_0d",
  },
  {
    id: "don-02",
    orderId: "ORD-99175",
    originalBuyer: "Hủy do quá giờ pickup",
    cancellationTime: "35 phút trước",
    foodName: "1x Hộp Bánh Croissant Hạnh Nhân",
    portions: 1,
    radiusLimitKm: 0.5,
    claimedBy: "Bạn Nguyễn Thị H. (Cách 220m)",
    status: "claimed",
  },
];

// ==============================================================================
// MODULE 7: VẬN HÀNH CỬA HÀNG, QUÉT ĐƠN & BÁO CÁO (US-G1 -> US-G2)
// ==============================================================================

export interface StoreTransaction {
  id: string;
  orderCode: string;
  qrToken: string;
  buyerName: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  depositUsed: number;
  paymentMethod: "momo" | "vnpay" | "cash_counter" | "free_donation";
  timestamp: string;
  scannedByStaff: string;
  status: "completed" | "refunded" | "cancelled";
}

export interface ShiftReport {
  shiftId: string;
  shiftName: string; // e.g. "Ca Chiều - Tối (16:00 - 21:30)"
  date: string;
  staffInCharge: string;
  totalMealsRescued: number;
  co2SavedKg: number;
  recoveredRevenue: number;
  totalDonations0d: number;
  successHandoverRate: number; // e.g. 98.5%
  topRescuedItems: Array<{ name: string; count: number }>;
}

export const MOCK_STORE_TRANSACTIONS: StoreTransaction[] = [
  {
    id: "tx-701",
    orderCode: "RESQ-28491",
    qrToken: "RESQ_QR_PASS_881294",
    buyerName: "Nguyen Capybaras",
    itemName: "Grilled Chicken Rice",
    quantity: 1,
    totalAmount: 35000,
    depositUsed: 10000,
    paymentMethod: "momo",
    timestamp: "18:42 Hôm nay",
    scannedByStaff: "Bảo Ngọc (Thu ngân quầy A)",
    status: "completed",
  },
  {
    id: "tx-702",
    orderCode: "RESQ-28485",
    qrToken: "RESQ_QR_PASS_881289",
    buyerName: "Trần Bảo Long (Incognito)",
    itemName: "Fresh Salmon Poke Bowl",
    quantity: 1,
    totalAmount: 49000,
    depositUsed: 10000,
    paymentMethod: "vnpay",
    timestamp: "18:15 Hôm nay",
    scannedByStaff: "Bảo Ngọc (Thu ngân quầy A)",
    status: "completed",
  },
  {
    id: "tx-703",
    orderCode: "RESQ-28472",
    qrToken: "RESQ_QR_PASS_881270",
    buyerName: "Lê Hoàng Nam",
    itemName: "0đ Vegetarian Rice Box (Góc 0đ)",
    quantity: 1,
    totalAmount: 0,
    depositUsed: 0,
    paymentMethod: "free_donation",
    timestamp: "17:50 Hôm nay",
    scannedByStaff: "Tuấn Anh (Quản lý ca)",
    status: "completed",
  },
  {
    id: "tx-704",
    orderCode: "RESQ-28450",
    qrToken: "RESQ_QR_PASS_881255",
    buyerName: "Khách vãng lai #41",
    itemName: "Bánh Mì Sourdough Nướng",
    quantity: 2,
    totalAmount: 44000,
    depositUsed: 10000,
    paymentMethod: "cash_counter",
    timestamp: "17:10 Hôm nay",
    scannedByStaff: "Tuấn Anh (Quản lý ca)",
    status: "completed",
  },
];

export const MOCK_SHIFT_REPORT: ShiftReport = {
  shiftId: "shift-20261102-pm",
  shiftName: "Ca Tối Giải Cứu (17:00 - 21:30)",
  date: "02/11/2026",
  staffInCharge: "Nguyễn Tuấn Anh (Trưởng ca)",
  totalMealsRescued: 38,
  co2SavedKg: 95.2, // ~2.5kg CO2e per kg food rescued
  recoveredRevenue: 1345000,
  totalDonations0d: 6,
  successHandoverRate: 97.4,
  topRescuedItems: [
    { name: "Bánh Mì & Croissant", count: 18 },
    { name: "Cơm Gà & Bento", count: 12 },
    { name: "Salad & Sinh Tố", count: 8 },
  ],
};

// ==============================================================================
// MODULE 8: UY TÍN, ĐÁNH GIÁ & KHIẾU NẠI (US-H1 -> US-H4)
// ==============================================================================

export interface TrustReputationScore {
  score: number; // 4.9 / 5.0
  totalRatingsCount: number;
  trustBadgeTier: "Gold Standard" | "Green Hero" | "Certified Merchant";
  punctualityRate: number; // 99%
  foodHygieneScore: number; // 98%
  badgeDescription: string;
  pointsHistory: Array<{
    date: string;
    action: string;
    pointsDelta: number; // +5, -10
    reason: string;
  }>;
}

export interface ComplaintTicket {
  id: string;
  orderCode: string;
  restaurantName: string;
  itemReported: string;
  issueType: "spoiled_smell" | "foreign_object" | "wrong_packaging" | "no_show_seller";
  title: string;
  description: string;
  evidenceImages: string[];
  refundStatus: "under_review" | "approved_refunded" | "rejected";
  depositRefundedAmount: number;
  submittedAt: string;
  resolvedAt?: string;
  adminResolutionNote?: string;
}

export const MOCK_TRUST_REPUTATION: TrustReputationScore = {
  score: 4.9,
  totalRatingsCount: 342,
  trustBadgeTier: "Gold Standard",
  punctualityRate: 99.2,
  foodHygieneScore: 98.7,
  badgeDescription: "Cửa hàng Vàng: Luôn bàn giao đúng cam kết nhiệt độ, tem mác rõ ràng và tỷ lệ khiếu nại < 0.3%.",
  pointsHistory: [
    { date: "02/11/2026", action: "Hoàn tất 38 đơn giải cứu ca tối", pointsDelta: +19, reason: "Bàn giao đồ ăn chuẩn giờ" },
    { date: "01/11/2026", action: "Được khách hàng khen ngợi 5 sao", pointsDelta: +5, reason: "Phục vụ ân cần, đóng gói kín" },
    { date: "29/10/2026", action: "Đóng cửa đúng giờ quy định", pointsDelta: +2, reason: "Khóa nhận hàng chuẩn ca" },
    { date: "25/10/2026", action: "Khiếu nại đổi trả giải quyết êm đẹp", pointsDelta: +3, reason: "Hoàn cọc nhanh chóng cho khách" },
  ],
};

export const MOCK_COMPLAINTS: ComplaintTicket[] = [
  {
    id: "CP-9901",
    orderCode: "RESQ-28104",
    restaurantName: "The Corner Kitchen",
    itemReported: "Salad Sốt Chanh Dây",
    issueType: "spoiled_smell",
    title: "Sốt salad có mùi chua gắt bất thường",
    description: "Tôi nhận món lúc 18h30 nhưng khi về mở hộp ra ăn thì sốt chanh dây có vị chua bất thường và nổi bọt khí. Tôi đã chụp ảnh tem mác và tình trạng hộp gửi kèm.",
    evidenceImages: ["photo_salad_issue.jpg", "receipt_corner.jpg"],
    refundStatus: "approved_refunded",
    depositRefundedAmount: 10000,
    submittedAt: "Hôm qua lúc 19:10",
    resolvedAt: "Hôm qua lúc 19:35",
    adminResolutionNote: "ResQ đã xác minh và hoàn trả 10.000đ cọc về ví MoMo của bạn trong 25 phút. Quán đã ghi nhận và kiểm tra lại lô sốt.",
  },
  {
    id: "CP-9902",
    orderCode: "RESQ-28312",
    restaurantName: "Binh Thanh Noodle House",
    itemReported: "Bún Bò Huế Cay",
    issueType: "wrong_packaging",
    title: "Quên đóng nắp chặt làm đổ nước dùng",
    description: "Nhân viên vội vàng lúc giao hàng nên nắp tô bị lỏng, khi mang về túi giấy bị rách và nước dùng chảy ra ngoài một nửa.",
    evidenceImages: ["spill_proof.jpg"],
    refundStatus: "under_review",
    depositRefundedAmount: 10000,
    submittedAt: "17:40 Hôm nay",
    adminResolutionNote: "Đang chờ nhân viên ca trực phản hồi camera quầy giao đồ.",
  },
];

