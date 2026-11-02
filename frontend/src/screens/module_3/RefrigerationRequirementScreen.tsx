import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function RefrigerationRequirementScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Yêu cầu tủ lạnh/tủ đông</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 35</Text>
          <Text style={s.title}>Mức nhiệt độ tiêu chuẩn</Text>
          <Text style={s.sub}>Điều kiện bảo quản cho {food?.name ?? "món ăn này"}</Text>

          <View style={s.zoneCard}>
            <View style={s.zoneHead}>
              <Ionicons name="snow" size={24} color="#0284c7" />
              <Text style={s.zoneTitle}>Ngăn đông lạnh (Freezer)</Text>
            </View>
            <Text style={s.tempHighlight}>Nhiệt độ ≤ -18°C</Text>
            <Text style={s.zoneDesc}>
              Áp dụng cho các sản phẩm cấp đông, nguyên liệu hải sản hoặc thịt đã tẩm ướp. Bảo quản được từ 1–3 tháng.
            </Text>
          </View>

          <View style={s.zoneCard}>
            <View style={s.zoneHead}>
              <Ionicons name="thermometer-outline" size={24} color={colors.primary} />
              <Text style={s.zoneTitle}>Ngăn mát (Refrigerator)</Text>
            </View>
            <Text style={s.tempHighlight}>Nhiệt độ 0°C – 4°C</Text>
            <Text style={s.zoneDesc}>{food?.refrigeration_requirement ?? food?.storage_instructions ?? "Không yêu cầu bảo quản lạnh theo thông tin hiện có."}</Text>
          </View>

          <View style={s.zoneCard}>
            <View style={s.zoneHead}>
              <Ionicons name="sunny-outline" size={24} color={colors.orange} />
              <Text style={s.zoneTitle}>Nhiệt độ phòng (Ngắn hạn)</Text>
            </View>
            <Text style={[s.tempHighlight, { color: colors.orange }]}>Khoảng 25°C – 28°C</Text>
            <Text style={s.zoneDesc}>
              Nếu không có tủ lạnh, bắt buộc sử dụng trong vòng 2 giờ sau khi nhận để tránh ôi thiu.
            </Text>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("foodOriginInfo")}>
            <Text style={s.nextBtnText}>Xem nguồn gốc món ăn (Screen 37)</Text>
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
  content: { padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.line },
  badge: {
    fontSize: fontSizes.caption,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  title: { fontSize: fontSizes.titleSmall, fontWeight: "800", color: colors.ink },
  sub: { fontSize: fontSizes.bodyMedium, color: colors.muted, marginTop: 4, marginBottom: 16 },
  zoneCard: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, marginBottom: 12 },
  zoneHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  zoneTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink },
  tempHighlight: { fontSize: fontSizes.bodyLarge, fontWeight: "800", color: colors.primary, marginBottom: 6 },
  zoneDesc: { fontSize: fontSizes.caption, color: "#4b5563", lineHeight: 18 },
  nextBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  nextBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

