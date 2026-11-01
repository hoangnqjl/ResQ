import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCommunityFoods, type CommunityFood } from "../services/communityApi";
import { communityColors } from "../components/CommunityLayout";
import { fontSizes } from "../theme";
import { heatmapMapPhoto } from "../data/designPhotos";

type Props = { onBack: () => void; onOpenMap: () => void };
type Hotspot = { area: string; meals: number; shops: number; foods: CommunityFood[] };

function areaName(address: string) {
  const sections = address.split(",").map((part) => part.trim()).filter(Boolean);
  return sections.length > 1 ? sections.slice(-2).join(", ") : sections[0] ?? "Nearby area";
}

export default function RescueHotspotsScreen({ onBack, onOpenMap }: Props) {
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => { if (active) setFoods(items); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load food hotspots."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const hotspots = useMemo(() => {
    const groups = new Map<string, CommunityFood[]>();
    for (const food of foods) {
      const area = areaName(food.address);
      const group = groups.get(area) ?? [];
      group.push(food);
      groups.set(area, group);
    }
    return [...groups.entries()].map(([area, items]) => ({
      area,
      shops: new Set(items.map((item) => item.shop_id)).size,
      meals: items.reduce((sum, item) => sum + Number(item.quantity_available), 0),
      foods: items,
    })).sort((a, b) => b.meals - a.meals);
  }, [foods]);

  const activeStations = new Set(foods.map((food) => food.shop_id)).size;
  const totalMeals = foods.reduce((sum, food) => sum + Number(food.quantity_available), 0);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.roundButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={21} color={communityColors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Rescue Hotspots</Text>
        <Pressable onPress={onOpenMap} style={styles.roundButton} accessibilityLabel="Map filters">
          <Ionicons name="options-outline" size={21} color={communityColors.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapPreview}>
          <ImageBackground source={heatmapMapPhoto} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={styles.stationBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.stationText}>{loading ? "Loading active stations…" : `${activeStations} Active Stations Now`}</Text>
          </View>
          {!loading && hotspots.slice(0, 5).map((spot, index) => (
            <View key={spot.area} style={[styles.mapPin, { left: `${18 + index * 16}%`, top: `${38 + (index % 2) * 29}%` }]}>
              <View style={styles.mapPinDot} />
            </View>
          ))}
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Surplus Food Density</Text>
          <Text style={styles.sectionMeta}>By pickup area</Text>
        </View>
        {loading ? (
          <ActivityIndicator style={styles.loading} color={communityColors.green} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : hotspots.length ? (
          hotspots.slice(0, 6).map((spot, index) => {
            const percent = totalMeals ? (spot.meals / totalMeals) * 100 : 0;
            return (
              <View key={spot.area} style={styles.hotspotCard}>
                <View style={styles.hotspotTitleRow}>
                  <Text numberOfLines={1} style={styles.hotspotTitle}>{index + 1}. {spot.area}</Text>
                  <Text style={styles.mealCount}>{spot.meals} meals</Text>
                </View>
                <Text style={styles.hotspotMeta}>{spot.shops} shops posting · Active pickup listings</Text>
                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active rescue hotspots</Text>
            <Text style={styles.emptyText}>Shops with available food will appear here.</Text>
          </View>
        )}
      </ScrollView>
      <Pressable onPress={onOpenMap} style={styles.openButton}>
        <Text style={styles.openButtonText}>Open Live Heatmap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 },
  roundButton: { width: 43, height: 43, borderRadius: 23, borderWidth: 1.3, borderColor: communityColors.line, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: communityColors.ink, fontSize: fontSizes.subtitle, fontWeight: "800" },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 102 },
  mapPreview: { height: 206, borderRadius: 24, overflow: "hidden", backgroundColor: communityColors.pale, borderWidth: 1, borderColor: communityColors.line },
  stationBadge: { position: "absolute", top: 16, left: 15, minHeight: 42, borderRadius: 25, paddingHorizontal: 16, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", gap: 9 },
  orangeDot: { width: 12, height: 12, borderRadius: 7, backgroundColor: "#df7c29" },
  stationText: { color: "#d77828", fontSize: fontSizes.bodySmall, fontWeight: "800" },
  mapPin: { position: "absolute", width: 19, height: 19, borderRadius: 10, backgroundColor: "#fff", borderWidth: 2, borderColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  mapPinDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: communityColors.green },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 11 },
  sectionTitle: { color: communityColors.ink, fontSize: fontSizes.subtitleSmall, fontWeight: "800" },
  sectionMeta: { color: communityColors.muted, fontSize: fontSizes.bodySmall },
  loading: { marginTop: 32 },
  errorText: { color: "#a23930", fontSize: fontSizes.bodySmall, textAlign: "center", paddingVertical: 20 },
  hotspotCard: { minHeight: 87, borderRadius: 23, borderWidth: 1.2, borderColor: communityColors.line, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 13 },
  hotspotTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  hotspotTitle: { flex: 1, color: communityColors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "800" },
  mealCount: { color: communityColors.ink, fontSize: fontSizes.bodySmall, fontWeight: "800" },
  hotspotMeta: { color: communityColors.muted, fontSize: fontSizes.caption, marginTop: 5 },
  progressTrack: { height: 8, borderRadius: 5, backgroundColor: "#e5ece5", marginTop: 11, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: communityColors.green },
  emptyCard: { borderWidth: 1, borderColor: communityColors.line, borderRadius: 20, padding: 22, alignItems: "center" },
  emptyTitle: { color: communityColors.ink, fontSize: fontSizes.body, fontWeight: "800" },
  emptyText: { color: communityColors.muted, fontSize: fontSizes.bodySmall, marginTop: 6, textAlign: "center" },
  openButton: { position: "absolute", bottom: 12, left: 18, right: 18, height: 62, borderRadius: 34, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  openButtonText: { color: "#fff", fontSize: fontSizes.bodyLarge, fontWeight: "800" },
});
