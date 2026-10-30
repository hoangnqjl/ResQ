import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { AppDrawer } from "./src/components/AppDrawer";
import HomeScreen, { type Food } from "./src/screens/HomeScreen";
import { BuyerSetupScreen, FoodPreferencesScreen, SellerSetupScreen, ShopSetupScreen, WelcomeScreen } from "./src/screens/OnboardingScreens";
import SharingCornerScreen from "./src/screens/SharingCornerScreen";
import BudgetMysteryBagsScreen from "./src/screens/BudgetMysteryBagsScreen";
import SharingStationMapScreen from "./src/screens/SharingStationMapScreen";
import ShopDetailScreen from "./src/screens/ShopDetailScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import DropAlertCenterScreen from "./src/screens/DropAlertCenterScreen";
import { API_URL, requestJson } from "./src/api";
import { colors } from "./src/theme";

type Profile = { id: string; full_name: string; role: "buyer" | "seller" | "admin"; is_incognito: boolean; dietary_preferences: string[]; allergies: string[] };
type Page = "welcome" | "buyerGuide" | "foodPreferences" | "sellerGuide" | "shopSetup" | "home" | "orders" | "privacy" | "dropAlert" | "safety" | "complaints" | "help" | "settings" | "foodDetail" | "sharing" | "budgetBags" | "stationMap" | "shopDetail";
const blankProfile = (id: string): Profile => ({ id, full_name: "ResQ member", role: "buyer", is_incognito: false, dietary_preferences: [], allergies: [] });

