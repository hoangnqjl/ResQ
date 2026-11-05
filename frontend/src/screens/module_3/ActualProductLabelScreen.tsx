import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";
import { formatSafetyDate } from "./foodSafetyFormat";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onNavigate: (route: string) => void;
};

export default function ActualProductLabelScreen({ food, onBack, onNavigate }: Props) {
  const [enlarged, setEnlarged] = useState(false);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Actual Product Label</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.badge}>US - C1 - 31</Text>
          <Text style={s.title}>Store Product Label Photo</Text>
          <Text style={s.sub}>Verify manufacturing and expiration dates on package label</Text>

          <Pressable style={[s.imageFrame, enlarged && s.imageFrameEnlarged]} onPress={() => setEnlarged(!enlarged)}>
            <FallbackPhoto
              uri={imageUrl(food?.label_image_url) || imageUrl(food?.image_url)}
              fallback={foodPhoto(food?.name ?? "chicken rice")}
              style={s.image}
            />
            <View style={s.labelOverlay}>
              <Text style={s.labelOverlayText}>MFG: {formatSafetyDate(food?.manufacturing_date)}</Text>
              <Text style={s.labelOverlayText}>EXP: {formatSafetyDate(food?.recommended_expiry)}</Text>
            </View>
            <View style={s.zoomBtn}>
              <Ionicons name={enlarged ? "contract" : "expand"} size={18} color={colors.white} />
            </View>
          </Pressable>

          <View style={s.infoBox}>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Store:</Text>
              <Text style={s.infoVal}>{food?.shop_name ?? "Seller has not provided a shop name"}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Packaging:</Text>
              <Text style={s.infoVal}>Aseptic sealed food box</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Label Status:</Text>
              <Text style={s.infoValHighlight}>Intact</Text>
            </View>
          </View>

          <Pressable style={s.nextBtn} onPress={() => onNavigate("storageInstructions")}>
            <Text style={s.nextBtnText}>View Storage Instructions</Text>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
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
  imageFrame: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    position: "relative",
  },
  imageFrameEnlarged: { height: 320 },
  image: { width: "100%", height: "100%" },
  labelOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  labelOverlayText: { color: colors.white, fontSize: fontSizes.caption, fontWeight: "700" },
  zoomBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  infoBox: {
    backgroundColor: colors.pale2,
    borderRadius: 12,
    padding: 14,
    marginVertical: 18,
    gap: 8,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoKey: { fontSize: fontSizes.bodyMedium, color: colors.muted },
  infoVal: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  infoValHighlight: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.primary },
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

