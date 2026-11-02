import type { CommunityFood, CommunityShop, DropAlert, SearchDropAlert, ShopReview } from "../services/communityApi";
import type { FoodSafetyDetail, SpotReservationResult, DepositPaymentResult, WaitlistStatus } from "../services/foodSafetyReservationApi";

// ==============================================================================
// 1. MOCK SHOPS
// ==============================================================================
export const MOCK_SHOPS: CommunityShop[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    owner_id: "22222222-2222-4222-8222-222222222222",
    name: "ResQ Central Kitchen",
    description: "Bếp trung tâm chuẩn VSATTP phục vụ các bữa ăn giàu dinh dưỡng và cứu trợ thực phẩm sạch hàng ngày.",
    address: "Tran Dai Nghia Street, Ngu Hanh Son, Da Nang",
    latitude: 15.9748,
    longitude: 108.250,
    verified: true,
    reputation_score: 4.9,
    average_rating: 4.9,
    review_count: 128,
    pickup_window: "17:00 - 20:30",
    image_url: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333336",
    owner_id: "22222222-2222-4222-8222-222222222222",
    name: "The Corner Kitchen",
    description: "Nhà hàng phong cách Âu & bánh mì sourdough thơm ngon với ưu đãi giải cứu cuối ngày đến 60%.",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
    latitude: 10.7769,
    longitude: 106.7009,
    verified: true,
    reputation_score: 4.9,
    average_rating: 4.85,
    review_count: 94,
    pickup_window: "18:00 - 21:00",
    image_url: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333334",
    owner_id: "22222222-2222-4222-8222-222222222222",
    name: "Green Bowl Healthy Deli",
    description: "Chuyên các bát salad hữu cơ VietGAP, ngũ cốc nguyên hạt và món chay bảo vệ sức khỏe.",
    address: "45 Le Van Hien, Ngu Hanh Son, Da Nang",
    latitude: 15.9688,
    longitude: 108.258,
    verified: true,
    reputation_score: 4.8,
    average_rating: 4.8,
    review_count: 56,
    pickup_window: "11:30 - 13:30, 17:30 - 19:30",
    image_url: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333338",
    owner_id: "22222222-2222-4222-8222-222222222222",
    name: "Le Croissant Saigon Bakery",
    description: "Bánh mì thủ công, bánh sừng bò bơ Normandy và bánh ngọt tươi mới nướng mỗi ngày.",
    address: "42 Dong Khoi, District 1 · 1.5 km",
    latitude: 10.7769,
    longitude: 106.7009,
    verified: true,
    reputation_score: 4.9,
    average_rating: 4.9,
    review_count: 82,
    pickup_window: "19:00 - 21:30",
    image_url: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333337",
    owner_id: "22222222-2222-4222-8222-222222222222",
    name: "Station 1: 0đ Community Food Cabinet",
    description: "Tủ thực phẩm và bánh mì 0đ sẻ chia yêu thương, phục vụ miễn phí cho cộng đồng và sinh viên khó khăn.",
    address: "12 Tran Dai Nghia, Ngu Hanh Son Ward",
    latitude: 15.9748,
    longitude: 108.250,
    verified: true,
    reputation_score: 5.0,
    average_rating: 5.0,
    review_count: 210,
    pickup_window: "08:00 - 20:00 hàng ngày",
    image_url: null,
  },
];

