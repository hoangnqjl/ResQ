import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import type { FoodSafetyDetail, SpotReservationResult } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  reservation: SpotReservationResult | null;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function OverdueOrderScreen({ food, reservation, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Đơn hàng quá hạn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D4 - 52</Text></View>

        <View style={s.overdueCard}>
          <View style={s.iconWrap}>
            <Ionicons name="alert-circle" size={48} color={colors.danger} />
          </View>
          <Text style={s.overdueTitle}>HẾT THỜI GIAN GIỮ CHỖ (HOLD EXPIRED)</Text>
          <Text style={s.overdueTime}>Hết hạn lúc {reservation ? new Date(reservation.holdExpiresAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Thông tin suất ăn bị quá hạn</Text>
          <View style={s.row}>
            <Text style={s.key}>Món ăn:</Text>
            <Text style={s.val}>{food?.name ?? "Meal"} × {reservation?.quantity ?? 1}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Cửa hàng:</Text>
            <Text style={s.val}>{food?.shop_name ?? "ResQ Demo Kitchen"} · {(reservation?.totalAmount ?? 0).toLocaleString("vi-VN")}đ</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Mã đơn hàng:</Text>
            <Text style={s.val}>#{reservation?.orderId.slice(0, 8) ?? "—"}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Mã lấy hàng:</Text>
            <Text style={s.val}>{reservation?.pickupCode ?? "—"}</Text>
          </View>
        </View>

        <View style={s.noticeBox}>
          <Ionicons name="information-circle-outline" size={22} color={colors.danger} />
          <Text style={s.noticeText}>
            Theo quy định, tiền cọc 10.000đ sẽ chuyển vào quỹ chống lãng phí của quán. Suất ăn hiện đã sẵn sàng để chuyển nhượng cho người tiếp theo trong Waitlist.
          </Text>
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable style={s.releaseBtn} onPress={() => onNavigate("cancelRelease")}>
          <Text style={s.releaseBtnText}>Xem quy trình Chuyển nhượng (Screen 53)</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
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
  content: { padding: 16, gap: 14 },
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
  overdueCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#fecaca",
    padding: 20,
    alignItems: "center",
  },
  iconWrap: { marginBottom: 8 },
  overdueTitle: { fontSize: fontSizes.bodyLarge, fontWeight: "900", color: colors.danger, textAlign: "center" },
  overdueTime: { fontSize: fontSizes.caption, color: "#991b1b", marginTop: 4, fontWeight: "600" },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line, gap: 10 },
  cardTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  key: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  val: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  noticeBox: {
    flexDirection: "row",
    backgroundColor: "#fff1f2",
    padding: 14,
    borderRadius: 12,
    gap: 10,
    alignItems: "flex-start",
  },
  noticeText: { fontSize: fontSizes.caption, color: "#881337", flex: 1, lineHeight: 18 },
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
  releaseBtn: {
    backgroundColor: colors.danger,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  releaseBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

