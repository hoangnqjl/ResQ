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

export default function SellerCommitmentScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Cam kết của người bán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 38</Text>
          <Text style={s.title}>Tiêu chuẩn dịch vụ & An toàn</Text>
          <Text style={s.sub}>{food?.shop_name ?? "Người bán"} cam kết thực hiện các nguyên tắc sau:</Text>

          <View style={s.commitmentList}>
            {[
              {
                icon: "leaf-outline",
                title: "1. Nguyên liệu tươi sạch",
                desc: food?.seller_commitments?.[0] ?? "Dùng nguyên liệu có nguồn gốc rõ ràng.",
              },
              {
                icon: "shield-checkmark-outline",
                title: "2. Chế biến chuẩn vệ sinh",
                desc: food?.seller_commitments?.[1] ?? "Tuân thủ quy trình an toàn thực phẩm.",
              },
              {
                icon: "snow-outline",
                title: "3. Bảo quản đúng kỹ thuật",
                desc: food?.seller_commitments?.[2] ?? "Duy trì điều kiện bảo quản ghi trên nhãn.",
              },
              {
                icon: "time-outline",
                title: "4. Bàn giao đúng hẹn",
                desc: food?.seller_commitments?.[3] ?? "Chuẩn bị phần ăn trong khung giờ nhận.",
              },
              {
                icon: "heart-outline",
                title: "5. Tận tâm hỗ trợ khách hàng",
                desc: food?.seller_commitments?.[4] ?? "Xử lý vấn đề chất lượng trong thời hạn áp dụng.",
              },
            ].map((item, idx) => (
              <View key={idx} style={s.item}>
                <View style={s.iconWrap}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{item.title}</Text>
                  <Text style={s.itemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("termsComplaintRights")}>
            <Text style={s.nextBtnText}>Xem điều khoản & quyền lợi (Screen 39)</Text>
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
  commitmentList: { gap: 14, marginBottom: 20 },
  item: {
    flexDirection: "row",
    backgroundColor: colors.pale2,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink },
  itemDesc: { fontSize: fontSizes.caption, color: "#4b5563", marginTop: 2, lineHeight: 18 },
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

