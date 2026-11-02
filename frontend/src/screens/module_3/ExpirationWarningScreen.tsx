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
import { formatSafetyDate } from "./foodSafetyFormat";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function ExpirationWarningScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Cảnh báo thời gian sử dụng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 36</Text>
          <Text style={s.title}>Quy định kiểm soát hạn dùng</Text>
          <Text style={s.sub}>Bảo vệ sức khỏe và hệ tiêu hóa của người sử dụng</Text>

          <View style={s.dangerCard}>
            <Ionicons name="warning" size={32} color={colors.danger} />
            <Text style={s.dangerTitle}>TUYỆT ĐỐI KHÔNG DÙNG THỰC PHẨM QUÁ HẠN</Text>
            <Text style={s.dangerDesc}>
              Dùng {food?.name ?? "món ăn"} trước {formatSafetyDate(food?.recommended_expiry)}. Không sử dụng sau thời điểm này.
            </Text>
          </View>

          <View style={s.expiryTypesBox}>
            <Text style={s.sectionTitle}>Mốc thời gian theo từng nhóm món:</Text>
            <View style={s.typeRow}>
              <Text style={s.typeDot}>•</Text>
              <Text style={s.typeText}>
                <Text style={{ fontWeight: "700" }}>Món nóng / Nấu chín: </Text>Dùng ngay trong 2 giờ hoặc tối đa trước 23:00 cùng ngày.
              </Text>
            </View>
            <View style={s.typeRow}>
              <Text style={s.typeDot}>•</Text>
              <Text style={s.typeText}>
                <Text style={{ fontWeight: "700" }}>Bánh mì / Bánh ngọt: </Text>Sử dụng trong 24 giờ.
              </Text>
            </View>
            <View style={s.typeRow}>
              <Text style={s.typeDot}>•</Text>
              <Text style={s.typeText}>
                <Text style={{ fontWeight: "700" }}>Đồ tươi sống / Cấp đông: </Text>Bảo quản đúng theo tem nhãn nhà sản xuất.
              </Text>
            </View>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("sellerCommitment")}>
            <Text style={s.nextBtnText}>Xem cam kết của người bán (Screen 38)</Text>
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
  dangerCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: fontSizes.body,
    fontWeight: "800",
    color: colors.danger,
    marginTop: 8,
    textAlign: "center",
  },
  dangerDesc: {
    fontSize: fontSizes.caption,
    color: "#7f1d1d",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  expiryTypesBox: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, marginBottom: 20 },
  sectionTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 10 },
  typeRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  typeDot: { color: colors.primary, fontSize: 16 },
  typeText: { fontSize: fontSizes.bodyMedium, color: "#374151", flex: 1, lineHeight: 20 },
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

