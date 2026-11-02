import { useState, useEffect } from "react";
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
  onNavigate: (route: string) => void;
};

export default function ReservationTimeScreen({ food, reservation, onBack, onNavigate }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [extended, setExtended] = useState(false);

  useEffect(() => {
    const deadline = reservation ? new Date(reservation.holdExpiresAt).getTime() : 0;
    const timer = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    }, 1000);
    setSeconds(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    return () => clearInterval(timer);
  }, [reservation?.holdExpiresAt]);

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExtend = () => {
    Alert.alert("Thời gian giữ chỗ", "Đồng hồ phản ánh thời hạn giữ suất đã xác nhận trong hệ thống.");
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Đồng hồ giữ chỗ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D1 - 42</Text></View>

        <View style={s.timerCard}>
          <Text style={s.timerLabel}>Suất ăn được khóa giữ cho bạn trong:</Text>
          <Text style={s.timerBig}>{formatTime()}</Text>
          <Text style={s.timerSub}>phút : giây</Text>

          <View style={s.itemInfo}>
            <Text style={s.foodText}>{food?.name ?? "Meal"} × {reservation?.quantity ?? 1}</Text>
            <Text style={s.shopText}>{food?.shop_name ?? "ResQ Demo Kitchen"} · Mã lấy hàng: {reservation?.pickupCode ?? "—"}</Text>
          </View>

          <View style={s.btnRow}>
            <Pressable
              style={[s.extendBtn, extended && s.extendBtnDisabled]}
              onPress={handleExtend}
            >
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={s.extendBtnText}>
                {extended ? "Đã gia hạn (+10p)" : "Gia hạn thêm 10 phút (Tối đa 1 lần)"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={s.remindCard}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.remindTitle}>Chuông báo nhắc nhở</Text>
            <Text style={s.remindDesc}>Hệ thống sẽ gửi chuông rung khi còn 5 phút.</Text>
          </View>
        </View>

        <Pressable style={s.nextBtn} onPress={() => onNavigate("yourOrderWaiting")}>
          <Text style={s.nextBtnText}>Xem trạng thái đơn đang chờ (Screen 43)</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable
          style={s.arrivedBtn}
          onPress={() => Alert.alert("Đã đến", "Bạn đã thông báo đến quán! Đưa mã A7K-294 để nhận đồ ăn.")}
        >
          <Ionicons name="checkmark-done" size={20} color={colors.white} />
          <Text style={s.arrivedBtnText}>Tôi đã đến nơi</Text>
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
  timerCard: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  timerLabel: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  timerBig: { fontSize: 52, fontWeight: "900", color: colors.primary, letterSpacing: 2, marginVertical: 10 },
  timerSub: { fontSize: fontSizes.caption, color: colors.muted },
  itemInfo: {
    backgroundColor: colors.pale2,
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 18,
    gap: 4,
  },
  foodText: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink },
  shopText: { fontSize: fontSizes.caption, color: colors.muted },
  btnRow: { marginTop: 16, width: "100%" },
  extendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.pale,
    paddingVertical: 12,
    borderRadius: 10,
  },
  extendBtnDisabled: { opacity: 0.5 },
  extendBtnText: { fontSize: fontSizes.caption, fontWeight: "700", color: colors.primary },
  remindCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  remindTitle: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  remindDesc: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  nextBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextBtnText: { color: colors.primary, fontWeight: "700", fontSize: fontSizes.body },
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
  arrivedBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  arrivedBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

