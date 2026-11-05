import { useState } from "react";
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
import type { FoodSafetyDetail, SpotReservationResult } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  reservation: SpotReservationResult | null;
  onBack: () => void;
  onPay: (method: string) => Promise<void>;
};

export default function PayDepositScreen({ food, reservation, onBack, onPay }: Props) {
  const [method, setMethod] = useState("momo");
  const [busy, setBusy] = useState(false);
  const total = reservation?.totalAmount ?? Number(food?.current_price ?? 24000);
  const deposit = reservation?.depositAmount ?? 10000;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Pay Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D2 - 45</Text></View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Chi tiết các khoản phí</Text>
          <View style={s.row}>
            <Text style={s.label}>Tổng tiền đơn hàng:</Text>
            <Text style={s.val}>{total.toLocaleString("vi-VN")}đ</Text>
          </View>
          <View style={s.row}>
            <Text style={s.labelHighlight}>Tiền cọc giữ suất (Nộp ngay):</Text>
            <Text style={s.valHighlight}>{deposit.toLocaleString("vi-VN")}đ</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Phí nền tảng:</Text>
            <Text style={s.val}>0đ</Text>
          </View>
          <View style={[s.row, s.borderTop]}>
            <Text style={s.totalKey}>Còn lại trả khi nhận món:</Text>
            <Text style={s.totalVal}>{Math.max(0, total - deposit).toLocaleString("vi-VN")}đ</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Payment method</Text>
          {[
            { id: "ewallet", name: "E-wallet", desc: "Pay with your wallet", icon: "wallet-outline" },
            { id: "bank_qr", name: "Bank QR", desc: "Scan a bank payment QR code", icon: "qr-code-outline" },
            { id: "card", name: "Debit/Credit", desc: "Pay with your card", icon: "card-outline" },
          ].map((m) => (
            <Pressable
              key={m.id}
              style={[s.methodItem, method === m.id && s.methodItemActive]}
              onPress={() => setMethod(m.id)}
            >
              <Ionicons name={m.icon as any} size={24} color={method === m.id ? colors.primary : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={s.methodName}>{m.name}</Text>
                <Text style={s.methodDesc}>{m.desc}</Text>
              </View>
              <Ionicons
                name={method === m.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={method === m.id ? colors.primary : colors.muted}
              />
            </Pressable>
          ))}
        </View>

        <Text style={s.note}>
          The remaining balance is paid to the store when you pick up your order. Your deposit is refunded on pickup.
        </Text>
      </ScrollView>

      <View style={s.bottom}>
        <View>
          <Text style={s.bottomLabel}>Pay now</Text>
          <Text style={s.bottomPrice}>${(deposit / 28000).toFixed(2)}</Text>
        </View>
        <Pressable style={[s.payBtn, busy && { opacity: 0.65 }]} disabled={busy} onPress={async () => {
          setBusy(true);
          try { await onPay(method); }
          catch (error) { Alert.alert("Thanh toán chưa hoàn tất", error instanceof Error ? error.message : "Vui lòng thử lại."); }
          finally { setBusy(false); }
        }}>
          <Text style={s.payBtnText}>{busy ? "Processing…" : "Pay"}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
        <Pressable style={s.cancelBtn} onPress={onBack}><Text style={s.cancelText}>Cancel</Text></Pressable>
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
  cardTitle: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  borderTop: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 8, paddingTop: 10 },
  label: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  val: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  labelHighlight: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary },
  valHighlight: { fontSize: fontSizes.bodyMedium, fontWeight: "800", color: colors.primary },
  totalKey: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink },
  totalVal: { fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.primary },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    marginBottom: 10,
  },
  methodItemActive: { borderColor: colors.primary, backgroundColor: colors.pale },
  methodName: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  methodDesc: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  note: { fontSize: fontSizes.caption, color: colors.muted, textAlign: "center", lineHeight: 18 },
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
    gap: 8,
    flexWrap: "wrap",
  },
  bottomLabel: { fontSize: fontSizes.micro, color: colors.muted },
  bottomPrice: { fontSize: fontSizes.title, fontWeight: "800", color: colors.primary },
  payBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 8,
  },
  payBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
  cancelBtn:{width:"100%",alignItems:"center",paddingVertical:7},
  cancelText:{color:colors.muted,fontSize:fontSizes.bodyMedium,fontWeight:"600"},
});

