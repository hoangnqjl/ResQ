import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function MealDetailReservationScreen({ food, onBack, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"desc" | "safety">("desc");
  const price = Number(food?.current_price ?? 24000);
  const originalPrice = Number(food?.original_price ?? 48000);
  const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Chi tiết suất ăn (M4-D1)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.imageBox}>
          <FallbackPhoto
            uri={imageUrl(food?.image_url)}
            fallback={foodPhoto(food?.name ?? "chicken rice")}
            style={s.image}
          />
          <View style={s.tag}>
            <Text style={s.tagText}>Suất ăn có sẵn</Text>
          </View>
        </View>

        <View style={s.infoCard}>
          <View style={s.rowBetween}>
            <Text style={s.title}>{food?.name || "Combo Sushi & Cơm x2"}</Text>
            <View style={s.rateBadge}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={s.rateText}>4.8</Text>
            </View>
          </View>
            <Text style={s.shopText}>{food?.shop_name || "ResQ Demo Kitchen"} · {food?.address ?? "Pickup address"}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>{money(price)}</Text>
            {originalPrice > price && <Text style={s.priceOriginal}>{money(originalPrice)}</Text>}
            {originalPrice > price && <View style={s.discountBadge}><Text style={s.discountText}>-{Math.round((1 - price / originalPrice) * 100)}%</Text></View>}
          </View>
        </View>

        {/* Tab switch */}
        <View style={s.tabRow}>
          <Pressable
            style={[s.tab, activeTab === "desc" && s.tabActive]}
            onPress={() => setActiveTab("desc")}
          >
            <Text style={[s.tabText, activeTab === "desc" && s.tabTextActive]}>Mô tả món ăn</Text>
          </Pressable>
          <Pressable
            style={[s.tab, activeTab === "safety" && s.tabActive]}
            onPress={() => setActiveTab("safety")}
          >
            <Text style={[s.tabText, activeTab === "safety" && s.tabTextActive]}>Thông tin an toàn</Text>
          </Pressable>
        </View>

        {activeTab === "desc" ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Giới thiệu món ăn</Text>
            <Text style={s.descText}>{food?.description ?? "Seller has not added a description for this meal."}</Text>
            <Pressable style={s.cardBtn} onPress={() => onNavigate("confirmSpotReservation")}>
              <Text style={s.cardBtnText}>Tiếp tục Xác nhận giữ chỗ (Screen 41)</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Chi tiết an toàn thực phẩm</Text>
            {[
              { title: "Đồng hồ hạn an toàn", route: "foodSafetyCountdown" },
              { title: "Ảnh chụp tem mác thực tế", route: "actualProductLabel" },
              { title: "Mốc giờ hạn dùng", route: "expirationInfo" },
              { title: "Hướng dẫn bảo quản", route: "storageInstructions" },
              { title: "Yêu cầu hâm nóng", route: "reheatingInstructions" },
              { title: "Yêu cầu tủ lạnh/đông", route: "refrigerationRequirement" },
              { title: "Cảnh báo hạn dùng", route: "expirationWarning" },
              { title: "Nguồn gốc món ăn", route: "foodOriginInfo" },
              { title: "Cam kết người bán", route: "sellerCommitment" },
              { title: "Quyền lợi khiếu nại", route: "termsComplaintRights" },
            ].map((item, idx) => (
              <Pressable key={idx} style={s.specRow} onPress={() => onNavigate(item.route)}>
                <Text style={s.specText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={s.bottom}>
        <View>
          <Text style={s.priceLabel}>Giá giải cứu</Text>
          <Text style={s.priceVal}>{money(price)}</Text>
        </View>
        <Pressable style={s.actionBtn} onPress={() => onNavigate("confirmSpotReservation")}>
          <Text style={s.actionBtnText}>Tôi đang đến lấy (Giữ chỗ)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: fontSizes.subtitle, fontWeight: "700", color: colors.ink },
  content: { paddingBottom: 100 },
  imageBox: { width: "100%", height: 220, position: "relative" },
  image: { width: "100%", height: "100%" },
  tag: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: { color: colors.white, fontSize: fontSizes.caption, fontWeight: "700" },
  infoCard: { backgroundColor: colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: fontSizes.titleSmall, fontWeight: "800", color: colors.ink },
  rateBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rateText: { fontSize: fontSizes.caption, fontWeight: "700", color: "#92400e" },
  shopText: { fontSize: fontSizes.bodyMedium, color: colors.muted, marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  price: { fontSize: fontSizes.title, fontWeight: "800", color: colors.primary },
  priceOriginal: { fontSize: fontSizes.body, color: colors.muted, textDecorationLine: "line-through" },
  discountBadge: { backgroundColor: colors.paleOrange, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { fontSize: fontSizes.caption, color: colors.orange, fontWeight: "700" },
  tabRow: { flexDirection: "row", backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  tabTextActive: { fontWeight: "700", color: colors.primary },
  section: { backgroundColor: colors.white, padding: 16, marginTop: 10 },
  sectionTitle: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink, marginBottom: 8 },
  descText: { fontSize: fontSizes.bodyMedium, color: "#4b5563", lineHeight: 22, marginBottom: 16 },
  cardBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cardBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  specText: { fontSize: fontSizes.bodyMedium, color: colors.ink },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceLabel: { fontSize: fontSizes.micro, color: colors.muted },
  priceVal: { fontSize: fontSizes.title, fontWeight: "800", color: colors.primary },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

