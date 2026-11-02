import { useState, useEffect } from "react";
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
import { formatSafetyDate, secondsUntil } from "./foodSafetyFormat";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function FoodSafetyCountdownScreen({ food, onBack, onNavigate }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(food?.recommended_expiry));

  useEffect(() => {
    setSecondsLeft(secondsUntil(food?.recommended_expiry));
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (food?.recommended_expiry) return secondsUntil(food.recommended_expiry);
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [food?.recommended_expiry]);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const timeStr = `${pad(Math.floor(secondsLeft / 3600))}:${pad(Math.floor((secondsLeft % 3600) / 60))}:${pad(secondsLeft % 60)}`;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Countdown an toàn thực phẩm</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 30</Text>
          <Text style={s.sub}>Thời gian sử dụng an toàn còn lại</Text>

          <View style={s.timerCircle}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={s.timer}>{timeStr}</Text>
            <Text style={s.timerUnit}>Giờ : Phút : Giây</Text>
          </View>

          <View style={s.dateBox}>
            <View style={s.dateRow}>
              <Text style={s.dateKey}>Hạn an toàn tối đa:</Text>
              <Text style={s.dateVal}>{formatSafetyDate(food?.recommended_expiry)}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateKey}>Trạng thái:</Text>
            <Text style={secondsLeft > 0 ? s.statusSafe : s.dateVal}>{secondsLeft > 0 ? "Trong thời hạn an toàn" : "Đã hết hạn khuyến nghị"}</Text>
            </View>
          </View>

          <Text style={s.notice}>
            Vui lòng nhận và sử dụng trước khi đồng hồ đếm ngược kết thúc để đảm bảo độ tươi ngon và an toàn nhất.
          </Text>

          <Pressable style={s.detailBtn} onPress={() => onNavigate("expirationInfo")}>
            <Text style={s.detailBtnText}>Xem chi tiết hạn sử dụng (Screen 32)</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
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
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  badge: {
    fontSize: fontSizes.caption,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  sub: { fontSize: fontSizes.bodyMedium, color: colors.muted, textAlign: "center" },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.pale,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  timer: { fontSize: 34, fontWeight: "900", color: colors.primary, letterSpacing: 2 },
  timerUnit: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 4 },
  dateBox: {
    width: "100%",
    backgroundColor: colors.pale2,
    borderRadius: 10,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  dateKey: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  dateVal: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  statusSafe: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary },
  notice: { fontSize: fontSizes.caption, color: "#4b5563", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  detailBtn: {
    width: "100%",
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

