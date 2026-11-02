import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import type { DepositPaymentResult, FoodSafetyDetail, SpotReservationResult } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  reservation: SpotReservationResult | null;
  deposit: DepositPaymentResult | null;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function DepositReceiptScreen({ food, reservation, deposit, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Biên lai tiền cọc</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D2 - 46</Text></View>

        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name="checkmark-circle" size={54} color={colors.primary} />
          </View>
          <Text style={s.receiptTitle}>Đã nhận tiền cọc: {(deposit?.amount ?? reservation?.depositAmount ?? 10000).toLocaleString("vi-VN")}đ</Text>
          <Text style={s.receiptSub}>Đơn hàng của bạn đang được khóa giữ an toàn</Text>

          <View style={s.divider} />

          <View style={s.table}>
            <View style={s.row}>
              <Text style={s.key}>Mã giao dịch (Tx ID)</Text>
              <Text style={s.val}>{deposit?.transactionId ?? "—"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.key}>Thời gian nộp cọc</Text>
              <Text style={s.val}>{deposit?.paidAt ?? "Vừa xong"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.key}>Thời hạn giữ suất</Text>
              <Text style={s.valHighlight}>{reservation?.holdExpiresAt ? new Date(reservation.holdExpiresAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.key}>Trạng thái tiền cọc</Text>
              <Text style={s.valSafe}>Đang ký quỹ (Escrow)</Text>
            </View>
            <View style={s.row}>
              <Text style={s.key}>Cơ chế giải ngân</Text>
              <Text style={s.val}>Hoàn 100% khi nhận món</Text>
            </View>
          </View>

          <View style={s.noteBox}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <Text style={s.noteText}>
              Xác thực biên lai số tự động. Tiền cọc được khóa an toàn bởi ResQ Escrow và sẽ hoàn lại ngay khi nhân viên quét mã nhận món.
            </Text>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("pickupTimeSlot")}>
            <Text style={s.nextBtnText}>Chọn khung giờ lấy món (Screen 47)</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
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
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.line, alignItems: "center" },
  iconWrap: { marginBottom: 10 },
  receiptTitle: { fontSize: fontSizes.titleSmall, fontWeight: "800", color: colors.ink, textAlign: "center" },
  receiptSub: { fontSize: fontSizes.bodyMedium, color: colors.muted, textAlign: "center", marginTop: 4 },
  divider: { width: "100%", height: 1, backgroundColor: colors.line, marginVertical: 16 },
  table: { width: "100%", gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  key: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  val: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  valHighlight: { fontSize: fontSizes.bodyMedium, fontWeight: "800", color: colors.orange },
  valSafe: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary },
  noteBox: {
    flexDirection: "row",
    backgroundColor: colors.pale,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginVertical: 20,
    alignItems: "flex-start",
  },
  noteText: { fontSize: fontSizes.caption, color: colors.ink, lineHeight: 18, flex: 1 },
  nextBtn: {
    width: "100%",
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

