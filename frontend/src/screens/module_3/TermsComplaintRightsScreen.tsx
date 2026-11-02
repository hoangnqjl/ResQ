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

export default function TermsComplaintRightsScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Điều khoản & Quyền lợi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 39</Text>
          <Text style={s.title}>Minh bạch - Công bằng - Bảo vệ quyền lợi</Text>
          <Text style={s.sub}>Quy định áp dụng cho {food?.name ?? "món ăn này"} và mọi đơn hàng trên ResQ</Text>

          <View style={s.sectionBox}>
            <Text style={s.sectionHeader}>Quyền lợi của người mua:</Text>
            <View style={s.bullet}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={s.bulletText}>
                Nhận hoàn tiền 100% nếu món ăn không đúng mô tả, ôi thiu hoặc không đảm bảo an toàn.
              </Text>
            </View>
            <View style={s.bullet}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={s.bulletText}>
                Được hỗ trợ xử lý khiếu nại nhanh trong vòng 24 giờ kể từ khi nhận món.
              </Text>
            </View>
            <View style={s.bullet}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={s.bulletText}>
                Bảo mật hoàn toàn thông tin cá nhân và dữ liệu giao dịch.
              </Text>
            </View>
          </View>

          <View style={s.sectionBox}>
            <Text style={s.sectionHeader}>Điều khoản áp dụng:</Text>
            <View style={s.bullet}>
              <Ionicons name="information-circle" size={18} color={colors.muted} />
              <Text style={s.bulletText}>
                Áp dụng cho tất cả các đơn hàng giải cứu thực phẩm trên ứng dụng ResQ.
              </Text>
            </View>
            <View style={s.bullet}>
              <Ionicons name="information-circle" size={18} color={colors.muted} />
              <Text style={s.bulletText}>
                Khi khiếu nại, bạn cần cung cấp ảnh chụp tem mác thực tế và hiện trạng món ăn.
              </Text>
            </View>
          </View>

          <Pressable onPress={() => onNavigate("complaintRefundPolicy")} style={[s.sectionBox, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
            <Text style={s.sectionHeader}>Chi tiết hạn khiếu nại & chính sách hoàn tiền</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </Pressable>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("confirmSpotReservation")}>
            <Text style={s.nextBtnText}>Đã hiểu & Tiếp tục Giữ chỗ (Module 4)</Text>
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
  sub: { fontSize: fontSizes.bodyMedium, color: colors.muted, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  sectionBox: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, marginBottom: 14 },
  sectionHeader: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 10 },
  bullet: { flexDirection: "row", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  bulletText: { fontSize: fontSizes.bodyMedium, color: "#374151", flex: 1, lineHeight: 20 },
  nextBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  nextBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

