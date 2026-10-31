import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { dropAlertFoodPhoto } from "../data/designPhotos";
import { getCommunityFoods, getGlobalDropAlertSettings, getSearchDropAlerts, getShopDropAlerts, imageUrl, saveGlobalDropAlertSettings, saveShopDropAlert, updateSearchDropAlert, type CommunityFood, type DropAlert, type GlobalDropAlertSettings, type SearchDropAlert } from "../services/communityApi";

type Props = { userId: string; onBack: () => void; onCreateAlert: () => void };
type ShopRow = DropAlert & { name: string; address: string; image?: string; dropWindow?: string };

const designShopRows = [
  {
    shop_id: "33333333-3333-4333-8333-333333333338",
    name: "Le Croissant Saigon",
    dropWindow: "Usual drop: 8:15 PM – 9:00 PM",
    address: "Dist 1 • 1.2 km • Pastry & Bread",
    enabled: true,
  },
  {
    shop_id: "33333333-3333-4333-8333-333333333339",
    name: "Green Bowl Healthy Deli",
    dropWindow: "Usual drop: 7:30 PM – 8:00 PM",
    address: "Dist 3 • 850m • Vegan friendly",
    enabled: true,
  },
  {
    shop_id: "33333333-3333-4333-8333-333333333340",
    name: "Tokyo Bento Box Station",
    dropWindow: "Usual drop: 9:00 PM – 9:30 PM",
    address: "Binh Thanh • 2.1 km • Cooked\nmeals",
    enabled: false,
  },
] as const;

