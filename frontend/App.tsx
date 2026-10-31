import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Ionicons } from "@expo/vector-icons";

import { AppDrawer } from "./src/components/AppDrawer";
import { FallbackPhoto } from "./src/components/FallbackPhoto";
import { foodPhoto } from "./src/data/designPhotos";
import { imageUrl } from "./src/services/communityApi";
import { API_URL, requestJson } from "./src/api";
import { colors, fontSizes } from "./src/theme";

// Screens
import HomeScreen, { type Food } from "./src/screens/HomeScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import HeatmapScreen from "./src/screens/HeatmapScreen";
import SavedScreen from "./src/screens/SavedScreen";
import BuyerProfileScreen from "./src/screens/BuyerProfileScreen";
import SellerProfileScreen from "./src/screens/SellerProfileScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import IncognitoModeScreen from "./src/screens/IncognitoModeScreen";
import AnonymousProfilePreviewScreen from "./src/screens/AnonymousProfilePreviewScreen";
import FoodAllergiesScreen from "./src/screens/FoodAllergiesScreen";
import DietScreen from "./src/screens/DietScreen";
import NotificationRadiusScreen from "./src/screens/NotificationRadiusScreen";
import SharingCornerScreen from "./src/screens/SharingCornerScreen";
import SharingStationMapScreen from "./src/screens/SharingStationMapScreen";
import BudgetMysteryBagsScreen from "./src/screens/BudgetMysteryBagsScreen";
import MysteryBagGuideScreen from "./src/screens/MysteryBagGuideScreen";
import ShopDetailScreen from "./src/screens/ShopDetailScreen";
import ShopReviewsScreen from "./src/screens/ShopReviewsScreen";
import FoodShopListScreen from "./src/screens/FoodShopListScreen";
import DropAlertCenterScreen from "./src/screens/DropAlertCenterScreen";
import MyDropAlertScreen from "./src/screens/MyDropAlertScreen";
import SetDropAlertScreen from "./src/screens/SetDropAlertScreen";
import RescueHotspotsScreen from "./src/screens/RescueHotspotsScreen";
import SearchSettingsScreen from "./src/screens/SearchSettingsScreen";
import CertificateScreen from "./src/screens/CertificateScreen";
import StoreLocationScreen from "./src/screens/StoreLocationScreen";
import {
  BuyerSetupScreen,
  FoodPreferencesScreen,
  SellerSetupScreen,
  ShopSetupScreen,
  WelcomeScreen,
} from "./src/screens/OnboardingScreens";

// ==========================================
// TYPES
// ==========================================

export type Profile = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  role: "buyer" | "seller" | "admin";
  is_incognito: boolean;
  dietary_preferences: string[];
  allergies: string[];
};

export type Page =
  | "welcome"
  | "buyerGuide"
  | "foodPreferences"
  | "sellerGuide"
  | "shopSetup"
  | "home"
  | "orders"
  | "foodDetail"
  | "sharing"
  | "budgetBags"
  | "mysteryBagGuide"
  | "stationMap"
  | "shopDetail"
  | "shopReviews"
  | "foodShopList"
  | "dropAlert"
  | "myDropAlert"
  | "setDropAlert"
  | "rescueHotspots"
  | "foodAllergies"
  | "privacy"
  | "incognitoPreview"
  | "diet"
  | "notificationRadius"
  | "editProfile"
  | "certificate"
  | "storeLocation"
  | "safety"
  | "complaints"
  | "help"
  | "settings"
  | "buyerProfile"
  | "sellerProfile";

const blankProfile = (id: string): Profile => ({
  id,
  full_name: "Nguyen Capybaras",
  email: "quynh23@email.com",
  phone: "(+84) 0123456789",
  address: "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng",
  role: "buyer",
  is_incognito: false,
  dietary_preferences: ["Non-vegetarian"],
  allergies: ["Milk", "Seafood"],
});

// ==========================================
// MAIN CLIENT APPLICATION
// ==========================================

