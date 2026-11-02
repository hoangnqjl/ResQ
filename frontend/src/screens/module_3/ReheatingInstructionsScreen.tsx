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

export default function ReheatingInstructionsScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Yêu cầu hâm nóng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 34</Text>
          <Text style={s.title}>Hướng dẫn hâm nóng an toàn</Text>
          <Text style={s.sub}>{food?.name ? `Hướng dẫn dành cho ${food.name}` : "Đảm bảo chất lượng trước khi dùng"}</Text>

          <View style={s.methodBox}>
            <View style={s.methodHeader}>
              <Ionicons name="radio-outline" size={24} color={colors.primary} />
              <Text style={s.methodName}>Lò vi sóng (Microwave)</Text>
            </View>
            <Text style={s.methodDetail}>{food?.reheating_instructions ?? "Không có yêu cầu hâm nóng được cung cấp. Kiểm tra nhãn thực tế trước khi làm nóng."}</Text>
          </View>

          <View style={s.methodBox}>
            <View style={s.methodHeader}>
              <Ionicons name="flame-outline" size={24} color={colors.orange} />
              <Text style={s.methodName}>Bếp gas / Bếp từ</Text>
            </View>
            <Text style={s.methodDetail}>
              • Thời gian: 5 – 7 phút trên lửa nhỏ.{"\n"}
              • Thao tác: Cho vào nồi nhỏ, đảo đều tay đến khi bốc khói nóng đều.
            </Text>
          </View>

          <View style={s.warningBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#b45309" />
            <Text style={s.warningText}>
              Tránh đun nấu nhiều lần. Chỉ hâm nóng vừa đủ lượng ăn trong một bữa.
            </Text>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("expirationWarning")}>
            <Text style={s.nextBtnText}>Xem cảnh báo thời gian dùng (Screen 36)</Text>
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
  methodBox: { backgroundColor: colors.pale2, borderRadius: 12, padding: 14, marginBottom: 12 },
  methodHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  methodName: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink },
  methodDetail: { fontSize: fontSizes.bodyMedium, color: "#374151", lineHeight: 22 },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginVertical: 14,
  },
  warningText: { fontSize: fontSizes.caption, color: "#92400e", lineHeight: 18, flex: 1 },
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

