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
import type { DepositPaymentResult, FoodSafetyDetail, SpotReservationResult } from "../../services/foodSafetyReservationApi";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";

type Props = {
  food?: FoodSafetyDetail;
  reservation: SpotReservationResult | null;
  deposit: DepositPaymentResult | null;
  pickupSlot?: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function OrderDetailsSlotScreen({ food, reservation, deposit, pickupSlot, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Chi tiết đơn đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D3 - 49</Text></View>

        <View style={s.orderTop}>
          <View>
            <Text style={s.orderId}>Mã đơn: #{reservation?.orderId.slice(0, 8) ?? "—"}</Text>
            <Text style={s.orderTime}>Đặt lúc {deposit?.paidAt ?? "vừa xong"}</Text>
          </View>
          <View style={s.statusPill}>
            <Text style={s.statusPillText}>Đã xác nhận</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.itemRow}>
            <FallbackPhoto
              uri={imageUrl(food?.image_url)}
              fallback={foodPhoto(food?.name ?? "chicken rice")}
              style={s.itemThumb}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{food?.name ?? "Meal"} × {reservation?.quantity ?? 1}</Text>
              <Text style={s.itemShop}>{food?.shop_name ?? "ResQ Demo Kitchen"}</Text>
              <Text style={s.itemPrice}>{(reservation?.totalAmount ?? 0).toLocaleString("vi-VN")}đ (Đã cọc {(reservation?.depositAmount ?? 0).toLocaleString("vi-VN")}đ)</Text>
            </View>
          </View>

          <View style={s.slotRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.slotTitle}>Khung giờ lấy món đã chọn</Text>
              <Text style={s.slotTime}>{pickupSlot || "Chưa chọn khung giờ"}</Text>
            </View>
            <Pressable onPress={() => onNavigate("pickupTimeSlot")}>
              <Text style={s.changeBtn}>Đổi</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.codeBox}>
          <Text style={s.codeLabel}>MÃ NHẬN MÓN (PICKUP CODE)</Text>
              <Text style={s.codeVal}>{reservation?.pickupCode ?? "—"}</Text>
          <Text style={s.codeSub}>Đưa mã này khi đến quán để nhận đồ ăn nhanh chóng</Text>
        </View>

        <View style={s.flowCard}>
          <Text style={s.flowTitle}>Các bước tiếp theo của Module 4:</Text>
          {[
            { title: "Đồng hồ giữ chỗ (Screen 42)", route: "reservationTime" },
            { title: "Trạng thái đơn đang chờ (Screen 43)", route: "yourOrderWaiting" },
            { title: "Hàng đợi Waitlist (Screen 51)", route: "waitlistQueue" },
            { title: "Cảnh báo đơn quá hạn (Screen 52)", route: "overdueOrder" },
            { title: "Hủy & Giải phóng suất (Screen 53)", route: "cancelRelease" },
          ].map((item, idx) => (
            <Pressable key={idx} style={s.flowRow} onPress={() => onNavigate(item.route)}>
              <Text style={s.flowText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable style={s.actionBtn} onPress={() => onNavigate("reservationTime")}>
          <Text style={s.actionBtnText}>Mở đồng hồ giữ chỗ (Screen 42)</Text>
          <Ionicons name="time-outline" size={18} color={colors.white} />
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
  content: { padding: 16, gap: 14, paddingBottom: 100 },
  badgeBox: { alignItems: "flex-start" },
  badge: {
    fontSize: fontSizes.caption,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderId: { fontSize: fontSizes.bodyLarge, fontWeight: "800", color: colors.ink },
  orderTime: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  statusPill: { backgroundColor: colors.pale, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: fontSizes.caption, fontWeight: "700", color: colors.primary },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line, gap: 12 },
  itemRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  itemThumb: { width: 56, height: 56, borderRadius: 8 },
  itemName: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  itemShop: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  itemPrice: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary, marginTop: 4 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pale2,
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  slotTitle: { fontSize: fontSizes.micro, color: colors.muted },
  slotTime: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink, marginTop: 2 },
  changeBtn: { fontSize: fontSizes.caption, fontWeight: "700", color: colors.primary },
  codeBox: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
  },
  codeLabel: { fontSize: fontSizes.micro, fontWeight: "700", color: colors.muted, letterSpacing: 1 },
  codeVal: { fontSize: 32, fontWeight: "900", color: colors.ink, letterSpacing: 4, marginVertical: 4 },
  codeSub: { fontSize: fontSizes.caption, color: colors.muted, textAlign: "center" },
  flowCard: { backgroundColor: colors.white, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  flowTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 8 },
  flowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  flowText: { fontSize: fontSizes.bodyMedium, color: colors.primary, fontWeight: "600" },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