function AlertToggle({
  value,
  disabled,
  onValueChange,
}: {
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.toggle, value && styles.toggleOn, disabled && styles.toggleDisabled]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

function timeLabel(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function DropAlertCenterScreen({ userId, onBack, onCreateAlert }: Props) {
  const [global, setGlobal] = useState<GlobalDropAlertSettings>({
    instantPush: true,
    vibrateEmergencyDrops: true,
  });
  const [alerts, setAlerts] = useState<DropAlert[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchDropAlert[]>([]);
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingShop, setSavingShop] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [settings, shopAlerts, foodItems, keywordAlerts] = await Promise.all([
        getGlobalDropAlertSettings(userId),
        getShopDropAlerts(userId),
        getCommunityFoods(),
        getSearchDropAlerts(userId),
      ]);
      setGlobal(settings);
      setAlerts(shopAlerts);
      setSearchAlerts(keywordAlerts.items);
      setFoods(foodItems);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải cảnh báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [userId]);

  const shopRows: ShopRow[] = useMemo(() => {
    const designRows = designShopRows.map((sample) => {
      const savedAlert = alerts.find((alert) => alert.shop_id === sample.shop_id);
      return {
        id: savedAlert?.id ?? `design-${sample.shop_id}`,
        user_id: userId,
        shop_id: sample.shop_id,
        enabled: savedAlert?.enabled ?? sample.enabled,
        name: sample.name,
        address: sample.address,
        image: undefined,
        dropWindow: sample.dropWindow,
      };
    });
    const itemsByShop = new Map<string, CommunityFood[]>();
    for (const food of foods) {
      const current = itemsByShop.get(food.shop_id) ?? [];
      current.push(food);
      itemsByShop.set(food.shop_id, current);
    }
    const subscribedRows = alerts.flatMap((alert) => {
      if (designShopRows.some((sample) => sample.shop_id === alert.shop_id)) return [];
      const shopItems = itemsByShop.get(alert.shop_id ?? "") ?? [];
      const sample = shopItems[0];
      if (!alert.shop_id || !alert.name) return [];
      const start = timeLabel(sample?.pickup_starts_at);
      const end = timeLabel(sample?.pickup_ends_at);
      return [{
        ...alert,
        name: alert.name,
        address: alert.address ?? "",
        image: imageUrl(sample?.image_url),
        dropWindow: start && end ? `Usual drop: ${start} – ${end}` : alert.address ?? "Shop drop alert",
      }];
    });
    return [...designRows, ...subscribedRows];
  }, [alerts, foods, userId]);

  const updateGlobal = async (key: keyof GlobalDropAlertSettings, value: boolean) => {
    const next = { ...global, [key]: value };
    setSavingGlobal(true);
    try {
      await saveGlobalDropAlertSettings(userId, next);
      setGlobal(next);
    } catch (reason) {
      Alert.alert("Không thể lưu cài đặt", reason instanceof Error ? reason.message : "Vui lòng thử lại.");
    } finally {
      setSavingGlobal(false);
    }
  };

  const updateShop = async (shopId: string, enabled: boolean) => {
    setSavingShop(shopId);
    try {
      await saveShopDropAlert(userId, shopId, enabled);
      await load();
    } catch (reason) {
      Alert.alert("Không thể lưu Drop-alert", reason instanceof Error ? reason.message : "Vui lòng thử lại.");
    } finally {
      setSavingShop(null);
    }
  };

  const updateSearchAlert = async (alertId: string, enabled: boolean) => {
    setSavingShop(alertId);
    try {
      await updateSearchDropAlert(userId, alertId, enabled);
      setSearchAlerts((current) => current.map((alert) => alert.id === alertId ? { ...alert, enabled } : alert));
    } catch (reason) {
      Alert.alert("Search Drop-alert", reason instanceof Error ? reason.message : "Could not update this alert.");
    } finally {
      setSavingShop(null);
    }
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Drop Alert Center" onBack={onBack} onMore={() => {}} />
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.globalCard}>
            <Text style={styles.globalEyebrow}>GLOBAL NOTIFICATIONS</Text>
            <View style={styles.globalRow}>
              <View style={styles.globalCopy}>
                <Text style={styles.globalTitle}>Instant Push Alerts</Text>
                <Text style={styles.globalDescription}>Notify within 10s of food listing</Text>
              </View>
              <AlertToggle
                disabled={savingGlobal}
                value={global.instantPush}
                onValueChange={(value) => void updateGlobal("instantPush", value)}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.globalRow}>
              <Text style={[styles.globalTitle, styles.vibrateTitle]}>Vibrate on 0đ Emergency Drops</Text>
              <AlertToggle
                disabled={savingGlobal}
                value={global.vibrateEmergencyDrops}
                onValueChange={(value) => void updateGlobal("vibrateEmergencyDrops", value)}
              />
            </View>
          </View>

          {searchAlerts.length > 0 ? (
            <>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Search Alerts</Text>
                <Text style={styles.activeCount}>{searchAlerts.filter((alert) => Boolean(alert.enabled)).length} active</Text>
              </View>
              {searchAlerts.map((alert) => (
                <View key={alert.id} style={styles.keywordCard}>
                  <View style={styles.keywordIcon}>
                    <Ionicons name="search-outline" size={19} color={communityColors.green} />
                  </View>
                  <View style={styles.shopCopy}>
                    <Text numberOfLines={1} style={styles.shopName}>{alert.keyword}</Text>
                    <Text style={styles.shopSub}>Within {Number(alert.radius_km).toFixed(1)} km</Text>
                  </View>
                  <AlertToggle
                    disabled={savingShop === alert.id}
                    value={Boolean(alert.enabled)}
                    onValueChange={(value) => void updateSearchAlert(alert.id, value)}
                  />
                </View>
              ))}
            </>
          ) : null}

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Subscribed Shops</Text>
            <Text style={styles.activeCount}>{shopRows.filter((shop) => Boolean(shop.enabled)).length} active</Text>
          </View>
          {shopRows.map((shop) => (
            <View key={shop.id} style={styles.shopCard}>
              <FallbackPhoto uri={shop.image} fallback={dropAlertFoodPhoto} style={styles.shopImage} />
              <View style={styles.shopCopy}>
                <Text numberOfLines={1} style={styles.shopName}>{shop.name}</Text>
                <Text numberOfLines={1} style={styles.shopSub}>{shop.dropWindow}</Text>
                <Text numberOfLines={2} style={styles.shopMeta}>{shop.address}</Text>
              </View>
              <AlertToggle
                disabled={savingShop === shop.shop_id}
                value={Boolean(shop.enabled)}
                onValueChange={(value) => void updateShop(shop.shop_id ?? "", value)}
              />
            </View>
          ))}
          {!shopRows.length && <Text style={styles.emptyText}>Chưa đăng ký cảnh báo cửa hàng nào.</Text>}
          <Pressable onPress={onCreateAlert} style={styles.addButton}>
            <Text style={styles.addText}>+ Add New Alert</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ffffff" },
  content: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 22 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  globalCard: {
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 10,
  },
  globalEyebrow: { color: communityColors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.6, marginBottom: 9 },
  globalRow: { minHeight: 61, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 9 },
  globalCopy: { flex: 1, gap: 5 },
  globalTitle: { color: communityColors.ink, fontSize: 14, fontWeight: "800" },
  globalDescription: { color: communityColors.muted, fontSize: 13 },
  vibrateTitle: { flex: 1 },
  divider: { height: 1, backgroundColor: "#e7eee7" },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 11,
    paddingHorizontal: 2,
  },
  sectionTitle: { color: communityColors.ink, fontSize: 16, fontWeight: "800" },
  activeCount: { color: communityColors.muted, fontSize: 13 },
  shopCard: {
    minHeight: 84,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  shopImage: { width: 56, height: 56, borderRadius: 11, backgroundColor: communityColors.pale },
  keywordCard: { minHeight: 72, borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 21, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 },
  keywordIcon: { width: 42, height: 42, borderRadius: 22, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  shopCopy: { flex: 1, gap: 4 },
  shopName: { color: communityColors.ink, fontSize: 14, fontWeight: "800" },
  shopSub: { color: communityColors.muted, fontSize: 12 },
  shopMeta: { color: communityColors.muted, fontSize: 12, lineHeight: 18 },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 16,
    padding: 2,
    backgroundColor: "#e8f1e9",
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: communityColors.green },
  toggleDisabled: { opacity: 0.6 },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: communityColors.white,
    shadowColor: "#193d2e",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: "flex-end" },
  emptyText: { color: communityColors.muted, fontSize: 12, textAlign: "center", paddingVertical: 16 },
  addButton: {
    minHeight: 52,
    borderRadius: 32,
    borderWidth: 1.3,
    borderStyle: "dashed",
    borderColor: communityColors.line,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  addText: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: "#a54232", fontSize: 12, textAlign: "center" },
  retry: { backgroundColor: communityColors.green, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, marginTop: 12 },
  retryText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
});
