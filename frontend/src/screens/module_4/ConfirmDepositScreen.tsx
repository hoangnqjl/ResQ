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
import type { FoodSafetyDetail, SpotReservationResult } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  reservation: SpotReservationResult | null;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function ConfirmDepositScreen({ food, reservation, onBack, onNavigate }: Props) {
  const [agreed, setAgreed] = useState(true);
  const total = reservation?.totalAmount ?? Number(food?.current_price ?? 24000);
  const deposit = reservation?.depositAmount ?? 10000;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Confirm Deposit</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D2 - 44</Text></View>

        <View style={s.card}>
          <Text style={s.itemTitle}>{food?.name ?? "Combo Sushi & Rice"} × {reservation?.quantity ?? 1}</Text>
          <Text style={s.shopSub}>{food?.shop_name ?? "ResQ Demo Kitchen"}</Text>
          <Text style={s.totalOrderVal}>Order Total: {total.toLocaleString("vi-VN")}đ</Text>

          <View style={s.depositBox}>
            <Text style={s.depLabel}>Reservation deposit:</Text>
            <Text style={s.depVal}>{deposit.toLocaleString("vi-VN")}đ</Text>
            <Text style={s.depNote}>Mandatory deposit to secure pickup</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.termsHeader}>Deposit Terms</Text>
          <View style={s.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={s.bulletText}>
              100% deposit refunded upon picking up on time.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={s.bulletText}>
              Instant refund if store is out of stock or cancels order.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={s.bulletText}>
              Deposit is forfeited if pickup is missed after holding window (+15m grace period). Forfeited funds go to food waste prevention fund.
            </Text>
          </View>

          <Pressable style={s.agreeRow} onPress={() => setAgreed(!agreed)}>
            <Ionicons
              name={agreed ? "checkbox" : "square-outline"}
              size={22}
              color={agreed ? colors.primary : colors.muted}
            />
            <Text style={s.agreeText}>I agree with the deposit terms</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable
          style={[s.actionBtn, !agreed && s.actionBtnDisabled]}
          onPress={() => onNavigate("payDeposit")}
          disabled={!agreed}
        >
          <Text style={s.actionBtnText}>Proceed to Deposit ({deposit.toLocaleString("vi-VN")}đ)</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    height: 38,
    width: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: colors.ink,
    marginTop: -3,
  },
  headerTitle: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: colors.ink,
    flex: 1,
    textAlign: "center",
  },
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
  itemTitle: { fontSize: fontSizes.bodyLarge, fontWeight: "800", color: colors.ink },
  shopSub: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  totalOrderVal: { fontSize: fontSizes.body, fontWeight: "600", color: colors.ink, marginTop: 6 },
  depositBox: {
    backgroundColor: colors.pale,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    alignItems: "center",
  },
  depLabel: { fontSize: fontSizes.caption, color: colors.muted },
  depVal: { fontSize: 32, fontWeight: "900", color: colors.primary, marginVertical: 4 },
  depNote: { fontSize: fontSizes.micro, color: colors.primary, fontWeight: "600" },
  termsHeader: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  bulletText: { fontSize: fontSizes.caption, color: "#374151", flex: 1, lineHeight: 18 },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  agreeText: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
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
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