// ==============================================================================
// 2. MOCK FOODS (Rich offline catalog for HomeScreen, Explore & Detail)
// ==============================================================================
export const MOCK_FOODS: CommunityFood[] = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    name: "Grilled Chicken Rice",
    description: "Cơm gà nướng sốt ngũ vị thơm lừng, cơm nghệ vàng óng kèm dưa góp và sốt tiêu chanh tươi.",
    image_url: null,
    original_price: 65000,
    current_price: 35000,
    quantity_available: 4,
    allergens: ["Soy"],
    storage_instructions: "Dùng ngay hoặc giữ mát 0-4°C nếu chưa ăn liền.",
    expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    pickup_ends_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333333",
    shop_name: "ResQ Central Kitchen",
    address: "Tran Dai Nghia Street, Ngu Hanh Son, Da Nang",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    name: "Fresh Salmon Poke Bowl",
    description: "Cá hồi Na Uy tươi chuẩn sashimi, bơ sáp, đậu edamame, cơm Nhật và sốt mè rang thanh mát.",
    image_url: null,
    original_price: 89000,
    current_price: 49000,
    quantity_available: 3,
    allergens: ["Fish", "Soy", "Sesame"],
    storage_instructions: "Bảo quản lạnh < 4°C. Không cấp đông lại.",
    expires_at: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date(Date.now() - 1800 * 1000).toISOString(),
    pickup_ends_at: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333333",
    shop_name: "ResQ Central Kitchen",
    address: "Tran Dai Nghia Street, Ngu Hanh Son, Da Nang",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444443",
    name: "Traditional Chicken Pho",
    description: "Phở gà ta lá chanh truyền thống, nước dùng hầm xương gà thơm thảo quả, ăn kèm quẩy và tương ớt Bắc.",
    image_url: null,
    original_price: 55000,
    current_price: 29000,
    quantity_available: 5,
    allergens: ["Wheat"],
    storage_instructions: "Để riêng bánh phở và nước dùng. Đun sôi nước dùng trước khi ăn.",
    expires_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333333",
    shop_name: "ResQ Central Kitchen",
    address: "Tran Dai Nghia Street, Ngu Hanh Son, Da Nang",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Berry Souffle Pancakes",
    description: "Bánh kếp phồng mịn kiểu Nhật phủ dâu tây tươi, việt quất và sữa chua Hy Lạp thanh nhẹ.",
    image_url: null,
    original_price: 60000,
    current_price: 32000,
    quantity_available: 3,
    allergens: ["Milk", "Egg", "Wheat"],
    storage_instructions: "Bảo quản nhiệt độ phòng, ăn ngon nhất trong ngày.",
    expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333333",
    shop_name: "The Corner Kitchen",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444445",
    name: "Organic Garden Harvest Bowl",
    description: "Cơm gạo lứt ngũ sắc, đậu hũ áp chảo, khoai lang nướng, rau chân vịt non và sốt mè rang béo bùi.",
    image_url: null,
    original_price: 65000,
    current_price: 35000,
    quantity_available: 6,
    allergens: ["Soy", "Sesame"],
    storage_instructions: "Giữ lạnh 2-5°C nếu dùng sau.",
    expires_at: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333334",
    shop_name: "Green Bowl Healthy Deli",
    address: "45 Le Van Hien, Ngu Hanh Son, Da Nang",
    verified: true,
    reputation_score: 4.8,
  },
  {
    id: "44444444-4444-4444-8444-444444444448",
    name: "Spicy Beef Hue Noodles",
    description: "Bún bò Huế giò heo, chả cua, nước dùng sả ớt cay nồng đậm đà chuẩn vị cố đô.",
    image_url: null,
    original_price: 65000,
    current_price: 38000,
    quantity_available: 4,
    allergens: ["Soy", "Wheat"],
    storage_instructions: "Đun sôi nước dùng trước khi chan bánh phở/bún.",
    expires_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333333",
    shop_name: "Binh Thanh Noodle House",
    address: "120 Xo Viet Nghe Tinh, Binh Thanh · 3.4 km",
    verified: true,
    reputation_score: 4.7,
  },
  {
    id: "44444444-4444-4444-8444-444444444450",
    name: "Sourdough Avocado & Poached Egg",
    description: "Bánh mì sourdough nướng giòn quết bơ trái nghiền dầm tiêu chanh và trứng chần lòng đào béo ngậy.",
    image_url: null,
    original_price: 75000,
    current_price: 42000,
    quantity_available: 3,
    allergens: ["Egg", "Wheat"],
    storage_instructions: "Ăn ngay sau khi nhận để bánh giữ độ giòn.",
    expires_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333336",
    shop_name: "The Corner Kitchen",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444451",
    name: "Truffle Mushroom Fettuccine",
    description: "Mì Ý tươi sợi dẹt sốt kem nấm cục đen truffle thượng hạng, rắc phô mai Grana Padano bào mỏng.",
    image_url: null,
    original_price: 95000,
    current_price: 52000,
    quantity_available: 4,
    allergens: ["Milk", "Egg", "Wheat"],
    storage_instructions: "Giữ mát 0-4°C. Hâm nóng 90s lò vi sóng kèm chút nước.",
    expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333336",
    shop_name: "The Corner Kitchen",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444460",
    name: "Saigon Special Crispy Banh Mi",
    description: "Bánh mì đặc ruột vỏ giòn rụm kẹp pate bơ Pháp béo ngậy, chả lụa, thịt nguội, đồ chua và ngò rí.",
    image_url: null,
    original_price: 40000,
    current_price: 22000,
    quantity_available: 8,
    allergens: ["Wheat", "Soy"],
    storage_instructions: "Bảo quản nơi khô ráo. Nướng lại 2 phút để giòn thơm.",
    expires_at: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333338",
    shop_name: "Le Croissant Saigon Bakery",
    address: "42 Dong Khoi, District 1 · 1.5 km",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444461",
    name: "Artisan Margherita Sourdough Pizza",
    description: "Pizza nướng củi bột chua lên men 48h, sốt cà chua San Marzano, phô mai tươi mozzarella và lá húng quế.",
    image_url: null,
    original_price: 120000,
    current_price: 65000,
    quantity_available: 4,
    allergens: ["Milk", "Wheat"],
    storage_instructions: "Để trong hộp bánh. Nướng lại bằng chảo đậy nắp hoặc nồi chiên không dầu 3 phút.",
    expires_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333336",
    shop_name: "The Corner Kitchen",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
    verified: true,
    reputation_score: 4.8,
  },
  {
    id: "44444444-4444-4444-8444-444444444465",
    name: "Chef's Gourmet Mystery Rescue Bag",
    description: "Túi mù tiết kiệm chứa 3-4 món bánh mặn, bánh ngọt và salad cao cấp của bếp trưởng trị giá trên 180.000₫!",
    image_url: null,
    original_price: 180000,
    current_price: 69000,
    quantity_available: 5,
    allergens: ["Wheat", "Milk", "Egg"],
    storage_instructions: "Xem tem nhãn riêng trên từng món ăn bên trong túi.",
    expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333336",
    shop_name: "The Corner Kitchen",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
    verified: true,
    reputation_score: 4.9,
  },
  {
    id: "44444444-4444-4444-8444-444444444466",
    name: "0đ Warm Vegetarian Rice & Tofu Box",
    description: "Suất cơm chay dinh dưỡng 0đ gồm cơm trắng thơm dẻo, đậu hũ kho sả ớt và rau củ xào tươi ngon.",
    image_url: null,
    original_price: 0,
    current_price: 0,
    quantity_available: 10,
    allergens: ["Soy"],
    storage_instructions: "Ăn ngay khi còn ấm tại trạm hoặc dùng trong vòng 2 giờ.",
    expires_at: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    pickup_starts_at: new Date().toISOString(),
    pickup_ends_at: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    shop_id: "33333333-3333-4333-8333-333333333337",
    shop_name: "Station 1: 0đ Community Food Cabinet",
    address: "12 Tran Dai Nghia, Ngu Hanh Son Ward",
    verified: true,
    reputation_score: 5.0,
  },
];

