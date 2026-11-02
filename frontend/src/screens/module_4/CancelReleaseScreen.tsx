import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import { useState } from "react";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
  onRelease: () => Promise<{ portionsReleased: number; assignedToWaitlist: boolean; nextBuyerName?: string | null }>;
};

export default function CancelReleaseScreen({ food, onBack, onNavigate, onRelease }: Props) {
  const [busy, setBusy] = useState(false);
  const handleConfirm = () => {
    Alert.alert(
      "Xác nhận giải phóng",
      "Đơn sẽ bị hủy và các suất được đề nghị cho người tiếp theo trong waitlist.",
      [{ text: "Quay lại", style: "cancel" }, { text: "Xác nhận", onPress: async () => {
        setBusy(true);
        try {
          const result = await onRelease();
          const message = result.assignedToWaitlist
            ? `${result.portionsReleased} suất đã được đề nghị cho ${result.nextBuyerName ?? "người trong danh sách chờ"}.`
            : `${result.portionsReleased} suất đã trở lại thực đơn.`;
          Alert.alert("Đã giải phóng", message, [{ text: "OK", onPress: () => onNavigate("home") }]);
        } catch (error) {
          Alert.alert("Không thể giải phóng suất", error instanceof Error ? error.message : "Vui lòng thử lại.");
        } finally { setBusy(false); }
      } }]
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Hủy & Giải phóng suất</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D4 - 53</Text></View>

        <View style={s.card}>
          <Text style={s.cardHeader}>Đơn hàng quá hạn</Text>
          <Text style={s.cardSub}>{food?.name ?? "Meal"} · {food?.shop_name ?? "ResQ Demo Kitchen"}</Text>

          <View style={s.releaseBox}>
            <Ionicons name="arrow-undo-circle" size={32} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.releaseTitle}>Các suất giữ chỗ sẵn sàng giải phóng</Text>
              <Text style={s.releaseDesc}>{food?.name ?? "Meal"} · Chuyển theo hàng đợi</Text>
            </View>
          </View>
        </View>

        {/* Assigned to Waitlist Next Buyer */}
        <View style={s.waitlistCard}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarText}>C</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.waitlistTitle}>Ưu tiên người tiếp theo trong Waitlist</Text>
            <Text style={s.waitlistSub}>Nếu không có ai đang chờ, suất ăn trở lại thực đơn công khai.</Text>
          </View>
        </View>

        {/* What happens next */}
        <View style={s.whatNextCard}>
          <Text style={s.whatNextHeader}>Quy trình tiếp theo:</Text>
          <View style={s.stepRow}>
            <Text style={s.numBadge}>1</Text>
            <Text style={s.stepText}>Tiền cọc 10.000đ được chuyển vào quỹ chống lãng phí của quán.</Text>
          </View>
          <View style={s.stepRow}>
            <Text style={s.numBadge}>2</Text>
            <Text style={s.stepText}>Buyer A (người bùng hẹn) nhận thông báo hủy đơn tự động.</Text>
          </View>
          <View style={s.stepRow}>
            <Text style={s.numBadge}>3</Text>
            <Text style={s.stepText}>Buyer C nhận thông báo Push Notification để đến lấy suất.</Text>
          </View>
          <View style={s.stepRow}>
            <Text style={s.numBadge}>4</Text>
            <Text style={s.stepText}>Nếu Buyer C không phản hồi trong 15 phút, suất chuyển cho vị trí #2.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable style={[s.confirmBtn, busy && { opacity: 0.65 }]} disabled={busy} onPress={handleConfirm}>
          <Ionicons name="checkmark-done" size={20} color={colors.white} />
          <Text style={s.confirmBtnText}>Xác nhận giải phóng & Chuyển suất</Text>
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
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  cardHeader: { fontSize: fontSizes.bodyLarge, fontWeight: "800", color: colors.ink },
  cardSub: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2, marginBottom: 14 },
  releaseBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pale,
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  releaseTitle: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary },
  releaseDesc: { fontSize: fontSizes.caption, color: colors.ink, marginTop: 2 },
  waitlistCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pale,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.primary },
  waitlistTitle: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  waitlistSub: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  whatNextCard: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  whatNextHeader: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  numBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.pale,
    color: colors.primary,
    fontWeight: "800",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 20,
  },
  stepText: { fontSize: fontSizes.caption, color: "#374151", flex: 1, lineHeight: 18 },
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
  confirmBtn: {
    backgroundColor: colors.danger,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

