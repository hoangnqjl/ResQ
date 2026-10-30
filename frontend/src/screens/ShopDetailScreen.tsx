import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import {
  getCommunityFoods,
  getCommunityShop,
  getShopDropAlert,
  imageUrl,
  saveShopDropAlert,
  type CommunityFood,
  type CommunityShop,
} from "../services/communityApi";

export default function ShopDetailScreen({
  onBack,
  shopId,
  userId,
}: {
  onBack: () => void;
  shopId?: string;
  userId: string;
}) {
  const [shop, setShop] = useState<CommunityShop | null>(null);
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [dropAlert, setDropAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertBusy, setAlertBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const allFoods = await getCommunityFoods();
        const id = shopId ?? allFoods[0]?.shop_id;
        if (!id) {
          if (active) setError("Chưa có cửa hàng nào để hiển thị.");
          return;
        }
        const [shopDetails, shopAlert] = await Promise.all([
          getCommunityShop(id),
          getShopDropAlert(userId, id),
        ]);
        if (!active) return;
        setShop(shopDetails);
        setFoods(allFoods.filter((food) => food.shop_id === id));
        setDropAlert(Boolean(shopAlert?.enabled));
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải thông tin cửa hàng.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [shopId, userId]);

  const toggleDropAlert = async (enabled: boolean) => {
    if (!shop) return;
    setAlertBusy(true);
    try {
      await saveShopDropAlert(userId, shop.id, enabled);
      setDropAlert(enabled);
    } catch (reason) {
      Alert.alert("Không thể lưu Drop-alert", reason instanceof Error ? reason.message : "Vui lòng thử lại.");
    } finally {
      setAlertBusy(false);
    }
  };

  const showCertificate = async () => {
    if (!shop?.safety_certificate_url) {
      Alert.alert("Chứng nhận an toàn", shop?.verified ? "Cửa hàng được hệ thống đánh dấu đã xác minh." : "Cửa hàng chưa có liên kết chứng nhận.");
      return;
    }
    try {
      await Linking.openURL(shop.safety_certificate_url);
    } catch {
      Alert.alert("Không thể mở chứng nhận", shop.safety_certificate_url);
    }
  };

  const gallery = foods.filter((food) => imageUrl(food.image_url));
  const heroImage = imageUrl(gallery[0]?.image_url);

  return (
    <View style={styles.root}>
      <CommunityHeader title="Shop Detail" onBack={onBack} onMore={() => {}} />
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View>
      ) : error ? (
        <Text style={styles.stateText}>{error}</Text>
      ) : shop ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.photoWrap}>
            {heroImage ? <Image source={{ uri: heroImage }} style={styles.shopPhoto} resizeMode="cover" /> : (
              <View style={styles.photoFallback}>
                <Ionicons name="storefront-outline" size={42} color={communityColors.green} />
              </View>
            )}
          </View>
          <View style={styles.dots}>
            {gallery.slice(0, 3).map((food, index) => (
              <View key={food.id} style={[styles.dot, index === 0 && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.shopHeading}>
            <View style={styles.shopCopy}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.reviewCount}>{Number(shop.review_count)} reviews</Text>
              <Text style={styles.address}>{shop.address}</Text>
            </View>
            <View style={styles.rating}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingText}>{Number(shop.average_rating).toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.safetyCard}>
            <View style={styles.safetyIcon}>
              <Ionicons name="shield-checkmark-outline" size={25} color={communityColors.ink} />
            </View>
            <View style={styles.safetyCopy}>
              <Text style={styles.safetyEyebrow}>FOOD SAFETY</Text>
              <Text style={styles.safetyTitle}>{shop.verified ? "Safety certificate verified" : "Certificate not verified"}</Text>
              <Text style={styles.safetyDetails}>{shop.safety_certificate_url ? "Certificate available to view" : "No certificate has been uploaded"}</Text>
            </View>
            <Pressable onPress={() => void showCertificate()} style={styles.viewButton}>
              <Text style={styles.viewText}>View</Text>
            </Pressable>
          </View>
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="notifications-outline" size={24} color={communityColors.ink} />
            </View>
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>Drop-alert</Text>
              <Text style={styles.alertDescription}>Get notified when this shop starts an end-of-day food drop.</Text>
            </View>
            <Switch
              disabled={alertBusy}
              value={dropAlert}
              onValueChange={(enabled) => void toggleDropAlert(enabled)}
              trackColor={{ false: "#697a6d", true: communityColors.green }}
              thumbColor={communityColors.white}
              ios_backgroundColor="#697a6d"
            />
          </View>
          <Text style={styles.listingHeading}>Available at this shop</Text>
          {foods.length ? foods.map((food) => (
            <View key={food.id} style={styles.foodRow}>
              {imageUrl(food.image_url) ? (
                <Image source={{ uri: imageUrl(food.image_url) }} style={styles.foodImage} resizeMode="cover" />
              ) : <View style={styles.foodImage} />}
              <View style={styles.foodCopy}>
                <Text numberOfLines={1} style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodMeta}>{food.quantity_available} left · {Number(food.current_price).toLocaleString("vi-VN")}₫</Text>
              </View>
            </View>
          )) : <Text style={styles.stateText}>Chưa có món ăn đang được đăng.</Text>}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: communityColors.white },
  content: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 28 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText: { color: communityColors.muted, fontSize: 12, padding: 22, textAlign: "center" },
  photoWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: communityColors.pale,
    borderWidth: 1,
    borderColor: communityColors.line,
  },
  shopPhoto: { width: "100%", height: "100%" },
  photoFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: communityColors.pale },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, height: 28 },
  dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: "#e5eee5" },
  dotActive: { backgroundColor: "#687a6c" },
  shopHeading: {
    minHeight: 69,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  shopCopy: { flex: 1 },
  shopName: { color: communityColors.ink, fontSize: 17, fontWeight: "800" },
  reviewCount: { color: communityColors.muted, fontSize: 11, marginTop: 5 },
  address: { color: communityColors.muted, fontSize: 10, marginTop: 4 },
  rating: {
    height: 36,
    minWidth: 62,
    borderRadius: 12,
    backgroundColor: communityColors.paleOrange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  star: { color: "#dd842e", fontSize: 13 },
  ratingText: { color: "#4b5e51", fontSize: 11 },
  safetyCard: {
    minHeight: 102,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  safetyIcon: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyCopy: { flex: 1, gap: 4 },
  safetyEyebrow: { color: communityColors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  safetyTitle: { color: communityColors.ink, fontSize: 12, fontWeight: "800" },
  safetyDetails: { color: communityColors.muted, fontSize: 10, lineHeight: 14 },
  viewButton: {
    minWidth: 43,
    height: 30,
    borderRadius: 17,
    paddingHorizontal: 10,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  viewText: { color: communityColors.ink, fontSize: 11, fontWeight: "700" },
  alertCard: {
    minHeight: 66,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertIcon: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCopy: { flex: 1, gap: 6 },
  alertTitle: { color: communityColors.ink, fontSize: 12 },
  alertDescription: { color: communityColors.muted, fontSize: 9 },
  listingHeading: { color: communityColors.ink, fontSize: 13, fontWeight: "800", marginTop: 18, marginBottom: 8 },
  foodRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: communityColors.line,
  },
  foodImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: communityColors.pale },
  foodCopy: { flex: 1, gap: 5 },
  foodName: { color: communityColors.ink, fontSize: 12, fontWeight: "700" },
  foodMeta: { color: communityColors.muted, fontSize: 10 },
});
