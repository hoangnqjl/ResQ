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
import { formatSafetyDate, secondsUntil } from "./foodSafetyFormat";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function ExpirationInfoScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Thông tin hạn sử dụng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 32</Text>
          <Text style={s.title}>Mốc giờ & Điều kiện bảo quản</Text>
          <Text style={s.sub}>Cập nhật theo nhãn thực tế của món ăn</Text>

          <View style={s.table}>
            <View style={s.row}>
              <Text style={s.label}>Ngày sản xuất (NSX)</Text>
              <Text style={s.value}>{formatSafetyDate(food?.manufacturing_date)}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Hạn sử dụng khuyến nghị</Text>
              <Text style={s.highlight}>{formatSafetyDate(food?.recommended_expiry)}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Điều kiện bảo quản</Text>
              <Text style={s.value}>{food?.refrigeration_requirement ?? food?.storage_instructions ?? "Follow the package label."}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Thời gian an toàn còn lại</Text>
              <Text style={s.countdownVal}>{Math.floor(secondsUntil(food?.recommended_expiry) / 3600)} giờ còn lại</Text>
            </View>
          </View>

          <View style={s.alert}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={s.alertText}>
              Vui lòng dùng trước {formatSafetyDate(food?.recommended_expiry)} để đảm bảo độ tươi mới và an toàn.
            </Text>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("reheatingInstructions")}>
            <Text style={s.nextBtnText}>Xem yêu cầu hâm nóng (Screen 34)</Text>
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
  table: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  value: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  highlight: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.orange },
  countdownVal: { fontSize: fontSizes.bodyMedium, fontWeight: "800", color: colors.primary },
  alert: {
    flexDirection: "row",
    backgroundColor: colors.pale,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  alertText: { fontSize: fontSizes.caption, color: colors.ink, lineHeight: 18, flex: 1 },
  nextBtn: {
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

