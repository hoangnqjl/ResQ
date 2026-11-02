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

export default function YourOrderWaitingScreen({ food, reservation, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Đơn của bạn (Đang chờ)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D1 - 43</Text></View>

        {/* Stepper Status (Reserved -> On the way -> Picked up) */}
        <View style={s.stepperCard}>
          <View style={s.stepRow}>
            <View style={[s.stepDot, s.stepDotActive]}>
              <Ionicons name="checkmark" size={14} color={colors.white} />
            </View>
            <View style={[s.stepLine, s.stepLineActive]} />
            <View style={[s.stepDot, s.stepDotActive]}>
              <Text style={s.stepNumberActive}>2</Text>
            </View>
            <View style={s.stepLine} />
            <View style={s.stepDot}>
              <Text style={s.stepNumber}>3</Text>
            </View>
          </View>
          <View style={s.stepLabels}>
            <Text style={s.stepLabelTextActive}>Đã giữ chỗ</Text>
            <Text style={s.stepLabelTextActive}>Đang đến lấy</Text>
            <Text style={s.stepLabelText}>Đã nhận món</Text>
          </View>
        </View>

        <View style={s.countdownBanner}>
          <Ionicons name="time" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.countdownTitle}>Suất đang được giữ trong {reservation?.holdMinutes ?? 20} phút</Text>
            <Text style={s.countdownSub}>Cửa hàng đang đóng gói sẵn suất ăn của bạn</Text>
          </View>
        </View>

        <View style={s.codeCard}>
          <Text style={s.codeHeader}>MÃ NHẬN HÀNG NHANH</Text>
          <Text style={s.codeValue}>{reservation?.pickupCode ?? "—"}</Text>
          <Text style={s.codeSub}>Xuất trình cho nhân viên tại quầy</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Thông tin cửa hàng</Text>
          <Text style={s.shopName}>{food?.shop_name ?? "ResQ Demo Kitchen"}</Text>
          <Text style={s.shopAddress}>{food?.address ?? "Pickup address"}</Text>

          <View style={s.quickActions}>
            <Pressable style={s.quickBtn}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <Text style={s.quickBtnText}>Mở bản đồ</Text>
            </Pressable>
            <Pressable style={s.quickBtn}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={s.quickBtnText}>Gọi quán</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.footerLinks}>
          <Pressable style={s.linkBtn} onPress={() => onNavigate("overdueOrder")}>
            <Text style={s.linkBtnText}>Xem màn hình cảnh báo quá hạn (Screen 52)</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
          <Pressable style={s.linkBtn} onPress={() => onNavigate("cancelRelease")}>
            <Text style={[s.linkBtnText, { color: colors.danger }]}>Hủy & Giải phóng suất ăn (Screen 53)</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.danger} />
          </Pressable>
        </View>
      </ScrollView>
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
  content: { padding: 16, gap: 14, paddingBottom: 60 },
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
  stepperCard: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepNumber: { fontSize: fontSizes.caption, color: colors.muted, fontWeight: "700" },
  stepNumberActive: { fontSize: fontSizes.caption, color: colors.white, fontWeight: "700" },
  stepLine: { width: 70, height: 2, backgroundColor: colors.line },
  stepLineActive: { backgroundColor: colors.primary },
  stepLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  stepLabelText: { fontSize: fontSizes.micro, color: colors.muted },
  stepLabelTextActive: { fontSize: fontSizes.micro, fontWeight: "700", color: colors.primary },
  countdownBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pale,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  countdownTitle: { fontSize: fontSizes.body, fontWeight: "800", color: colors.primary },
  countdownSub: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  codeCard: {
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
  },
  codeHeader: { fontSize: fontSizes.micro, fontWeight: "700", color: colors.muted, letterSpacing: 1 },
  codeValue: { fontSize: 36, fontWeight: "900", color: colors.ink, letterSpacing: 4, marginVertical: 6 },
  codeSub: { fontSize: fontSizes.caption, color: colors.muted },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  cardTitle: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink, marginBottom: 6 },
  shopName: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  shopAddress: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2, marginBottom: 14 },
  quickActions: { flexDirection: "row", gap: 12 },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.pale2,
    paddingVertical: 12,
    borderRadius: 10,
  },
  quickBtnText: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary },
  footerLinks: { gap: 10 },
  linkBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  linkBtnText: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.primary },
});