// ==============================================================================
// 3. MOCK SAFETY DETAILS GENERATOR (Module 3)
// ==============================================================================
export function getMockSafetyDetail(foodId: string): FoodSafetyDetail {
  const food = MOCK_FOODS.find((f) => f.id === foodId) || MOCK_FOODS[0];
  const isCold = food.name.toLowerCase().includes("salmon") || food.name.toLowerCase().includes("poke");

  return {
    ...food,
    manufacturing_date: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    recommended_expiry: food.expires_at || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    storage_type: isCold ? "refrigerated" : "room_temperature",
    reheating_instructions: isCold
      ? "Món lạnh dùng trực tiếp. Không hâm nóng để đảm bảo độ tươi ngon sashimi."
      : "Hâm nóng trong lò vi sóng 2 phút (700W) hoặc hấp cách thủy 5 phút cho đến khi bốc khói nóng đều trước khi thưởng thức.",
    refrigeration_requirement: isCold
      ? "Bảo quản nghiêm ngặt ở ngăn mát 0–4°C. Dùng trong vòng 90 phút sau khi nhận nếu không có túi giữ nhiệt."
      : "Giữ kín ở nhiệt độ phòng sạch thoáng. Sử dụng trong vòng 2 giờ kể từ khi mở nắp hộp.",
    origin_info: {
      business_permit: "DN-2025-8841",
      certificate_no: "FS-2026-0184",
      issue_date: "15/01/2026",
      inspected_by: "Ban Quản lý An toàn thực phẩm & Vệ sinh dịch tễ",
      activity_start: "10/05/2024",
      ingredient_source: "Nguyên liệu tươi kiểm định chất lượng VietGAP mỗi buổi sáng",
    },
    seller_commitments: [
      "100% nguyên liệu tươi sạch sơ chế và chế biến trong ngày",
      "Khu vực bếp đạt tiêu chuẩn vệ sinh an toàn thực phẩm ISO 22000",
      "Đóng gói niêm phong chống mở trộm và giữ nhiệt chuyên dụng",
      "Cam kết đền bù và đổi mới 100% nếu phát hiện vấn đề vệ sinh",
      "Hỗ trợ khiếu nại và hoàn cọc tức thì trong 24 giờ",
    ],
  };
}

