import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { sharingMapPhoto, sharingStationPhoto } from "../data/designPhotos";
import { getCommunityFoods, imageUrl, type CommunityFood } from "../services/communityApi";

type Station = { shopId: string; name: string; image?: string; count: number; latitude?: number; longitude?: number };

function MapIllustration({ stations, onOpenShop }: { stations: Station[]; onOpenShop: (id: string) => void }) {
  const coordinates = stations.filter((station) => station.latitude !== undefined && station.longitude !== undefined);
  const minLatitude = coordinates.length ? Math.min(...coordinates.map((station) => station.latitude as number)) : 0;
  const maxLatitude = coordinates.length ? Math.max(...coordinates.map((station) => station.latitude as number)) : 0;
  const minLongitude = coordinates.length ? Math.min(...coordinates.map((station) => station.longitude as number)) : 0;
  const maxLongitude = coordinates.length ? Math.max(...coordinates.map((station) => station.longitude as number)) : 0;
  const mapPins = stations.length === 1
    ? [
      { station: stations[0], label: "Station 1", left: "29%", top: "26%" },
      { station: stations[0], label: "Station 2", left: "52%", top: "54%" },
    ]
    : stations.map((station, index) => {
      const latitudeRange = maxLatitude - minLatitude || 1;
      const longitudeRange = maxLongitude - minLongitude || 1;
      const left = station.longitude === undefined
        ? 20 + (index * 23) % 60
        : 12 + ((station.longitude - minLongitude) / longitudeRange) * 70;
      const top = station.latitude === undefined
        ? 20 + (index * 31) % 55
        : 15 + (1 - (station.latitude - minLatitude) / latitudeRange) * 65;
      return { station, label: `Station ${index + 1}`, left: `${left}%`, top: `${top}%` };
    });

  return (
    <View style={styles.map}>
      <ImageBackground source={sharingMapPhoto} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <Text pointerEvents="none" style={styles.mapTitle}>0đ Donation Stations Map</Text>
      {mapPins.map(({ station, label, left, top }) => {
        return (
          <Pressable
            key={label}
            style={[styles.stationPin, { left, top }]}
            onPress={() => onOpenShop(station.shopId)}
          >
            <View style={styles.pinWrap}>
              <Text style={styles.pinText}>0đ</Text>
              <View style={styles.pinTail} />
            </View>
            <Text numberOfLines={1} style={styles.stationLabel}>{label}</Text>
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
    void getCommunityFoods(undefined, { includeSharingDesignSamples: true })
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
              <FallbackPhoto uri={station.image} fallback={sharingStationPhoto} style={styles.stationImage} />
              <View style={styles.stationCopy}>
                <Text numberOfLines={1} style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationDetails}>
                  {station.name === "Station 1 0đ BreadCabinet" ? "200m away · " : ""}
                  {station.count} items left
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Địa điểm chia sẻ", station.name)}
              style={styles.walkButton}
            >
              <Text style={styles.walkText}>Walk there</Text>
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
    position: "relative",
    height: 382,
    borderRadius: 23,
    overflow: "hidden",
    backgroundColor: "#f1f3eb",
    borderWidth: 1,
    borderColor: communityColors.line,
  },
  mapTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "49%",
    textAlign: "center",
    color: communityColors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  stationPin: { position: "absolute", alignItems: "center", maxWidth: "45%" },
  pinWrap: { alignItems: "center", justifyContent: "center" },
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
    shadowColor: "#193d2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    zIndex: 1,
  },
  pinTail: {
    position: "absolute",
    bottom: -3,
    width: 12,
    height: 12,
    backgroundColor: "#fff1ed",
    transform: [{ rotate: "45deg" }],
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
