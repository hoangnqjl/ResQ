import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";
import type { Food } from "../module_2/HomeScreen";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";
import { formatSafetyDate } from "./foodSafetyFormat";
import { colors, fontSizes } from "../../theme";

type Props = {
  food: Food;
  safety?: FoodSafetyDetail | null;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function FoodProductDetailScreen({ food, safety, onBack, onNavigate }: Props) {
  const expiration = formatSafetyDate(safety?.recommended_expiry ?? food.expires_at);
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.iconButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={21} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Detail Food</Text>
        <Pressable onPress={() => onNavigate("foodOriginInfo")} style={s.iconButton} accessibilityLabel="More information">
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => onNavigate("foodOriginInfo")} style={s.originRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.muted} />
          <Text style={s.originText}>Food Origin Information</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
        <FallbackPhoto uri={imageUrl(food.image_url)} fallback={foodPhoto(food.name)} style={s.hero} />
        <View style={s.foodHeading}>
          <Text style={s.foodName}>{food.name}</Text>
          <Text style={s.rating}>{Number(food.reputation_score ?? 4.8).toFixed(1)} ★</Text>
        </View>
        <View style={s.metaRow}>
          <View style={s.metaItem}><Ionicons name="location-outline" size={14} color={colors.muted} /><Text style={s.metaText}>{food.address || "District 1 · 1.2 km"}</Text></View>
          <Pressable onPress={() => onNavigate("shopDetail")} style={s.metaItem}><Ionicons name="home-outline" size={14} color={colors.muted} /><Text numberOfLines={1} style={s.metaText}>{food.shop_name}</Text><Ionicons name="chevron-forward" size={12} color={colors.muted} /></Pressable>
        </View>
        <View style={s.availability}><Text style={s.availabilityText}>{Number(food.quantity_available) > 0 ? "Available" : "Sold out"}</Text></View>
        <View style={s.rule} />
        <Text style={s.sectionTitle}>Dish Description</Text>
        <Text style={s.description}>{food.description || "Freshly prepared by the shop. See the food safety information below for storage and expiry details."}</Text>
        <View style={s.rule} />
        <Text style={s.sectionTitle}>Food Safety Information</Text>
        <View style={s.safetyRow}>
          <Pressable onPress={() => onNavigate("expirationInfo")} style={s.safetyCard}>
            <View style={s.safetyTitle}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><Text style={s.safetyLabel}>Expiration Date</Text></View>
            <View style={s.safetyValue}><Text style={s.safetyValueText}>{expiration}</Text><Ionicons name="chevron-forward" size={17} color={colors.ink} /></View>
          </Pressable>
          <Pressable onPress={() => onNavigate("actualProductLabel")} style={s.safetyCard}>
            <View style={s.safetyTitle}><Ionicons name="mail-outline" size={20} color={colors.primary} /><Text style={s.safetyLabel}>Actual Product Label</Text></View>
            <View style={s.safetyValue}><Text style={s.safetyValueText}>{expiration}</Text><Ionicons name="chevron-forward" size={17} color={colors.ink} /></View>
          </Pressable>
        </View>
        <Pressable onPress={() => onNavigate("storageInstructions")} style={s.storageLink}>
          <Text style={s.storageText}>Storage information</Text><Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      </ScrollView>
      <View style={s.footer}>
        <Pressable disabled={Number(food.quantity_available) <= 0} onPress={() => onNavigate("confirmOrderDetails")} style={[s.orderButton, Number(food.quantity_available) <= 0 && s.disabled]}>
          <Text style={s.orderText}>Order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 },
  iconButton: { width: 42, height: 42, borderRadius: 22, borderWidth: 1, borderColor: colors.pale, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  originRow: { height: 38, flexDirection: "row", alignItems: "center", gap: 8 },
  originText: { flex: 1, color: colors.ink, fontSize: fontSizes.caption, fontWeight: "600" },
  hero: { width: "100%", height: 174, borderRadius: 18, marginTop: 8, backgroundColor: colors.pale },
  foodHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  foodName: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "700", flex: 1 },
  rating: { color: colors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "700" },
  metaRow: { minHeight: 31, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 5 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  metaText: { color: colors.muted, fontSize: fontSizes.mini },
  availability: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 3 },
  availabilityText: { color: colors.white, fontSize: 8, fontWeight: "700" },
  rule: { height: 1, backgroundColor: colors.line, marginVertical: 12 },
  sectionTitle: { color: colors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "700", marginBottom: 5 },
  description: { color: colors.muted, fontSize: fontSizes.caption, lineHeight: 20 },
  safetyRow: { flexDirection: "row", gap: 10, marginTop: 11 },
  safetyCard: { flex: 1, minHeight: 62, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 9, paddingVertical: 7, justifyContent: "space-between" },
  safetyTitle: { flexDirection: "row", alignItems: "center", gap: 5 },
  safetyLabel: { color: colors.primary, fontSize: 9, fontWeight: "600", flexShrink: 1 },
  safetyValue: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  safetyValueText: { color: colors.ink, fontSize: 9 },
  storageLink: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8 },
  storageText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  footer: { paddingHorizontal: 20, paddingTop: 7, paddingBottom: 12, backgroundColor: colors.white },
  orderButton: { height: 44, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.45 },
  orderText: { color: colors.white, fontSize: fontSizes.caption, fontWeight: "800" },
});
