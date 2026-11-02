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

export default function StorageInstructionsScreen({ food, onBack, onNavigate }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Hướng dẫn bảo quản</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 33</Text>
          <Text style={s.title}>Quy định lưu trữ thực phẩm</Text>
          <Text style={s.sub}>Vui lòng xem thông tin bên dưới hoặc trên bao bì món ăn</Text>

          <View style={s.guideList}>
            <View style={s.guideItem}>
              <View style={s.iconWrap}>
                <Ionicons name="snow-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                  <Text style={s.guideTitle}>{food?.storage_type === "freezer" ? "Yêu cầu bảo quản đông lạnh" : food?.storage_type === "room_temperature" ? "Bảo quản ở nhiệt độ phòng" : "Yêu cầu bảo quản lạnh"}</Text>
                <Text style={s.guideDesc}>
                  {food?.storage_instructions ?? food?.refrigeration_requirement ?? "Follow the storage details shown on the actual package label."}
                </Text>
              </View>
            </View>

            <View style={s.guideItem}>
              <View style={s.iconWrap}>
                <Ionicons name="flame-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.guideTitle}>Cần hâm nóng trước khi ăn</Text>
                  <Text style={s.guideDesc}>{food?.reheating_instructions ?? "No reheating instructions have been provided for this meal."}</Text>
              </View>
            </View>

            <View style={s.guideItem}>
              <View style={s.iconWrap}>
                <Ionicons name="hourglass-outline" size={22} color={colors.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.guideTitle}>Dùng ngay trong vòng 2 giờ</Text>
                <Text style={s.guideDesc}>
                  Nếu ở nhiệt độ phòng, nên thưởng thức trong vòng 2 tiếng kể từ lúc nhận.
                </Text>
              </View>
            </View>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("refrigerationRequirement")}>
            <Text style={s.nextBtnText}>Xem yêu cầu tủ lạnh/tủ đông (Screen 35)</Text>
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
  guideList: { gap: 14, marginBottom: 20 },
  guideItem: {
    flexDirection: "row",
    backgroundColor: colors.pale2,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  guideTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink },
  guideDesc: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 4, lineHeight: 18 },
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

