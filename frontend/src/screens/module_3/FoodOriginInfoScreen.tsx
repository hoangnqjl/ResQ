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

export default function FoodOriginInfoScreen({ food, onBack, onNavigate }: Props) {
  const origin = food?.origin_info;
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Nguồn gốc món ăn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 37</Text>
          <Text style={s.title}>Hồ sơ cơ sở chế biến & Bếp ăn</Text>
          <Text style={s.sub}>Được chứng thực bởi hệ sinh thái ResQ Food Safety</Text>

          <View style={s.originTable}>
            <View style={s.row}>
              <Text style={s.label}>Tên cơ sở kinh doanh</Text>
              <Text style={s.val}>{food?.shop_name ?? "Seller has not provided a shop name"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Địa chỉ hoạt động</Text>
              <Text style={s.val}>{food?.address ?? "Seller has not provided an address"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Số giấy phép kinh doanh</Text>
              <Text style={s.valHighlight}>{origin?.business_permit ?? "Not provided"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Ngày cấp phép hoạt động</Text>
              <Text style={s.val}>{origin?.activity_start ?? "Not provided"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Cơ quan kiểm định ATTP</Text>
              <Text style={s.val}>{origin?.inspected_by ?? "Not provided"}</Text>
            </View>
          </View>

          <View style={s.verifiedCard}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.verifiedTitle}>Nguồn gốc nguyên liệu sạch</Text>
              <Text style={s.verifiedDesc}>
                {origin?.ingredient_source ?? `Seller certificate: ${origin?.certificate_no ?? "Not provided"}.`}
              </Text>
            </View>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("termsComplaintRights")}>
            <Text style={s.nextBtnText}>Xem điều khoản & quyền lợi khiếu nại (Screen 39)</Text>
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
  originTable: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  val: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  valHighlight: { fontSize: fontSizes.bodyMedium, fontWeight: "800", color: colors.primary },
  verifiedCard: {
    flexDirection: "row",
    backgroundColor: colors.pale,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  verifiedTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.primary },
  verifiedDesc: { fontSize: fontSizes.caption, color: colors.ink, marginTop: 2, lineHeight: 18 },
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

