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

export default function ComplaintRefundPolicyScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Chính sách khiếu nại & Hoàn tiền</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C3 (Figma 1:28456)</Text>
          <Text style={s.title}>Cam kết bồi hoàn chất lượng 100%</Text>
          <Text style={s.sub}>Quy định kiểm duyệt tranh chấp giữa người mua và người bán</Text>

          <View style={s.policyCard}>
            <View style={s.policyHead}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text style={s.policyHeadTitle}>1. Khung giờ khiếu nại nghiêm ngặt</Text>
            </View>
            <Text style={s.policyDesc}>
              Khiếu nại cần được gửi trước {formatSafetyDate(food?.recommended_expiry)}, mốc hết hạn khuyến nghị của món ăn.
            </Text>
          </View>

          <View style={s.policyCard}>
            <View style={s.policyHead}>
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={s.policyHeadTitle}>2. Bằng chứng hình ảnh / video</Text>
            </View>
            <Text style={s.policyDesc}>
              Cần cung cấp hình ảnh rõ nét chụp tem niêm phong ngày giờ của quán kèm ảnh chi tiết lỗi thức ăn.
            </Text>
          </View>

          <View style={s.policyCard}>
            <View style={s.policyHead}>
              <Ionicons name="wallet" size={24} color={colors.primary} />
              <Text style={s.policyHeadTitle}>3. Hoàn tiền tức thì về Ví ResQ</Text>
            </View>
            <Text style={s.policyDesc}>
              Nếu lỗi thuộc về cửa hàng, 100% giá trị suất ăn và tiền đặt cọc sẽ được hoàn về ví trong vòng 2 – 24 giờ.
            </Text>
          </View>

          <Pressable style={s.actionBtn} onPress={() => onBack()}>
            <Text style={s.actionBtnText}>Tôi hiểu và Đồng ý chính sách</Text>
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
  sub: { fontSize: fontSizes.bodyMedium, color: colors.muted, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  policyCard: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, marginBottom: 12 },
  policyHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  policyHeadTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink },
  policyDesc: { fontSize: fontSizes.caption, color: "#374151", lineHeight: 18 },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  actionBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

