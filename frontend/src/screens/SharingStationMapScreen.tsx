import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { getCommunityFoods, imageUrl, type CommunityFood } from "../services/communityApi";

const buildings: Array<Record<string, string>> = [
  { left: "5%", top: "11%", width: "19%", height: "11%" },
  { left: "30%", top: "5%", width: "20%", height: "12%" },
  { left: "62%", top: "10%", width: "20%", height: "12%" },
  { left: "12%", top: "35%", width: "18%", height: "12%" },
  { left: "39%", top: "32%", width: "18%", height: "10%" },
  { left: "70%", top: "38%", width: "19%", height: "12%" },
  { left: "4%", top: "66%", width: "20%", height: "11%" },
  { left: "34%", top: "71%", width: "18%", height: "12%" },
  { left: "66%", top: "72%", width: "21%", height: "12%" },
];

type Station = { shopId: string; name: string; image?: string; count: number; latitude?: number; longitude?: number };

function MapIllustration({ stations, onOpenShop }: { stations: Station[]; onOpenShop: (id: string) => void }) {
  const coordinates = stations.filter((station) => station.latitude !== undefined && station.longitude !== undefined);
  const minLatitude = Math.min(...coordinates.map((station) => station.latitude as number));
  const maxLatitude = Math.max(...coordinates.map((station) => station.latitude as number));
  const minLongitude = Math.min(...coordinates.map((station) => station.longitude as number));
  const maxLongitude = Math.max(...coordinates.map((station) => station.longitude as number));

  return (
    <View style={styles.map}>
      <View style={styles.parkA} />
      <View style={styles.parkB} />
      <View style={styles.waterway} />
      {buildings.map((building, index) => (
        <View key={index} style={[styles.building, building]} />
      ))}
      <View style={[styles.road, styles.roadA]} />
      <View style={[styles.road, styles.roadB]} />
      <View style={[styles.road, styles.roadC]} />
      <View style={[styles.road, styles.roadD]} />
      <View style={[styles.road, styles.roadE]} />
      <View style={[styles.road, styles.roadF]} />
      <View style={[styles.road, styles.roadG]} />
      <View style={[styles.road, styles.roadH]} />
      {[
        ["12%", "26%"], ["16%", "29%"], ["20%", "26%"], ["77%", "56%"],
        ["82%", "58%"], ["75%", "61%"], ["25%", "78%"], ["29%", "81%"],
      ].map(([left, top], index) => (
        <View key={index} style={[styles.tree, { left, top }]} />
      ))}
      <Text style={styles.mapTitle}>0đ Donation Stations Map</Text>
      {stations.map((station, index) => {
        const latitudeRange = maxLatitude - minLatitude || 1;
        const longitudeRange = maxLongitude - minLongitude || 1;
        const left = station.longitude === undefined
          ? 20 + (index * 23) % 60
          : 12 + ((station.longitude - minLongitude) / longitudeRange) * 70;
        const top = station.latitude === undefined
          ? 20 + (index * 31) % 55
          : 15 + (1 - (station.latitude - minLatitude) / latitudeRange) * 65;
        return (
          <Pressable
            key={station.shopId}
            style={[styles.stationPin, { left: `${left}%`, top: `${top}%` }]}
            onPress={() => onOpenShop(station.shopId)}
          >
            <Text style={styles.pinText}>0đ</Text>
            <Text numberOfLines={1} style={styles.stationLabel}>{station.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SharingStationMapScreen({
  onBack,
  onOpenShop,
}: {
  onBack: () => void;
  onOpenShop: (id: string) => void;
}) {
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => {
        if (active) setFoods(items.filter((item) => Number(item.current_price) === 0));
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load stations."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const stations = useMemo(() => {
    const groups = new Map<string, CommunityFood[]>();
    for (const food of foods) {
      const current = groups.get(food.shop_id) ?? [];
      current.push(food);
      groups.set(food.shop_id, current);
    }
    return [...groups.entries()].map(([shopId, items]) => ({
      shopId,
      name: items[0].shop_name,
      image: imageUrl(items.find((item) => item.image_url)?.image_url),
      count: items.reduce((total, item) => total + item.quantity_available, 0),
      latitude: items[0].latitude == null ? undefined : Number(items[0].latitude),
      longitude: items[0].longitude == null ? undefined : Number(items[0].longitude),
    }));
  }, [foods]);

  return (
    <View style={styles.root}>
      <CommunityHeader title="0đ Sharing Station Map" onBack={onBack} onMore={() => {}} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Community bread &amp; meal stations · 100% Free</Text>
        </View>
        <MapIllustration stations={stations} onOpenShop={onOpenShop} />
        {loading ? <ActivityIndicator style={styles.state} color={communityColors.green} /> : error ? (
          <Text style={styles.stateText}>{error}</Text>
        ) : stations.length ? stations.map((station) => (
          <View key={station.shopId} style={styles.stationCard}>
            <Pressable onPress={() => onOpenShop(station.shopId)} style={styles.stationMain}>
              {station.image ? <Image source={{ uri: station.image }} style={styles.stationImage} resizeMode="cover" /> : <View style={styles.stationImage} />}
              <View style={styles.stationCopy}>
                <Text numberOfLines={1} style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationDetails}>{station.count} items left</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Địa điểm chia sẻ", station.name)}
              style={styles.walkButton}
            >
              <Text style={styles.walkText}>Xem shop</Text>
            </Pressable>
          </View>
        )) : <Text style={styles.stateText}>Chưa có điểm chia sẻ 0đ nào được đăng.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: communityColors.white },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 26 },
  banner: {
    minHeight: 54,
    borderRadius: 30,
    backgroundColor: communityColors.green,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bannerText: { color: communityColors.white, fontSize: 12, fontWeight: "700" },
  map: {
    height: 382,
    borderRadius: 23,
    overflow: "hidden",
    backgroundColor: "#f1f3eb",
    borderWidth: 1,
    borderColor: communityColors.line,
  },
  parkA: {
    position: "absolute",
    width: "34%",
    height: "31%",
    left: "-9%",
    top: "-7%",
    borderRadius: 60,
    backgroundColor: "#e1eddd",
  },
  parkB: {
    position: "absolute",
    width: "33%",
    height: "28%",
    right: "-10%",
    bottom: "-4%",
    borderRadius: 70,
    backgroundColor: "#e2eddf",
  },
  waterway: {
    position: "absolute",
    width: 35,
    height: "125%",
    right: "12%",
    top: "-10%",
    backgroundColor: "#d1e8e9",
    transform: [{ rotate: "-29deg" }],
  },
  building: {
    position: "absolute",
    borderRadius: 5,
    backgroundColor: "#e9ece5",
    borderWidth: 1,
    borderColor: "#e3e8df",
  },
  road: {
    position: "absolute",
    height: 11,
    width: "145%",
    left: "-22%",
    backgroundColor: "#ffffff",
    borderRadius: 7,
  },
  roadA: { top: "15%", transform: [{ rotate: "26deg" }] },
  roadB: { top: "31%", transform: [{ rotate: "-33deg" }] },
  roadC: { top: "47%", transform: [{ rotate: "23deg" }] },
  roadD: { top: "62%", transform: [{ rotate: "-26deg" }] },
  roadE: { top: "78%", transform: [{ rotate: "36deg" }] },
  roadF: { top: "39%", transform: [{ rotate: "90deg" }], width: "112%", left: "-6%" },
  roadG: { top: "21%", transform: [{ rotate: "90deg" }], width: "106%", left: "-3%" },
  roadH: { top: "68%", transform: [{ rotate: "90deg" }], width: "112%", left: "-6%" },
  tree: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: "#cfe2ce",
    borderWidth: 2,
    borderColor: "#e3eee0",
  },
  stationPin: { position: "absolute", alignItems: "center", maxWidth: "45%" },
  pinText: {
    width: 35,
    height: 35,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: communityColors.white,
    color: communityColors.ink,
    fontSize: 11,
    fontWeight: "800",
    elevation: 3,
  },
  stationLabel: {
    color: communityColors.white,
    backgroundColor: communityColors.green,
    overflow: "hidden",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 7,
    fontSize: 10,
    fontWeight: "700",
  },
  mapTitle: {
    position: "absolute",
    top: "48%",
    width: "100%",
    color: communityColors.ink,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
  },
  stationCard: {
    minHeight: 80,
    marginTop: 14,
    padding: 11,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  state: { marginTop: 16 },
  stateText: { color: communityColors.muted, fontSize: 12, paddingVertical: 18, textAlign: "center" },
  stationMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 9 },
  stationImage: { width: 58, height: 58, borderRadius: 11, backgroundColor: communityColors.pale },
  stationCopy: { flex: 1 },
  stationName: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  stationDetails: { color: "#41594a", fontSize: 11, marginTop: 4 },
  walkButton: {
    minHeight: 32,
    borderRadius: 18,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: communityColors.green,
  },
  walkText: { color: communityColors.white, fontSize: 11, fontWeight: "700" },
});
