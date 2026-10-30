import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { getCommunityFoods, getGlobalDropAlertSettings, getShopDropAlerts, imageUrl, saveGlobalDropAlertSettings, saveShopDropAlert, type CommunityFood, type DropAlert, type GlobalDropAlertSettings } from "../services/communityApi";

type Props = { userId: string; onBack: () => void };
type ShopRow = DropAlert & { name: string; address: string; image?: string; dropWindow?: string };

function timeLabel(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function DropAlertCenterScreen({ userId, onBack }: Props) {
  const [global, setGlobal] = useState<GlobalDropAlertSettings>({
    instantPush: true,
    vibrateEmergencyDrops: true,
  });
  const [alerts, setAlerts] = useState<DropAlert[]>([]);
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingShop, setSavingShop] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [settings, shopAlerts, foodItems] = await Promise.all([
        getGlobalDropAlertSettings(userId),
        getShopDropAlerts(userId),
        getCommunityFoods(),
      ]);
      setGlobal(settings);
      setAlerts(shopAlerts);
      setFoods(foodItems);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải cảnh báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [userId]);

  const shopRows: ShopRow[] = useMemo(() => {
    const itemsByShop = new Map<string, CommunityFood[]>();
    for (const food of foods) {
      const current = itemsByShop.get(food.shop_id) ?? [];
      current.push(food);
      itemsByShop.set(food.shop_id, current);
    }
    return alerts.flatMap((alert) => {
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
  }, [alerts, foods]);

  const availableShops = useMemo(() => {
    const subscribed = new Set(alerts.filter((alert) => Boolean(alert.enabled)).map((alert) => alert.shop_id));
    const groups = new Map<string, CommunityFood>();
    for (const food of foods) if (!subscribed.has(food.shop_id)) groups.set(food.shop_id, food);
    return [...groups.values()];
  }, [alerts, foods]);

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
              <Switch
                disabled={savingGlobal}
                value={global.instantPush}
                onValueChange={(value) => void updateGlobal("instantPush", value)}
                trackColor={{ false: "#e8f1e9", true: communityColors.green }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e8f1e9"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.globalRow}>
              <Text style={[styles.globalTitle, styles.vibrateTitle]}>Vibrate on 0đ Emergency Drops</Text>
              <Switch
                disabled={savingGlobal}
                value={global.vibrateEmergencyDrops}
                onValueChange={(value) => void updateGlobal("vibrateEmergencyDrops", value)}
                trackColor={{ false: "#e8f1e9", true: communityColors.green }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e8f1e9"
              />
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Subscribed Shops</Text>
            <Text style={styles.activeCount}>{shopRows.filter((shop) => Boolean(shop.enabled)).length} active</Text>
          </View>
          {shopRows.map((shop) => (
            <View key={shop.id} style={styles.shopCard}>
              {shop.image ? <Image source={{ uri: shop.image }} style={styles.shopImage} resizeMode="cover" /> : <View style={styles.shopImage} />}
              <View style={styles.shopCopy}>
                <Text numberOfLines={1} style={styles.shopName}>{shop.name}</Text>
                <Text numberOfLines={1} style={styles.shopSub}>{shop.dropWindow}</Text>
                <Text numberOfLines={2} style={styles.shopMeta}>{shop.address}</Text>
              </View>
              <Switch
                disabled={savingShop === shop.shop_id}
                value={Boolean(shop.enabled)}
                onValueChange={(value) => void updateShop(shop.shop_id ?? "", value)}
                trackColor={{ false: "#e8f1e9", true: communityColors.green }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e8f1e9"
              />
            </View>
          ))}
          {!shopRows.length && <Text style={styles.emptyText}>Chưa đăng ký cảnh báo cửa hàng nào.</Text>}
          <Pressable onPress={() => setPickerOpen(true)} style={styles.addButton}>
            <Text style={styles.addText}>+ Add New Alert</Text>
          </Pressable>
        </ScrollView>
      )}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setPickerOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Alert</Text>
            <Text style={styles.modalSubtitle}>Choose a shop with available food.</Text>
            <ScrollView>
              {availableShops.map((food) => (
                <Pressable
                  key={food.shop_id}
                  onPress={() => {
                    setPickerOpen(false);
                    void updateShop(food.shop_id, true);
                  }}
                  style={styles.shopOption}
                >
                  <Text style={styles.shopOptionName}>{food.shop_name}</Text>
                  <Text numberOfLines={1} style={styles.shopOptionAddress}>{food.address}</Text>
                </Pressable>
              ))}
              {!availableShops.length && <Text style={styles.emptyText}>Không còn cửa hàng phù hợp để thêm.</Text>}
            </ScrollView>
            <Pressable onPress={() => setPickerOpen(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  globalDescription: { color: communityColors.muted, fontSize: 12 },
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
  sectionTitle: { color: communityColors.ink, fontSize: 15, fontWeight: "800" },
  activeCount: { color: communityColors.muted, fontSize: 12 },
  shopCard: {
    minHeight: 83,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 22,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  shopImage: { width: 58, height: 58, borderRadius: 11, backgroundColor: communityColors.pale },
  shopCopy: { flex: 1, gap: 4 },
  shopName: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  shopSub: { color: communityColors.muted, fontSize: 11 },
  shopMeta: { color: communityColors.muted, fontSize: 10, lineHeight: 14 },
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
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(25,34,28,0.28)" },
  modalDismiss: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  modalCard: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
  },
  modalTitle: { color: communityColors.ink, fontSize: 17, fontWeight: "800" },
  modalSubtitle: { color: communityColors.muted, fontSize: 12, marginTop: 5, marginBottom: 12 },
  shopOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: communityColors.line },
  shopOptionName: { color: communityColors.ink, fontSize: 13, fontWeight: "700" },
  shopOptionAddress: { color: communityColors.muted, fontSize: 11, marginTop: 4 },
  cancelButton: { height: 40, alignItems: "center", justifyContent: "center", marginTop: 12 },
  cancelText: { color: communityColors.green, fontSize: 13, fontWeight: "700" },
});