// ==============================================================================
// 4. MOCK RESERVATION & DEPOSIT (Module 4)
// ==============================================================================
export function getMockReservationResult(
  foodItemId: string,
  buyerId: string,
  holdMinutes = 20,
  quantity = 1,
): SpotReservationResult {
  const food = MOCK_FOODS.find((f) => f.id === foodItemId) || MOCK_FOODS[0];
  const currentPrice = Number(food.current_price);
  const total = currentPrice * quantity;
  const deposit = currentPrice === 0 ? 0 : 10000;

  return {
    reservationId: `mock-res-${Date.now().toString(36)}`,
    orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    pickupCode: `A${Math.floor(10 + Math.random() * 89)}K-${Math.floor(100 + Math.random() * 899)}`,
    holdMinutes,
    holdExpiresAt: new Date(Date.now() + holdMinutes * 60 * 1000).toISOString(),
    depositAmount: deposit,
    quantity,
    totalAmount: total,
  };
}

export function getMockDepositResult(amount = 10000, paymentMethod = "momo"): DepositPaymentResult {
  return {
    success: true,
    transactionId: `#DC-${Math.floor(100000 + Math.random() * 900000)}`,
    paidAt: new Date().toISOString(),
    amount,
    paymentMethod: paymentMethod.toUpperCase(),
    depositStatus: "PAID_CONFIRMED",
    heldUntil: new Date(Date.now() + 20 * 60 * 1000).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function getMockWaitlistStatus(): WaitlistStatus {
  return {
    heldCount: 3,
    waitlistCount: 2,
    waitlist: [
      {
        id: "mock-wl-1",
        user_id: "user-long",
        user_name: "Trần Bảo Long",
        queue_position: 1,
        quantity: 1,
        status: "waiting",
      },
      {
        id: "mock-wl-2",
        user_id: "user-nam",
        user_name: "Lê Hoàng Nam",
        queue_position: 2,
        quantity: 1,
        status: "waiting",
      },
    ],
  };
}

export const MOCK_DROP_ALERTS: DropAlert[] = [
  {
    id: "alert-1",
    user_id: "user-me",
    shop_id: "33333333-3333-4333-8333-333333333336",
    enabled: true,
    name: "The Corner Kitchen",
    address: "88 Nguyen Hue, District 1 · 1.2 km",
  },
  {
    id: "alert-2",
    user_id: "user-me",
    shop_id: "33333333-3333-4333-8333-333333333338",
    enabled: true,
    name: "Le Croissant Saigon Bakery",
    address: "42 Dong Khoi, District 1 · 1.5 km",
  },
];

export const MOCK_SEARCH_ALERTS: SearchDropAlert[] = [
  {
    id: "salert-1",
    keyword: "Cơm trưa & Salad",
    radius_km: 3.5,
    enabled: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "salert-2",
    keyword: "Bánh mì sourdough",
    radius_km: 2.0,
    enabled: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const MOCK_REVIEWS: ShopReview[] = [
  {
    id: "rev-1",
    order_id: "ord-881",
    rating: 5,
    comment: "Bánh croissant cực kỳ thơm giòn, nhân viên giữ chỗ chu đáo nhiệt tình!",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author_name: "Phương Linh",
  },
  {
    id: "rev-2",
    order_id: "ord-882",
    rating: 5,
    comment: "Cơm gà thơm ngon, giá cứu trợ mà chất lượng như nhà hàng lớn.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    author_name: "Minh Quân",
  },
];

// Re-export Mock Data for Module 6, 7, 8
export * from "./modules678MockData";