function ClientApp() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState<Page>("welcome");
  const [activeTab, setActiveTab] = useState("Explore");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      let id = await AsyncStorage.getItem("resq.user-id");
      if (!id) { id = Crypto.randomUUID(); await AsyncStorage.setItem("resq.user-id", id); }
      setUserId(id);
      let current: Profile;
      try {
        current = await requestJson<Profile>(`/api/users/${id}`);
      } catch {
        current = await requestJson<Profile>("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(blankProfile(id)) });
      }
      setProfile(current);
      const done = await AsyncStorage.getItem("resq.onboarding-complete");
      setPage(done === "true" ? "home" : "welcome");
      setReady(true);
    })().catch((reason) => { setError(reason instanceof Error ? reason.message : "Could not connect to ResQ."); setReady(true); });
  }, []);

  const updateProfile = async (changes: Partial<Profile>) => {
    if (!profile) return;
    const result = await requestJson<Profile>(`/api/users/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...profile, ...changes }) });
    setProfile(result);
  };
  const finishOnboarding = async () => { await AsyncStorage.setItem("resq.onboarding-complete", "true"); setPage("home"); setActiveTab("Explore"); };
  const handleNavigate = (route: string) => {
    setDrawerOpen(false);
    if (["home", "explore", "maps", "saved", "profile"].includes(route)) {
      const tab = route === "home" ? "Home" : route === "explore" ? "Explore" : route === "maps" ? "Maps" : route === "saved" ? "Saved" : "Profile";
      setActiveTab(tab); setPage("home"); return;
    }
    const pageMap: Record<string, Page> = { orders: "orders", dropAlert: "dropAlert", safety: "safety", complaints: "complaints", help: "help", settings: "settings", buyerSetup: "foodPreferences", privacy: "privacy", sharing: "sharing", budgetBags: "budgetBags", stationMap: "stationMap", shopDetail: "shopDetail" };
    if (route === "shopDetail") setSelectedShopId(null);
    setPage(pageMap[route] ?? "home");
  };
  const saveBuyerSetup = async (name: string, allergies: string[], diet: string[]) => {
    await updateProfile({ full_name: name.trim() || profile?.full_name || "ResQ member", role: "buyer", allergies, dietary_preferences: diet });
    await finishOnboarding();
  };
  const createShop = async (name: string, address: string) => {
    await updateProfile({ role: "seller" });
    await requestJson("/api/shops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ownerId: userId, name, address, description: "" }) });
    await finishOnboarding();
    setActiveTab("Profile");
    setBanner("Your store profile is ready. Add food surplus from Merchant Mode.");
  };
  const openFood = (food: Food) => { setSelectedFood(food); setPage("foodDetail"); };
  const reserveFood = async () => {
    if (!selectedFood) return;
    await requestJson("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ foodItemId: selectedFood.id, buyerId: userId, quantity: 1 }) });
    setBanner("Your meal is held for 20 minutes. Find the pickup QR in My Orders.");
    setPage("orders");
  };
  const logout = async () => {
    await AsyncStorage.multiRemove(["resq.user-id", "resq.onboarding-complete"]);
    const id = Crypto.randomUUID();
    await AsyncStorage.setItem("resq.user-id", id);
    const guest = await requestJson<Profile>("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(blankProfile(id)) });
    setProfile(guest); setUserId(id); setPage("welcome"); setDrawerOpen(false); setActiveTab("Explore");
  };

  if (!ready) return <View style={s.center}><ActivityIndicator color={colors.primary} /><Text style={s.loadingText}>Connecting to ResQ…</Text></View>;
  if (!profile) return <View style={s.center}><Text style={s.errorTitle}>ResQ server unavailable</Text><Text style={s.errorText}>{error || "Start the backend and check the MySQL connection."}</Text></View>;

  return <SafeAreaView style={s.safe} edges={["top", "bottom", "left", "right"]}><StatusBar style="dark" />
    {page === "welcome" && <WelcomeScreen onChoose={(role) => { void updateProfile({ role }).then(() => setPage(role === "buyer" ? "buyerGuide" : "sellerGuide")).catch((e) => setError(e.message)); }} />}
    {page === "buyerGuide" && <BuyerSetupScreen onBack={() => setPage("welcome")} onPreferences={() => setPage("foodPreferences")} onExplore={() => void finishOnboarding()} />}
    {page === "foodPreferences" && <FoodPreferencesScreen initialName={profile.full_name} onBack={() => setPage("buyerGuide")} onSave={saveBuyerSetup} />}
    {page === "sellerGuide" && <SellerSetupScreen onBack={() => setPage("welcome")} onSetup={() => setPage("shopSetup")} onDashboard={() => { void finishOnboarding(); setActiveTab("Profile"); }} />}
    {page === "shopSetup" && <ShopSetupScreen onBack={() => setPage("sellerGuide")} busy={false} onSave={(name, address) => createShop(name, address)} />}
    {page === "home" && activeTab === "Explore" && <ExploreScreen userId={userId} activeTab={activeTab} onTabChange={setActiveTab} onOpenFood={openFood} />}
    {page === "home" && activeTab !== "Explore" && <HomeScreen userId={userId} userName={profile.full_name} activeTab={activeTab} onOpenMenu={() => setDrawerOpen(true)} onOpenAlerts={() => setPage("dropAlert")} onTabChange={(tab) => { setActiveTab(tab); setBanner(""); }} onOpenFood={openFood} />}
    {page === "sharing" && <SharingCornerScreen userId={userId} onBack={() => setPage("home")} onOpenMap={() => setPage("stationMap")} />}
    {page === "budgetBags" && <BudgetMysteryBagsScreen userId={userId} onBack={() => setPage("home")} />}
    {page === "stationMap" && <SharingStationMapScreen onBack={() => setPage("home")} onOpenShop={(id) => { setSelectedShopId(id); setPage("shopDetail"); }} />}
    {page === "shopDetail" && <ShopDetailScreen shopId={selectedShopId ?? undefined} userId={userId} onBack={() => setPage("home")} />}
    {page === "dropAlert" && <DropAlertCenterScreen userId={userId} onBack={() => setPage("home")} />}
    {page !== "home" && !["welcome", "buyerGuide", "foodPreferences", "sellerGuide", "shopSetup", "sharing", "budgetBags", "stationMap", "shopDetail", "dropAlert"].includes(page) && <Destination page={page} profile={profile} userId={userId} food={selectedFood} banner={banner || error} onBack={() => setPage("home")} onReserve={reserveFood} onMenu={() => setDrawerOpen(true)} />}
    <AppDrawer visible={drawerOpen} name={profile.full_name} onClose={() => setDrawerOpen(false)} onNavigate={handleNavigate} onMerchant={() => { setDrawerOpen(false); setPage("sellerGuide"); }} onLogout={() => void logout()} />
  </SafeAreaView>;
}

function Destination({ page, profile, userId, food, banner, onBack, onReserve, onMenu }: { page: Page; profile: Profile; userId: string; food: Food | null; banner: string; onBack: () => void; onReserve: () => Promise<void>; onMenu: () => void }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const title: Record<string, string> = { orders: "My Orders", privacy: "Incognito & Privacy", dropAlert: "Drop Alert", safety: "Food Safety & Storage", complaints: "Complaint & Refund Policy", help: "Help & Support", settings: "Settings", foodDetail: food?.name ?? "Meal details" };
  useEffect(() => {
    if (page !== "orders") return;
    void requestJson<{ items: Record<string, unknown>[] }>(`/api/reservations?buyerId=${encodeURIComponent(userId)}`).then((value) => setRows(value.items)).catch((reason) => setError(reason.message));
  }, [page, userId]);
  return <View style={s.destination}>
    <View style={s.destinationHeader}><Pressable onPress={onBack} style={s.backButton}><Text style={s.backText}>‹</Text></Pressable><Text style={s.destinationTitle}>{title[page] ?? "ResQ"}</Text><Pressable onPress={onMenu} style={s.backButton}><Text style={s.menuText}>☰</Text></Pressable></View>
    <ScrollView contentContainerStyle={s.destinationBody}>
      {!!banner && <Text style={s.banner}>{banner}</Text>}
      {page === "foodDetail" && food && <><View style={s.detailPhoto}>{food.image_url ? <Image source={{ uri: food.image_url }} style={s.detailImage} resizeMode="cover" /> : <Text style={s.detailEmoji}>🥗</Text>}</View><Text style={s.detailName}>{food.name}</Text><Text style={s.detailMeta}>{food.shop_name} · {food.address}</Text><Text style={s.detailPrice}>{Number(food.current_price).toLocaleString("vi-VN")}₫</Text><Text style={s.detailMeta}>Original price {Number(food.original_price).toLocaleString("vi-VN")}₫ · {food.quantity_available} portions left</Text><Pressable style={s.cta} onPress={() => { setBusy(true); void onReserve().catch((e) => setError(e.message)).finally(() => setBusy(false)); }}><Text style={s.ctaText}>{busy ? "Holding meal…" : "I’m on my way · Hold a meal"}</Text></Pressable></>}
      {page === "orders" && <>{error ? <Text style={s.info}>{error}</Text> : rows.length ? rows.map((row) => <View key={String(row.id)} style={s.orderCard}><Text style={s.cardTitle}>Order {String(row.id).slice(0, 8)}</Text><Text style={s.info}>{String(row.status)} · {String(row.quantity)} portion(s)</Text><Text style={s.info}>Pickup QR token: {String(row.pickup_qr_token ?? "pending")}</Text></View>) : <Text style={s.info}>No orders yet. Your active reservations will appear here.</Text>}</>}
      {page === "privacy" && <PrivacyContent profile={profile} />}
      {page === "dropAlert" && <Text style={s.info}>Set your notification radius and quiet hours in Dietary & Allergy Filters.</Text>}
      {page === "safety" && <Text style={s.info}>Review storage, allergens and expiry information on every meal before reserving.</Text>}
      {page === "complaints" && <Text style={s.info}>Report a problem from the order detail page. Include the receipt and food label so the store can review it.</Text>}
      {page === "help" && <Text style={s.info}>For help with a pickup, open My Orders and submit a report for that order.</Text>}
      {page === "settings" && <Text style={s.info}>Profile ID: {userId.slice(0, 8)} · Settings are saved to the ResQ database.</Text>}
    </ScrollView>
  </View>;
}

function PrivacyContent({ profile }: { profile: Profile }) { return <Text style={s.info}>Incognito mode: {profile.is_incognito ? "On" : "Off"}. Update this in your account preferences.</Text>; }

export default function App() { return <SafeAreaProvider><ClientApp /></SafeAreaProvider>; }

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.white }, center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30, backgroundColor: colors.white }, loadingText: { color: colors.muted, fontSize: 12, marginTop: 9 }, errorTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" }, errorText: { color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 8 }, destination: { flex: 1, backgroundColor: colors.white }, destinationHeader: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.line }, backButton: { height: 32, width: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.line, justifyContent: "center", alignItems: "center" }, backText: { fontSize: 24, color: colors.ink, marginTop: -3 }, menuText: { color: colors.primary, fontSize: 15 }, destinationTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" }, destinationBody: { padding: 18, gap: 12 }, banner: { backgroundColor: colors.pale, borderRadius: 10, padding: 10, color: colors.primary, fontSize: 10 }, detailPhoto: { height: 210, borderRadius: 18, backgroundColor: colors.pale, justifyContent: "center", alignItems: "center", overflow: "hidden" }, detailImage: { width: "100%", height: "100%" }, detailEmoji: { fontSize: 62 }, detailName: { color: colors.ink, fontSize: 20, fontWeight: "900" }, detailMeta: { color: colors.muted, fontSize: 10, lineHeight: 16 }, detailPrice: { color: colors.primary, fontSize: 24, fontWeight: "900" }, cta: { backgroundColor: colors.primary, borderRadius: 24, height: 46, alignItems: "center", justifyContent: "center", marginTop: 7 }, ctaText: { color: colors.white, fontSize: 10, fontWeight: "800" }, orderCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 13, gap: 7 }, cardTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" }, info: { color: colors.muted, fontSize: 10, lineHeight: 16 } });