function ClientApp() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  // Navigation State
  const [page, setPage] = useState<Page>("welcome");
  const [activeTab, setActiveTab] = useState("Home");
  const [history, setHistory] = useState<{ page: Page; tab?: string }[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Selected Resources
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [prefilledOrderId, setPrefilledOrderId] = useState<string | undefined>(undefined);

  // Status & Feedback
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // INITIALIZATION
  // ==========================================

  useEffect(() => {
    let mounted = true;

    void (async () => {
      let id = await AsyncStorage.getItem("resq.user-id");
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem("resq.user-id", id);
      }

      if (!mounted) return;
      setUserId(id);

      let current: Profile;
      try {
        current = await requestJson<Profile>(`/api/users/${id}`);
      } catch {
        current = await requestJson<Profile>("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blankProfile(id)),
        });
      }

      if (!mounted) return;
      setProfile(current);

      const done = await AsyncStorage.getItem("resq.onboarding-complete");
      if (!mounted) return;

      setPage(done === "true" ? "home" : "welcome");
      setActiveTab("Home");
      setReady(true);
    })().catch((reason) => {
      if (!mounted) return;
      setError(
        reason instanceof Error ? reason.message : "Could not connect to ResQ."
      );
      setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================

  const navigateTo = (targetPage: Page, targetTab?: string) => {
    setHistory((prev) => [...prev, { page, tab: activeTab }]);
    setPage(targetPage);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) {
        setPage("home");
        return [];
      }
      const nextHistory = [...prev];
      const last = nextHistory.pop()!;
      setPage(last.page);
      if (last.tab) {
        setActiveTab(last.tab);
      }
      return nextHistory;
    });
  };

  const updateProfile = async (changes: Partial<Profile>) => {
    if (!profile) return;
    const result = await requestJson<Profile>(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, ...changes }),
    });
    setProfile(result);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("resq.onboarding-complete", "true");
    setHistory([]);
    setPage("home");
    setActiveTab("Home");
  };

  const saveBuyerSetup = async (
    name: string,
    allergies: string[],
    diet: string[]
  ) => {
    await updateProfile({
      full_name: name.trim() || profile?.full_name || "ResQ member",
      role: "buyer",
      allergies,
      dietary_preferences: diet,
    });
    await finishOnboarding();
  };

  const createShop = async (name: string, address: string) => {
    await updateProfile({ role: "seller" });
    await requestJson("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerId: userId,
        name,
        address,
        description: "",
      }),
    });
    await finishOnboarding();
    setActiveTab("Profile");
    setBanner("Store profile is active. Welcome to Merchant Mode!");
  };

  const handleNavigate = (route: string) => {
    setDrawerOpen(false);

    if (["home", "explore", "maps", "saved", "profile"].includes(route)) {
      const tabMap: Record<string, string> = {
        home: "Home",
        explore: "Explore",
        maps: "Maps",
        saved: "Saved",
        profile: "Profile",
      };
      const tab = tabMap[route] ?? "Home";
      setActiveTab(tab);
      setPage("home");
      return;
    }

    if (route === "buyerProfile") {
      navigateTo("buyerProfile");
      return;
    }

    if (route === "sellerProfile") {
      navigateTo("sellerProfile");
      return;
    }

    const pageMap: Record<string, Page> = {
      orders: "orders",
      sharing: "sharing",
      budgetBags: "budgetBags",
      stationMap: "stationMap",
      shopDetail: "shopDetail",
      dropAlert: "dropAlert",
      myDropAlert: "myDropAlert",
      safety: "safety",
      complaints: "complaints",
      foodAllergies: "foodAllergies",
      privacy: "privacy",
      incognitoPreview: "incognitoPreview",
      diet: "diet",
      notificationRadius: "notificationRadius",
      buyerSetup: "foodPreferences",
      help: "help",
      settings: "settings",
    };

    if (route === "shopDetail") {
      setSelectedShopId(null);
    }

    navigateTo(pageMap[route] ?? "home");
  };

  const handleMerchantToggle = async () => {
    setDrawerOpen(false);
    if (profile?.role === "seller") {
      await updateProfile({ role: "buyer" });
      setActiveTab("Home");
      setPage("home");
      setBanner("Switched to Buyer Mode.");
    } else {
      try {
        const result = await requestJson<{ items: Array<{ id: string; name: string }> }>(
          `/api/shops?ownerId=${encodeURIComponent(userId)}`
        );
        if (result.items && result.items.length > 0) {
          await updateProfile({ role: "seller" });
          setActiveTab("Profile");
          setPage("home");
          setBanner(`Switched to Merchant Mode: ${result.items[0].name}`);
        } else {
          navigateTo("sellerGuide");
        }
      } catch {
        navigateTo("sellerGuide");
      }
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "resq.user-id",
      "resq.onboarding-complete",
    ]);
    const id = Crypto.randomUUID();
    await AsyncStorage.setItem("resq.user-id", id);
    const guest = await requestJson<Profile>("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blankProfile(id)),
    });
    setProfile(guest);
    setUserId(id);
    setHistory([]);
    setPage("welcome");
    setDrawerOpen(false);
    setActiveTab("Home");
    setBanner("");
    setError("");
  };

  // ==========================================
  // LOADING & SERVER ERROR STATES
  // ==========================================

  if (!ready) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={s.loadingText}>Connecting to ResQ…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={s.center}>
        <Text style={s.errorTitle}>ResQ server unavailable</Text>
        <Text style={s.errorText}>
          {error || "Check backend and MySQL connection."}
        </Text>
      </View>
    );
  }

  // ==========================================
  // RENDER APP
  // ==========================================

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe} edges={["top", "bottom", "left", "right"]}>
        <StatusBar style="dark" />

        {/* Global Banner Notification */}
        {!!banner && (
          <View style={s.globalBanner}>
            <Text style={s.globalBannerText}>{banner}</Text>
            <Pressable onPress={() => setBanner("")} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.primary} />
            </Pressable>
          </View>
        )}

        {/* ===================================== */}
        {/* ONBOARDING FLOWS                      */}
        {/* ===================================== */}

        {page === "welcome" && (
          <WelcomeScreen
            onChoose={(role) => {
              void updateProfile({ role })
                .then(() => {
                  setPage(role === "buyer" ? "buyerGuide" : "sellerGuide");
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}

        {page === "buyerGuide" && (
          <BuyerSetupScreen
            onBack={() => setPage("welcome")}
            onPreferences={() => setPage("foodPreferences")}
            onExplore={() => void finishOnboarding()}
          />
        )}

        {page === "foodPreferences" && (
          <FoodPreferencesScreen
            initialName={profile.full_name}
            onBack={() => setPage("buyerGuide")}
            onSave={saveBuyerSetup}
          />
        )}

        {page === "sellerGuide" && (
          <SellerSetupScreen
            onBack={() => setPage("welcome")}
            onSetup={() => setPage("shopSetup")}
            onDashboard={() => {
              void finishOnboarding();
              setActiveTab("Profile");
            }}
          />
        )}

        {page === "shopSetup" && (
          <ShopSetupScreen
            onBack={() => goBack()}
            busy={false}
            onSave={createShop}
          />
        )}

        {/* ===================================== */}
        {/* 5 MAIN BOTTOM TAB VIEWS ("home")     */}
        {/* ===================================== */}

        {page === "home" && activeTab === "Home" && (
          <HomeScreen
            userId={userId}
            userName={profile.full_name}
            activeTab={activeTab}
            onOpenMenu={() => setDrawerOpen(true)}
            onOpenAlerts={() => navigateTo("myDropAlert")}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setBanner("");
            }}
            onOpenFood={(food) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
          />
        )}

        {page === "home" && activeTab === "Explore" && (
          <ExploreScreen
            userId={userId}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setBanner("");
            }}
            onOpenFood={(food) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
            onOpenSettings={() => navigateTo("settings")}
            onOpenSharing={() => navigateTo("sharing")}
          />
        )}

        {page === "home" && activeTab === "Maps" && (
          <HeatmapScreen
            userId={userId}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setBanner("");
            }}
            onOpenShop={(shopId) => {
              setSelectedShopId(shopId);
              navigateTo("shopDetail");
            }}
            onOpenHotspots={() => navigateTo("rescueHotspots")}
          />
        )}

        {page === "home" && activeTab === "Saved" && (
          <SavedScreen
            userId={userId}
            onOpenMenu={() => setDrawerOpen(true)}
            onOpenFood={(food) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
            onOpenShop={(shopId) => {
              setSelectedShopId(shopId);
              navigateTo("shopDetail");
            }}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setBanner("");
            }}
          />
        )}

        {page === "home" && activeTab === "Profile" && profile.role === "buyer" && (
          <BuyerProfileScreen
            userName={profile.full_name}
            isIncognito={profile.is_incognito}
            isGuest={false}
            onOpenMenu={() => setDrawerOpen(true)}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setBanner("");
            }}
            onNavigateQuickAction={(action) => {
              if (action === "allergies") navigateTo("foodAllergies");
              else if (action === "diet") navigateTo("diet");
              else if (action === "radius") navigateTo("notificationRadius");
              else if (action === "privacy") navigateTo("privacy");
              else if (action === "route") {
                setActiveTab("Maps");
              }
            }}
            onEditProfile={() => navigateTo("editProfile")}
            onReport={() => navigateTo("complaints")}
          />
        )}

        {page === "home" && activeTab === "Profile" && profile.role === "seller" && (
          <SellerProfileScreen
            onBack={() => {
              setActiveTab("Home");
            }}
            onEditStore={() => navigateTo("shopSetup")}
            onItemPress={(key) => {
              if (key === "safety_cert" || key === "trust_badge") {
                navigateTo("certificate");
              } else if (key === "location") {
                navigateTo("storeLocation");
              } else if (key === "hours") {
                navigateTo("shopSetup");
              }
            }}
          />
        )}

        {/* ===================================== */}
        {/* INDEPENDENT PROFILE SCREENS           */}
        {/* ===================================== */}

        {page === "buyerProfile" && (
          <BuyerProfileScreen
            userName={profile.full_name}
            isIncognito={profile.is_incognito}
            onBack={() => goBack()}
            onOpenMenu={() => setDrawerOpen(true)}
            onNavigateQuickAction={(action) => {
              if (action === "allergies") navigateTo("foodAllergies");
              else if (action === "diet") navigateTo("diet");
              else if (action === "radius") navigateTo("notificationRadius");
              else if (action === "privacy") navigateTo("privacy");
              else if (action === "route") {
                setActiveTab("Maps");
                setPage("home");
              }
            }}
            onEditProfile={() => navigateTo("editProfile")}
            onReport={() => navigateTo("complaints")}
          />
        )}

        {page === "sellerProfile" && (
          <SellerProfileScreen
            onBack={() => goBack()}
            onEditStore={() => navigateTo("shopSetup")}
            onItemPress={(key) => {
              if (key === "safety_cert" || key === "trust_badge") {
                navigateTo("certificate");
              } else if (key === "location") {
                navigateTo("storeLocation");
              } else if (key === "hours") {
                navigateTo("shopSetup");
              }
            }}
          />
        )}

        {page === "editProfile" && (
          <EditProfileScreen
            initialData={{
              fullName: profile.full_name,
              email: profile.email || "quynh23@email.com",
              phone: profile.phone || "(+84) 0123456789",
              address: profile.address || "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng",
            }}
            onBack={() => goBack()}
            onSave={async (data) => {
              await updateProfile({
                full_name: data.fullName,
                email: data.email,
                phone: data.phone,
                address: data.address,
              });
              setBanner("Profile information updated.");
            }}
          />
        )}

        {/* ===================================== */}
        {/* PREFERENCES & SETTINGS SCREENS        */}
        {/* ===================================== */}

        {page === "foodAllergies" && (
          <FoodAllergiesScreen
            initialAllergies={profile.allergies || []}
            onBack={() => goBack()}
            onSave={async (allergies) => {
              await updateProfile({ allergies });
              setBanner("Allergy filters saved.");
            }}
          />
        )}

        {page === "diet" && (
          <DietScreen
            initialDiet={profile.dietary_preferences?.[0] || "Non-vegetarian"}
            onBack={() => goBack()}
            onSave={async (diet) => {
              await updateProfile({ dietary_preferences: [diet] });
              setBanner("Dietary preference saved.");
            }}
          />
        )}

        {page === "notificationRadius" && (
          <NotificationRadiusScreen
            address={profile.address || "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng"}
            onBack={() => goBack()}
            onSave={async (data) => {
              try {
                await requestJson(`/api/users/${encodeURIComponent(userId)}/preferences`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    notification_radius_km: data.radius,
                    quiet_start: data.quietHours ? "22:00" : "00:00",
                    quiet_end: data.quietHours ? "06:00" : "00:00",
                  }),
                });
                setBanner("Notification radius preferences saved.");
              } catch (e: any) {
                Alert.alert("Preferences", e.message);
              }
            }}
          />
        )}

        {page === "privacy" && (
          <IncognitoModeScreen
            initialEnabled={profile.is_incognito}
            userName={profile.full_name}
            phone={profile.phone || "(+84) 0123456789"}
            onBack={() => goBack()}
            onToggle={async (enabled) => {
              await updateProfile({ is_incognito: enabled });
              setBanner(`Incognito mode is now ${enabled ? "ON" : "OFF"}.`);
            }}
            onViewHiddenProfile={() => navigateTo("incognitoPreview")}
          />
        )}

        {page === "incognitoPreview" && (
          <AnonymousProfilePreviewScreen
            buyerId={`#BUYER-${userId.slice(0, 4).toUpperCase()}`}
            onBack={() => goBack()}
            onSave={() => {
              setBanner("Anonymous profile settings confirmed.");
              goBack();
            }}
          />
        )}

        {page === "settings" && (
          <SearchSettingsScreen
            userId={userId}
            onBack={() => goBack()}
          />
        )}

        {/* ===================================== */}
        {/* COMMUNITY & SPECIALS SCREENS          */}
        {/* ===================================== */}

        {page === "sharing" && (
          <SharingCornerScreen
            userId={userId}
            onBack={() => goBack()}
            onOpenMap={() => navigateTo("stationMap")}
          />
        )}

        {page === "stationMap" && (
          <SharingStationMapScreen
            onBack={() => goBack()}
            onOpenShop={(id) => {
              setSelectedShopId(id);
              navigateTo("shopDetail");
            }}
          />
        )}

        {page === "budgetBags" && (
          <BudgetMysteryBagsScreen
            userId={userId}
            onBack={() => goBack()}
            onOpenGuide={() => navigateTo("mysteryBagGuide")}
          />
        )}

        {page === "mysteryBagGuide" && (
          <MysteryBagGuideScreen
            onBack={() => goBack()}
            onBrowse={() => {
              setPage("budgetBags");
            }}
          />
        )}

        {/* ===================================== */}
        {/* SHOP & REVIEWS SCREENS                */}
        {/* ===================================== */}

        {page === "shopDetail" && (
          <ShopDetailScreen
            shopId={selectedShopId ?? undefined}
            userId={userId}
            onBack={() => goBack()}
            onOpenReviews={(shopId) => {
              setSelectedShopId(shopId);
              navigateTo("shopReviews");
            }}
            onOpenSettings={() => navigateTo("settings")}
            onOpenFood={(food) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
            onOpenFoodList={(shopId) => {
              setSelectedShopId(shopId);
              navigateTo("foodShopList");
            }}
          />
        )}

        {page === "shopReviews" && (
          <ShopReviewsScreen
            shopId={selectedShopId || ""}
            userId={userId}
            onBack={() => goBack()}
          />
        )}

        {page === "foodShopList" && (
          <FoodShopListScreen
            shopId={selectedShopId}
            userId={userId}
            onBack={() => goBack()}
            onOpenFood={(food) => {
              setSelectedFood({
                id: food.id,
                name: food.name,
                description: food.description ?? undefined,
                image_url: food.image_url ?? undefined,
                original_price: food.original_price,
                current_price: food.current_price,
                quantity_available: food.quantity_available,
                shop_id: food.shop_id,
                shop_name: food.shop_name,
                address: food.address,
                verified: food.verified ?? false,
                reputation_score: food.reputation_score,
                storage_instructions: food.storage_instructions ?? undefined,
              });
              navigateTo("foodDetail");
            }}
          />
        )}

        {page === "storeLocation" && (
          <StoreLocationScreen
            onBack={() => goBack()}
            onConfirm={() => {
              setBanner("Store location confirmed.");
              goBack();
            }}
            onEditAddress={() => navigateTo("shopSetup")}
          />
        )}

        {page === "certificate" && (
          <CertificateScreen
            onBack={() => goBack()}
            onSubmit={() => {
              setBanner("Food safety certificate submitted for review.");
              goBack();
            }}
          />
        )}

        {/* ===================================== */}
        {/* DROP ALERT SCREENS                    */}
        {/* ===================================== */}

        {page === "myDropAlert" && (
          <MyDropAlertScreen
            userId={userId}
            onBack={() => goBack()}
            onManage={() => navigateTo("dropAlert")}
            onOpenFood={(food) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
          />
        )}

        {page === "dropAlert" && (
          <DropAlertCenterScreen
            userId={userId}
            onBack={() => goBack()}
            onCreateAlert={() => navigateTo("setDropAlert")}
          />
        )}

        {page === "setDropAlert" && (
          <SetDropAlertScreen
            userId={userId}
            onBack={() => goBack()}
          />
        )}

        {page === "rescueHotspots" && (
          <RescueHotspotsScreen
            onBack={() => goBack()}
            onOpenMap={() => {
              setActiveTab("Maps");
              setPage("home");
            }}
          />
        )}

        {/* ===================================== */}
        {/* ORDERS & RESERVATIONS VIEW            */}
        {/* ===================================== */}

        {page === "orders" && (
          <OrdersView
            userId={userId}
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
            onExplore={() => {
              setActiveTab("Explore");
              setPage("home");
            }}
            onReport={(orderId) => {
              setPrefilledOrderId(orderId);
              navigateTo("complaints");
            }}
          />
        )}

        {/* ===================================== */}
        {/* FOOD DETAIL VIEW                      */}
        {/* ===================================== */}

        {page === "foodDetail" && selectedFood && (
          <FoodDetailView
            food={selectedFood}
            userId={userId}
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
            onOpenShop={(shopId) => {
              setSelectedShopId(shopId);
              navigateTo("shopDetail");
            }}
            onReserved={() => {
              setBanner("Your meal is held for 20 minutes! Show the QR code at the counter.");
              setPage("orders");
            }}
          />
        )}

        {/* ===================================== */}
        {/* POLICIES & SUPPORT VIEWS              */}
        {/* ===================================== */}

        {page === "safety" && (
          <SafetyPolicyView
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
          />
        )}

        {page === "complaints" && (
          <ComplaintsView
            userId={userId}
            initialOrderId={prefilledOrderId}
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
          />
        )}

        {page === "help" && (
          <HelpCenterView
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
            onOrders={() => navigateTo("orders")}
            onComplaints={() => navigateTo("complaints")}
          />
        )}

        {/* ===================================== */}
        {/* APP DRAWER (SIDEBAR)                  */}
        {/* ===================================== */}

        <AppDrawer
          visible={drawerOpen}
          name={profile.full_name}
          role={profile.role}
          onClose={() => setDrawerOpen(false)}
          onNavigate={handleNavigate}
          onMerchant={() => void handleMerchantToggle()}
          onLogout={() => void logout()}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ==========================================
// FOOD DETAIL VIEW COMPONENT
// ==========================================

function FoodDetailView({
  food,
  userId,
  onBack,
  onMenu,
  onOpenShop,
  onReserved,
}: {
  food: Food;
  userId: string;
  onBack: () => void;
  onMenu: () => void;
  onOpenShop: (shopId: string) => void;
  onReserved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const original = Number(food.original_price);
  const current = Number(food.current_price);
  const discount =
    original > 0
      ? Math.max(0, Math.round((1 - current / original) * 100))
      : 0;

  const handleReserve = async () => {
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: food.id,
          buyerId: userId,
          quantity: 1,
        }),
      });
      onReserved();
    } catch (e: any) {
      setError(e.message || "Failed to reserve meal. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.destination}>
      <View style={s.destinationHeader}>
        <Pressable onPress={onBack} style={s.backButton} accessibilityLabel="Back">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.destinationTitle} numberOfLines={1}>
          {food.name}
        </Text>
        <Pressable onPress={onMenu} style={s.backButton} accessibilityLabel="Menu">
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.destinationBody} showsVerticalScrollIndicator={false}>
        <View style={s.detailPhoto}>
          <FallbackPhoto
            uri={imageUrl(food.image_url)}
            fallback={foodPhoto(food.name)}
            style={s.detailImage}
          />
          {discount > 0 && (
            <View style={s.detailDiscountBadge}>
              <Text style={s.detailDiscountText}>Save {discount}%</Text>
            </View>
          )}
        </View>

        <Text style={s.detailName}>{food.name}</Text>

        <Pressable onPress={() => onOpenShop(food.shop_id)} style={s.shopLinkRow}>
          <Ionicons name="storefront-outline" size={16} color={colors.primary} />
          <Text style={s.shopLinkText}>{food.shop_name}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.muted} />
        </Pressable>

        <Text style={s.detailMeta}>
          <Ionicons name="location-outline" size={13} color={colors.muted} /> {food.address}
        </Text>

        <View style={s.priceBox}>
          <View>
            <Text style={s.detailPrice}>
              {current === 0 ? "0đ (Free)" : `${current.toLocaleString("vi-VN")}₫`}
            </Text>
            {original > current && (
              <Text style={s.originalPrice}>
                Original: {original.toLocaleString("vi-VN")}₫
              </Text>
            )}
          </View>
          <View style={s.quantityPill}>
            <Text style={s.quantityPillText}>
              {food.quantity_available} left
            </Text>
          </View>
        </View>

        {food.description ? (
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>Description</Text>
            <Text style={s.infoCardBody}>{food.description}</Text>
          </View>
        ) : null}

        {food.storage_instructions ? (
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>Storage & Preparation</Text>
            <Text style={s.infoCardBody}>{food.storage_instructions}</Text>
          </View>
        ) : null}

        <View style={s.guaranteeCard}>
          <Ionicons name="time-outline" size={22} color={colors.deepGreen} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.guaranteeTitle}>20-Minute Hold Guarantee</Text>
            <Text style={s.guaranteeText}>
              No prepayment required. When reserved, your food is held at the counter for 20 minutes.
            </Text>
          </View>
        </View>

        {!!error && <Text style={s.errorBanner}>{error}</Text>}

        <Pressable
          style={[s.cta, busy && { opacity: 0.7 }]}
          disabled={busy}
          onPress={() => void handleReserve()}
        >
          <Text style={s.ctaText}>
            {busy ? "Holding meal…" : "I’m on my way · Hold a meal"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ==========================================
// MY ORDERS VIEW COMPONENT
// ==========================================

function OrdersView({
  userId,
  onBack,
  onMenu,
  onExplore,
  onReport,
}: {
  userId: string;
  onBack: () => void;
  onMenu: () => void;
  onExplore: () => void;
  onReport: (orderId?: string) => void;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = () => {
    setLoading(true);
    requestJson<{ items: any[] }>(`/api/reservations?buyerId=${encodeURIComponent(userId)}`)
      .then((val) => {
        setRows(val.items ?? []);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const handleCancel = (reservationId: string) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to release this held meal back to the community?",
      [
        { text: "Keep Hold", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancellingId(reservationId);
            try {
              await requestJson(`/api/reservations/${reservationId}`, {
                method: "DELETE",
              });
              loadOrders();
            } catch (e: any) {
              Alert.alert("Cancellation Error", e.message);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={s.destination}>
      <View style={s.destinationHeader}>
        <Pressable onPress={onBack} style={s.backButton} accessibilityLabel="Back">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.destinationTitle}>My Orders & Pickups</Text>
        <Pressable onPress={onMenu} style={s.backButton} accessibilityLabel="Menu">
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.destinationBody} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>Could not load orders</Text>
            <Text style={s.emptyText}>{error}</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="receipt-outline" size={36} color={colors.primary} />
            <Text style={s.emptyTitle}>No active reservations</Text>
            <Text style={s.emptyText}>
              Find food surplus and flash sales near you to start saving meals.
            </Text>
            <Pressable onPress={onExplore} style={s.primaryBtnSmall}>
              <Text style={s.primaryBtnText}>Explore meals nearby</Text>
            </Pressable>
          </View>
        ) : (
          rows.map((row) => {
            const isHeld = row.status === "held";
            const isCompleted = row.status === "picked_up" || row.status === "confirmed";
            const isCancelled = row.status === "cancelled" || row.status === "expired";

            return (
              <View key={String(row.id)} style={s.orderCardDetailed}>
                <View style={s.orderCardHeader}>
                  <Text style={s.orderCardId}>
                    Order #{String(row.order_id || row.id).slice(0, 8)}
                  </Text>
                  <View
                    style={[
                      s.statusPill,
                      isHeld
                        ? s.statusPillActive
                        : isCompleted
                        ? s.statusPillDone
                        : s.statusPillCancel,
                    ]}
                  >
                    <Text
                      style={[
                        s.statusPillText,
                        isHeld
                          ? s.statusTextActive
                          : isCompleted
                          ? s.statusTextDone
                          : s.statusTextCancel,
                      ]}
                    >
                      {isHeld
                        ? "Held for 20m"
                        : isCompleted
                        ? "Completed"
                        : String(row.status)}
                    </Text>
                  </View>
                </View>

                <Text style={s.orderItemText}>
                  {row.quantity} portion(s) reserved
                </Text>

                {isHeld && (
                  <View style={s.pickupQrBox}>
                    <Ionicons name="qr-code-outline" size={28} color={colors.deepGreen} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={s.pickupCodeLabel}>PICKUP TOKEN CODE</Text>
                      <Text style={s.pickupCodeValue}>
                        {String(row.pickup_qr_token || "PENDING").slice(0, 13).toUpperCase()}
                      </Text>
                      <Text style={s.pickupCodeHelp}>
                        Show this token at the store counter to collect your meal.
                      </Text>
                    </View>
                  </View>
                )}

                <View style={s.orderActionsRow}>
                  {isHeld && (
                    <Pressable
                      onPress={() => handleCancel(row.id)}
                      disabled={cancellingId === row.id}
                      style={s.cancelHoldBtn}
                    >
                      <Text style={s.cancelHoldText}>
                        {cancellingId === row.id ? "Cancelling…" : "Cancel hold"}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => onReport(row.order_id || row.id)}
                    style={s.reportIssueBtn}
                  >
                    <Ionicons name="flag-outline" size={13} color={colors.ink} />
                    <Text style={s.reportIssueText}>Report / Help</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ==========================================
// COMPLAINTS & REFUNDS VIEW COMPONENT
// ==========================================

function ComplaintsView({
  userId,
  initialOrderId,
  onBack,
  onMenu,
}: {
  userId: string;
  initialOrderId?: string;
  onBack: () => void;
  onMenu: () => void;
}) {
  const [orderId, setOrderId] = useState(initialOrderId || "");
  const [reason, setReason] = useState("Spoiled or expired food");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);

  const REASONS = [
    "Spoiled or expired food",
    "Wrong meal portion or item",
    "Shop was closed upon pickup",
    "Undeclared allergen issue",
    "Packaging or hygiene issue",
  ];

  const loadComplaints = () => {
    requestJson<{ items: any[] }>(`/api/complaints?reporterId=${encodeURIComponent(userId)}`)
      .then((val) => setComplaints(val.items || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadComplaints();
  }, [userId]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Missing Details", "Please describe what happened with your order.");
      return;
    }
    setSubmitting(true);
    try {
      await requestJson("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim() || Crypto.randomUUID(),
          reporterId: userId,
          reason,
          description: description.trim(),
        }),
      });
      setDescription("");
      Alert.alert("Report Submitted", "Our safety team and the store have received your feedback.");
      loadComplaints();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.destination}>
      <View style={s.destinationHeader}>
        <Pressable onPress={onBack} style={s.backButton} accessibilityLabel="Back">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.destinationTitle}>Complaint &amp; Refund Policy</Text>
        <Pressable onPress={onMenu} style={s.backButton} accessibilityLabel="Menu">
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.destinationBody} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Text style={s.infoCardTitle}>ResQ Buyer Protection</Text>
          <Text style={s.infoCardBody}>
            If your rescued meal is spoiled, mislabeled, or the shop was closed during the pickup window, submit a report below.
          </Text>
        </View>

        <Text style={s.sectionHeading}>Submit a Problem Report</Text>

        <View style={s.fieldBlock}>
          <Text style={s.fieldLabel}>Order ID (optional)</Text>
          <TextInput
            style={s.textInput}
            value={orderId}
            onChangeText={setOrderId}
            placeholder="e.g. 44444444-4444..."
            placeholderTextColor="#819087"
          />
        </View>

        <View style={s.fieldBlock}>
          <Text style={s.fieldLabel}>Reason for complaint</Text>
          <View style={s.reasonChips}>
            {REASONS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setReason(item)}
                style={[s.chip, reason === item && s.chipActive]}
              >
                <Text style={[s.chipText, reason === item && s.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.fieldBlock}>
          <Text style={s.fieldLabel}>Detailed explanation</Text>
          <TextInput
            style={[s.textInput, { height: 90, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Explain what happened at pickup..."
            placeholderTextColor="#819087"
            multiline
          />
        </View>

        <Pressable
          style={[s.cta, submitting && { opacity: 0.6 }]}
          disabled={submitting}
          onPress={() => void handleSubmit()}
        >
          <Text style={s.ctaText}>{submitting ? "Submitting…" : "Submit Report"}</Text>
        </Pressable>

        {complaints.length > 0 && (
          <>
            <Text style={[s.sectionHeading, { marginTop: 20 }]}>Your Past Reports</Text>
            {complaints.map((c) => (
              <View key={c.id} style={s.complaintCard}>
                <View style={s.complaintHeader}>
                  <Text style={s.complaintReason}>{c.reason}</Text>
                  <Text style={s.complaintStatus}>{String(c.status).toUpperCase()}</Text>
                </View>
                <Text style={s.complaintDesc}>{c.description}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ==========================================
// FOOD SAFETY & STORAGE VIEW COMPONENT
// ==========================================

function SafetyPolicyView({
  onBack,
  onMenu,
}: {
  onBack: () => void;
  onMenu: () => void;
}) {
  return (
    <View style={s.destination}>
      <View style={s.destinationHeader}>
        <Pressable onPress={onBack} style={s.backButton} accessibilityLabel="Back">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.destinationTitle}>Food Safety &amp; Storage</Text>
        <Pressable onPress={onMenu} style={s.backButton} accessibilityLabel="Menu">
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.destinationBody} showsVerticalScrollIndicator={false}>
        <View style={s.policyCard}>
          <View style={s.policyIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.deepGreen} />
          </View>
          <Text style={s.policyTitle}>ATVSTP Certified Standards</Text>
          <Text style={s.policyText}>
            All food shops on ResQ must provide valid Food Hygiene and Safety certifications verified before publishing surplus items.
          </Text>
        </View>

        <View style={s.policyCard}>
          <View style={s.policyIcon}>
            <Ionicons name="time" size={24} color={colors.deepGreen} />
          </View>
          <Text style={s.policyTitle}>2-Hour Pickup Rule</Text>
          <Text style={s.policyText}>
            Prepared hot dishes must be consumed or refrigerated within 2 hours of collection to avoid bacterial contamination.
          </Text>
        </View>

        <View style={s.policyCard}>
          <View style={s.policyIcon}>
            <Ionicons name="flame" size={24} color={colors.deepGreen} />
          </View>
          <Text style={s.policyTitle}>Safe Reheating Instructions</Text>
          <Text style={s.policyText}>
            Microwave for 2 full minutes or reheat in stove until core temperature reaches 75°C before eating.
          </Text>
        </View>

        <View style={s.policyCard}>
          <View style={s.policyIcon}>
            <Ionicons name="snow" size={24} color={colors.deepGreen} />
          </View>
          <Text style={s.policyTitle}>Refrigerator &amp; Freezer Shelf Life</Text>
          <Text style={s.policyText}>
            Bakery: 1–2 days at room temperature. Meals: up to 24h chilled (4°C), or up to 7 days in the freezer (-18°C).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================================
// HELP & SUPPORT VIEW COMPONENT
// ==========================================

function HelpCenterView({
  onBack,
  onMenu,
  onOrders,
  onComplaints,
}: {
  onBack: () => void;
  onMenu: () => void;
  onOrders: () => void;
  onComplaints: () => void;
}) {
  return (
    <View style={s.destination}>
      <View style={s.destinationHeader}>
        <Pressable onPress={onBack} style={s.backButton} accessibilityLabel="Back">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.destinationTitle}>Help &amp; Support</Text>
        <Pressable onPress={onMenu} style={s.backButton} accessibilityLabel="Menu">
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.destinationBody} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionHeading}>Emergency Support</Text>

        <View style={s.helpCard}>
          <Ionicons name="call-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.helpCardTitle}>Support Hotline</Text>
            <Text style={s.helpCardSub}>1900-RESQ (8:00 AM – 10:00 PM daily)</Text>
          </View>
        </View>

        <View style={s.helpCard}>
          <Ionicons name="mail-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.helpCardTitle}>Email Helpdesk</Text>
            <Text style={s.helpCardSub}>support@resq.food</Text>
          </View>
        </View>

        <Text style={[s.sectionHeading, { marginTop: 16 }]}>Quick Actions</Text>

        <Pressable onPress={onOrders} style={s.quickLinkBtn}>
          <Ionicons name="receipt-outline" size={18} color={colors.primary} />
          <Text style={s.quickLinkText}>View my current order QR tokens</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <Pressable onPress={onComplaints} style={s.quickLinkBtn}>
          <Ionicons name="flag-outline" size={18} color={colors.primary} />
          <Text style={s.quickLinkText}>Submit a complaint or refund claim</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <Text style={[s.sectionHeading, { marginTop: 16 }]}>Frequently Asked Questions</Text>

        <View style={s.faqItem}>
          <Text style={s.faqQ}>How does meal hold work?</Text>
          <Text style={s.faqA}>
            When you tap &quot;Hold a meal&quot;, the shop holds that item for 20 minutes without upfront payment. Show your pickup code at the counter.
          </Text>
        </View>

        <View style={s.faqItem}>
          <Text style={s.faqQ}>What if the store runs out of food?</Text>
          <Text style={s.faqA}>
            If you arrive within the 20-minute window and the store cannot fulfill your meal, report it in Complaints to help us flag the vendor.
          </Text>
        </View>

        <View style={s.faqItem}>
          <Text style={s.faqQ}>What is 0đ Sharing Corner?</Text>
          <Text style={s.faqA}>
            It is a community donation initiative where certified stores share fresh excess portions at 0đ for anyone who needs them.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================================
// ROOT APP
// ==========================================

export default function App() {
  return (
    <SafeAreaProvider>
      <ClientApp />
    </SafeAreaProvider>
  );
}

// ==========================================
// STYLES
// ==========================================

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: colors.white,
  },
  loadingText: {
    color: colors.muted,
    fontSize: fontSizes.bodySmall,
    marginTop: 12,
  },
  errorTitle: {
    color: colors.ink,
    fontSize: fontSizes.title,
    fontWeight: "800",
  },
  errorText: {
    color: colors.muted,
    fontSize: fontSizes.bodySmall,
    textAlign: "center",
    marginTop: 8,
  },
  globalBanner: {
    backgroundColor: "#e8f3ea",
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#d5e5d8",
  },
  globalBannerText: {
    color: colors.primary,
    fontSize: fontSizes.caption,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  destination: {
    flex: 1,
    backgroundColor: colors.white,
  },
  destinationHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 24,
    color: colors.ink,
    marginTop: -3,
  },
  destinationTitle: {
    color: colors.ink,
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  destinationBody: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  detailPhoto: {
    height: 220,
    borderRadius: 18,
    backgroundColor: colors.pale,
    overflow: "hidden",
    position: "relative",
  },
  detailImage: {
    width: "100%",
    height: "100%",
  },
  detailDiscountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailDiscountText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 12,
  },
  detailName: {
    color: colors.ink,
    fontSize: fontSizes.header,
    fontWeight: "900",
    marginTop: 4,
  },
  shopLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shopLinkText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  detailMeta: {
    color: colors.muted,
    fontSize: fontSizes.bodySmall,
  },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    marginTop: 4,
  },
  detailPrice: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  originalPrice: {
    color: colors.muted,
    fontSize: 12,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  quantityPill: {
    backgroundColor: colors.pale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quantityPillText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: "#f7f9f7",
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  infoCardTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  infoCardBody: {
    color: "#54685b",
    fontSize: 13,
    lineHeight: 18,
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#eaf3eb",
    padding: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  guaranteeTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  guaranteeText: {
    color: "#4a6353",
    fontSize: 12,
    lineHeight: 16,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
  },
  errorBanner: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#f7f9f7",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  primaryBtnSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 6,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  orderCardDetailed: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    backgroundColor: colors.white,
  },
  orderCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderCardId: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillActive: { backgroundColor: "#eaf3ea" },
  statusPillDone: { backgroundColor: "#f0f4f1" },
  statusPillCancel: { backgroundColor: "#fee2e2" },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  statusTextActive: { color: colors.primary },
  statusTextDone: { color: colors.muted },
  statusTextCancel: { color: "#dc2626" },
  orderItemText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  pickupQrBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5fbf6",
    borderWidth: 1,
    borderColor: "#cde5d3",
    borderRadius: 12,
    padding: 12,
  },
  pickupCodeLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pickupCodeValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  pickupCodeHelp: {
    color: "#54685b",
    fontSize: 11,
  },
  orderActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelHoldBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  cancelHoldText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "700",
  },
  reportIssueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.pale,
  },
  reportIssueText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeading: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    color: "#4f6155",
    fontSize: 12,
    fontWeight: "700",
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.ink,
    fontSize: 13,
  },
  reasonChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.ink,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: "700",
  },
  complaintCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  complaintReason: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  complaintStatus: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  complaintDesc: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  policyCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  policyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  policyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  policyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
  },
  helpCardTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  helpCardSub: {
    color: colors.muted,
    fontSize: 12,
  },
  quickLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickLinkText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  faqItem: {
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 10,
    gap: 4,
  },
  faqQ: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  faqA: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
