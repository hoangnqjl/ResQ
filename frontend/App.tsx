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
// Module 1 (US-A1 -> A4)
import BuyerProfileScreen from "./src/screens/module_1/BuyerProfileScreen";
import SellerProfileScreen from "./src/screens/module_1/SellerProfileScreen";
import EditProfileScreen from "./src/screens/module_1/EditProfileScreen";
import IncognitoModeScreen from "./src/screens/module_1/IncognitoModeScreen";
import PrivacySettingsScreen from "./src/screens/module_1/PrivacySettingsScreen";
import AnonymousProfilePreviewScreen from "./src/screens/module_1/AnonymousProfilePreviewScreen";
import FoodAllergiesScreen from "./src/screens/module_1/FoodAllergiesScreen";
import DietScreen from "./src/screens/module_1/DietScreen";
import NotificationRadiusScreen from "./src/screens/module_1/NotificationRadiusScreen";
import CertificateScreen from "./src/screens/module_1/CertificateScreen";
import StoreLocationScreen from "./src/screens/module_1/StoreLocationScreen";
import {
  BuyerSetupScreen,
  FoodPreferencesScreen,
  SellerSetupScreen,
  ShopSetupScreen,
  WelcomeScreen,
} from "./src/screens/module_1/OnboardingScreens";

// Module 2 (US-B1 -> B5)
import HomeScreen, { type Food } from "./src/screens/module_2/HomeScreen";
import ExploreScreen from "./src/screens/module_2/ExploreScreen";
import HeatmapScreen from "./src/screens/module_2/HeatmapScreen";
import SavedScreen from "./src/screens/module_2/SavedScreen";
import FoodShopListScreen from "./src/screens/module_2/FoodShopListScreen";
import SearchSettingsScreen from "./src/screens/module_2/SearchSettingsScreen";
import ShopDetailScreen from "./src/screens/module_2/ShopDetailScreen";
import ShopReviewsScreen from "./src/screens/module_2/ShopReviewsScreen";
import SetDropAlertScreen from "./src/screens/module_2/SetDropAlertScreen";
import MyDropAlertScreen from "./src/screens/module_2/MyDropAlertScreen";
import DropAlertCenterScreen from "./src/screens/module_2/DropAlertCenterScreen";
import SharingCornerScreen from "./src/screens/module_2/SharingCornerScreen";
import SharingStationMapScreen from "./src/screens/module_2/SharingStationMapScreen";
import BudgetMysteryBagsScreen from "./src/screens/module_2/BudgetMysteryBagsScreen";
import MysteryBagGuideScreen from "./src/screens/module_2/MysteryBagGuideScreen";
import RescueHotspotsScreen from "./src/screens/module_2/RescueHotspotsScreen";

// Module 3 (US-C1 -> C3)
import FoodSafetyCountdownScreen from "./src/screens/module_3/FoodSafetyCountdownScreen";
import ActualProductLabelScreen from "./src/screens/module_3/ActualProductLabelScreen";
import ExpirationInfoScreen from "./src/screens/module_3/ExpirationInfoScreen";
import StorageInstructionsScreen from "./src/screens/module_3/StorageInstructionsScreen";
import ReheatingInstructionsScreen from "./src/screens/module_3/ReheatingInstructionsScreen";
import RefrigerationRequirementScreen from "./src/screens/module_3/RefrigerationRequirementScreen";
import ExpirationWarningScreen from "./src/screens/module_3/ExpirationWarningScreen";
import FoodOriginInfoScreen from "./src/screens/module_3/FoodOriginInfoScreen";
import SellerCommitmentScreen from "./src/screens/module_3/SellerCommitmentScreen";
import TermsComplaintRightsScreen from "./src/screens/module_3/TermsComplaintRightsScreen";
import ComplaintRefundPolicyScreen from "./src/screens/module_3/ComplaintRefundPolicyScreen";

// Module 4 (US-D1 -> D4)
import MealDetailReservationScreen from "./src/screens/module_4/MealDetailReservationScreen";
import ConfirmSpotReservationScreen from "./src/screens/module_4/ConfirmSpotReservationScreen";
import ReservationTimeScreen from "./src/screens/module_4/ReservationTimeScreen";
import YourOrderWaitingScreen from "./src/screens/module_4/YourOrderWaitingScreen";
import ConfirmDepositScreen from "./src/screens/module_4/ConfirmDepositScreen";
import PayDepositScreen from "./src/screens/module_4/PayDepositScreen";
import DepositReceiptScreen from "./src/screens/module_4/DepositReceiptScreen";
import PickupTimeSlotScreen from "./src/screens/module_4/PickupTimeSlotScreen";
import OrderDetailsSlotScreen from "./src/screens/module_4/OrderDetailsSlotScreen";
import WaitlistQueueScreen from "./src/screens/module_4/WaitlistQueueScreen";
import OverdueOrderScreen from "./src/screens/module_4/OverdueOrderScreen";
import CancelReleaseScreen from "./src/screens/module_4/CancelReleaseScreen";
import SellerStudioScreen from "./src/screens/module_6/SellerStudioScreen";
import ShiftImpactScreen from "./src/screens/module_7/ShiftImpactScreen";
import SellerDashboardScreen from "./src/screens/module_7/SellerDashboardScreen";
import TrustComplaintsScreen from "./src/screens/module_8/TrustComplaintsScreen";
import {
  getFoodSafetyDetail,
  holdSpotReservation,
  payReservationDeposit,
  selectPickupSlot,
  cancelAndReleaseOrder,
  getFoodWaitlist,
  joinFoodWaitlist,
  type FoodSafetyDetail,
  type SpotReservationResult,
  type DepositPaymentResult,
  type WaitlistStatus,
} from "./src/services/foodSafetyReservationApi";

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
  | "explore"
  | "maps"
  | "saved"
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
  | "incognitoMode"
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
  | "accountSettings"
  | "buyerProfile"
  | "guestProfile"
  | "sellerProfile"
  // Module 3
  | "foodSafetyCountdown"
  | "actualProductLabel"
  | "expirationInfo"
  | "storageInstructions"
  | "reheatingInstructions"
  | "refrigerationRequirement"
  | "expirationWarning"
  | "foodOriginInfo"
  | "sellerCommitment"
  | "termsComplaintRights"
  | "complaintRefundPolicy"
  // Module 4
  | "mealDetailReservation"
  | "confirmSpotReservation"
  | "reservationTime"
  | "yourOrderWaiting"
  | "confirmDeposit"
  | "payDeposit"
  | "depositReceipt"
  | "pickupTimeSlot"
  | "orderDetailsSlot"
  | "waitlistQueue"
  | "overdueOrder"
  | "cancelRelease"
  // Modules 6–8
  | "sellerStudio"
  | "shiftImpact"
  | "sellerDashboard"
  | "trustComplaints";

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
  const [selectedSafetyFood, setSelectedSafetyFood] = useState<FoodSafetyDetail | null>(null);
  const [activeReservation, setActiveReservation] = useState<SpotReservationResult | null>(null);
  const [activeDeposit, setActiveDeposit] = useState<DepositPaymentResult | null>(null);
  const [activeWaitlist, setActiveWaitlist] = useState<WaitlistStatus | null>(null);
  const [activePickupSlot, setActivePickupSlot] = useState("");

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
        try {
          current = await requestJson<Profile>("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(blankProfile(id)),
          });
        } catch {
          current = blankProfile(id);
        }
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

  useEffect(() => {
    let current = true;
    if (!selectedFood) {
      setSelectedSafetyFood(null);
      return () => { current = false; };
    }
    void getFoodSafetyDetail(selectedFood.id).then((food) => {
      if (current) setSelectedSafetyFood(food);
    });
    return () => { current = false; };
  }, [selectedFood?.id]);

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
    try {
      const result = await requestJson<Profile>(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, ...changes }),
      });
      setProfile(result);
    } catch {
      // Fallback offline mock update
      setProfile((prev) => (prev ? { ...prev, ...changes } : prev));
    }
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

  const createShop = async (name: string, address: string, storeType: string, phone: string) => {
    try {
      await updateProfile({ role: "seller", ...(phone ? { phone } : {}) });
      await requestJson("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: userId,
          name,
          address,
          description: storeType,
        }),
      });
    } catch {
      // Offline fallback: save local profile role as seller and allow continuation
      await updateProfile({ role: "seller", ...(phone ? { phone } : {}) });
    }
    await finishOnboarding();
    setActiveTab("Home");
    setPage("sellerDashboard");
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
      setHistory([]);
      setPage(route === "maps" ? "maps" : route === "saved" ? "saved" : route === "explore" ? "explore" : route === "profile" ? (profile?.role === "seller" ? "sellerProfile" : "buyerProfile") : "home");
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
      sellerStudio: "sellerStudio",
      shiftImpact: "shiftImpact",
      trustComplaints: "trustComplaints",
      buyerSetup: "foodPreferences",
      editProfile: "editProfile",
      certificate: "certificate",
      storeLocation: "storeLocation",
      help: "help",
      settings: "settings",
      accountSettings: "accountSettings",
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

  const openSellerDashboard = async () => {
    try {
      const result = await requestJson<{ items: Array<{ id: string; name: string }> }>(
        `/api/shops?ownerId=${encodeURIComponent(userId)}`
      );
      if (result.items?.length) {
        setDrawerOpen(false);
        setActiveTab("Home");
        setPage("sellerDashboard");
        setHistory([]);
      } else {
        setDrawerOpen(false);
        setActiveTab("Home");
        setPage("sellerDashboard");
        setHistory([]);
      }
    } catch {
      setDrawerOpen(false);
      setActiveTab("Home");
      setPage("sellerDashboard");
      setHistory([]);
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
      <SafeAreaView style={s.safe} edges={page === "maps" ? ["left", "right"] : ["top", "bottom", "left", "right"]}>
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
        {/* ONBOARDING & SETUP SCREENS            */}
        {/* ===================================== */}
        {page === "welcome" && (
          <WelcomeScreen
            onChoose={(role) => {
              if (role === "buyer") {
                navigateTo("buyerGuide");
              } else {
                navigateTo("sellerGuide");
              }
            }}
          />
        )}

        {page === "buyerGuide" && (
          <BuyerSetupScreen
            onBack={() => goBack()}
            onPreferences={() => navigateTo("foodPreferences")}
            onExplore={() => void finishOnboarding()}
          />
        )}

        {page === "foodPreferences" && (
          <FoodPreferencesScreen
            initialName={profile.full_name}
            initialAllergies={profile.allergies}
            initialDiets={profile.dietary_preferences}
            onBack={() => goBack()}
            onSave={(name, allergies, diets) => saveBuyerSetup(name, allergies, diets)}
          />
        )}

        {page === "sellerGuide" && (
          <SellerSetupScreen
            onBack={() => goBack()}
            onSetup={() => navigateTo("shopSetup")}
            onDashboard={() => void finishOnboarding()}
          />
        )}

        {page === "shopSetup" && (
          <ShopSetupScreen
            onBack={() => goBack()}
            onSave={(name, address, storeType, phone) => createShop(name, address, storeType, phone)}
            busy={false}
          />
        )}

        {/* ===================================== */}
        {/* MODULE 1: PROFILE & SETTINGS          */}
        {/* ===================================== */}
        {page === "buyerProfile" && (
          <BuyerProfileScreen
            userName={profile.full_name}
            isIncognito={profile.is_incognito}
            onBack={() => goBack()}
            onOpenMenu={() => setDrawerOpen(true)}
            onNavigateQuickAction={(act) => {
              if (act === "allergies") navigateTo("foodAllergies");
              else if (act === "diet") navigateTo("diet");
              else if (act === "radius") navigateTo("notificationRadius");
              else if (act === "privacy") navigateTo("privacy");
            }}
            onEditProfile={() => navigateTo("editProfile")}
            activeTab={activeTab}
            onTabChange={(tab) => handleNavigate(tab.toLowerCase())}
          />
        )}

        {page === "guestProfile" && (
          <BuyerProfileScreen
            userName="Tran Minh Anh"
            isGuest
            onBack={() => goBack()}
            activeTab={activeTab}
            onTabChange={(tab) => handleNavigate(tab.toLowerCase())}
            onReport={() => setBanner("Profile report submitted for review.")}
          />
        )}

        {page === "sellerProfile" && (
          <SellerProfileScreen
            onBack={() => goBack()}
            onEditStore={() => navigateTo("storeLocation")}
            onItemPress={(item) => {
              if (item === "certificate") navigateTo("certificate");
              else if (item === "location") navigateTo("storeLocation");
            }}
          />
        )}

        {page === "foodAllergies" && (
          <FoodAllergiesScreen
            initialAllergies={profile.allergies}
            onBack={() => goBack()}
            onSave={async (allergies) => {
              await updateProfile({ allergies });
              goBack();
            }}
          />
        )}

        {page === "diet" && (
          <DietScreen
            initialDiet={profile.dietary_preferences[0]}
            onBack={() => goBack()}
            onSave={async (diet) => {
              await updateProfile({ dietary_preferences: [diet] });
              goBack();
            }}
          />
        )}

        {page === "privacy" && (
          <PrivacySettingsScreen
            userId={userId}
            incognitoEnabled={profile.is_incognito}
            onBack={() => goBack()}
            onOpenIncognito={() => navigateTo("incognitoMode")}
          />
        )}

        {page === "incognitoMode" && (
          <IncognitoModeScreen
            initialEnabled={profile.is_incognito}
            onBack={() => goBack()}
            onToggle={async (enabled) => { await updateProfile({ is_incognito: enabled }); }}
            onOpenPreview={() => navigateTo("incognitoPreview")}
          />
        )}

        {page === "incognitoPreview" && (
          <AnonymousProfilePreviewScreen onBack={() => goBack()} />
        )}

        {page === "notificationRadius" && (
          <NotificationRadiusScreen onBack={() => goBack()} onSave={() => goBack()} />
        )}

        {page === "editProfile" && (
          <EditProfileScreen
            initialData={{ fullName: profile.full_name, phone: profile.phone, address: profile.address }}
            onBack={() => goBack()}
            onSave={async (updated) => {
              await updateProfile({ full_name: updated.fullName, phone: updated.phone, email: updated.email, address: updated.address });
              goBack();
            }}
          />
        )}

        {page === "certificate" && (
          <CertificateScreen onBack={() => goBack()} onSubmit={() => goBack()} />
        )}

        {page === "storeLocation" && (
          <StoreLocationScreen onBack={() => goBack()} />
        )}

        {/* ===================================== */}
        {/* MODULE 2: DISCOVERY, SEARCH & COMMUNITY */}
        {/* ===================================== */}
        {page === "home" && (
          <HomeScreen
            userId={userId}
            userName={profile.full_name}
            role={profile.role}
            onOpenSellerDashboard={() => { setActiveTab("Home"); setHistory([]); setPage("sellerDashboard"); }}
            activeTab={activeTab}
            onOpenMenu={() => setDrawerOpen(true)}
            onOpenAlerts={() => navigateTo("myDropAlert")}
            onTabChange={(tab) => handleNavigate(tab.toLowerCase())}
            onOpenFood={(food) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
          />
        )}

        {page === "sellerDashboard" && (
          <SellerDashboardScreen
            userId={userId}
            onBack={() => { setPage("home"); setActiveTab("Home"); setHistory([]); }}
            onPostSurplus={() => navigateTo("sellerStudio")}
            onScanQr={() => navigateTo("shiftImpact")}
            onMenuManager={() => navigateTo("sellerStudio")}
            onShiftReport={() => navigateTo("shiftImpact")}
            onOpenSettings={() => navigateTo("accountSettings")}
          />
        )}

        {page === "foodDetail" && selectedFood && (
          <FoodDetailView
            food={selectedFood}
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
            onSafety={() => navigateTo("foodSafetyCountdown")}
            onOpenShop={(shopId) => {
              setSelectedShopId(shopId);
              navigateTo("shopDetail");
            }}
            onReserved={() => navigateTo("mealDetailReservation")}
          />
        )}

        {page === "orders" && (
          <OrdersView
            userId={userId}
            onBack={() => goBack()}
            onMenu={() => setDrawerOpen(true)}
            onExplore={() => {
              setActiveTab("Home");
              setPage("home");
            }}
            onReport={(oid) => {
              setPrefilledOrderId(oid);
              navigateTo("complaints");
            }}
          />
        )}

        {page === "explore" && (
          <ExploreScreen
            userId={userId}
            activeTab={activeTab}
            onTabChange={(tab) => handleNavigate(tab.toLowerCase())}
            onOpenSettings={() => navigateTo("settings")}
            onOpenSharing={() => navigateTo("sharing")}
            onOpenFood={(food: any) => {
              setSelectedFood(food);
              navigateTo("foodDetail");
            }}
          />
        )}

        {page === "maps" && (
          <HeatmapScreen userId={userId} activeTab={activeTab} onTabChange={(tab) => handleNavigate(tab.toLowerCase())} onOpenShop={(shopId) => { setSelectedShopId(shopId); navigateTo("shopDetail"); }} onOpenHotspots={() => navigateTo("rescueHotspots")} />
        )}

        {page === "saved" && (
          <SavedScreen userId={userId} onOpenMenu={() => setDrawerOpen(true)} onTabChange={(tab) => handleNavigate(tab.toLowerCase())} onOpenShop={(shopId) => { setSelectedShopId(shopId); navigateTo("shopDetail"); }} onOpenFood={(food) => { setSelectedFood(food); navigateTo("foodDetail"); }} />
        )}

        {page === "settings" && (
          <SearchSettingsScreen userId={userId} onBack={() => goBack()} />
        )}

        {page === "accountSettings" && (
          <AccountSettingsView role={profile.role} onBack={() => goBack()} onSwitchRole={() => void handleMerchantToggle()} />
        )}

        {page === "sharing" && (
          <SharingCornerScreen
            userId={userId}
            onBack={() => goBack()}
            onOpenMap={() => navigateTo("stationMap")}
          />
        )}

        {page === "stationMap" && (
          <SharingStationMapScreen onBack={() => goBack()} onOpenShop={(shopId) => { setSelectedShopId(shopId); navigateTo("shopDetail"); }} />
        )}

        {page === "budgetBags" && (
          <BudgetMysteryBagsScreen
            userId={userId}
            onBack={() => goBack()}
            onOpenGuide={() => navigateTo("mysteryBagGuide")}
          />
        )}

        {page === "mysteryBagGuide" && (
          <MysteryBagGuideScreen onBack={() => goBack()} onBrowse={() => navigateTo("budgetBags")} />
        )}

        {page === "rescueHotspots" && (
          <RescueHotspotsScreen onBack={() => goBack()} onOpenMap={() => navigateTo("stationMap")} />
        )}

        {page === "myDropAlert" && (
          <MyDropAlertScreen
            userId={userId}
            onBack={() => goBack()}
            onManage={() => navigateTo("setDropAlert")}
            onOpenFood={(food) => { setSelectedFood(food); navigateTo("foodDetail"); }}
          />
        )}

        {page === "setDropAlert" && (
          <SetDropAlertScreen userId={userId} onBack={() => goBack()} />
        )}

        {page === "dropAlert" && (
          <DropAlertCenterScreen userId={userId} onBack={() => goBack()} onCreateAlert={() => navigateTo("setDropAlert")} />
        )}

        {page === "shopDetail" && (
          <ShopDetailScreen
            shopId={selectedShopId || "shop-corner-kitchen"}
            userId={userId}
            onBack={() => goBack()}
            onOpenSettings={() => navigateTo("settings")}
            onOpenReviews={(shopId) => { setSelectedShopId(shopId); navigateTo("shopReviews"); }}
            onOpenFood={(food) => { setSelectedFood(food); navigateTo("foodDetail"); }}
            onOpenFoodList={(shopId) => { setSelectedShopId(shopId); navigateTo("foodShopList"); }}
          />
        )}

        {page === "shopReviews" && (
          <ShopReviewsScreen
            shopId={selectedShopId || "shop-corner-kitchen"}
            userId={userId}
            onBack={() => goBack()}
            onOpenReviewerProfile={() => navigateTo("guestProfile")}
          />
        )}

        {page === "foodShopList" && (
          <FoodShopListScreen shopId={selectedShopId} userId={userId} onBack={() => goBack()} onOpenFood={(food) => { setSelectedFood({ ...food, description: food.description ?? undefined, image_url: food.image_url ?? undefined, verified: food.verified ?? false, storage_instructions: food.storage_instructions ?? undefined }); navigateTo("foodDetail"); }} />
        )}
        
        
        {/* ===================================== */}
        {/* MODULE 3: INDIVIDUAL SCREENS (FIGMA) */}
        {/* ===================================== */}
        {page === "foodSafetyCountdown" && (
          <FoodSafetyCountdownScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "actualProductLabel" && (
          <ActualProductLabelScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "expirationInfo" && (
          <ExpirationInfoScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "storageInstructions" && (
          <StorageInstructionsScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "reheatingInstructions" && (
          <ReheatingInstructionsScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "refrigerationRequirement" && (
          <RefrigerationRequirementScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "expirationWarning" && (
          <ExpirationWarningScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "foodOriginInfo" && (
          <FoodOriginInfoScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "sellerCommitment" && (
          <SellerCommitmentScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "termsComplaintRights" && (
          <TermsComplaintRightsScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "complaintRefundPolicy" && (
          <ComplaintRefundPolicyScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}

        {/* ===================================== */}
        {/* MODULE 4: INDIVIDUAL SCREENS (FIGMA) */}
        {/* ===================================== */}
        {page === "mealDetailReservation" && (
          <MealDetailReservationScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "confirmSpotReservation" && (
          <ConfirmSpotReservationScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onHold={async (minutes, quantity) => {
            if (!selectedFood) throw new Error("Please select a meal first.");
            const reservation = await holdSpotReservation(selectedFood.id, userId, minutes, quantity);
            setActiveReservation(reservation);
            setActiveDeposit(null);
            navigateTo("confirmDeposit");
          }} />
        )}
        {page === "reservationTime" && (
          <ReservationTimeScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "yourOrderWaiting" && (
          <YourOrderWaitingScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "confirmDeposit" && (
          <ConfirmDepositScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "payDeposit" && (
          <PayDepositScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} onBack={() => goBack()} onPay={async (method) => {
            if (!activeReservation) throw new Error("Reservation expired. Start again to hold a meal.");
            const receipt = await payReservationDeposit(activeReservation.reservationId, method, activeReservation.depositAmount);
            setActiveDeposit(receipt);
            navigateTo("depositReceipt");
          }} />
        )}
        {page === "depositReceipt" && (
          <DepositReceiptScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} deposit={activeDeposit} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "pickupTimeSlot" && (
          <PickupTimeSlotScreen food={selectedSafetyFood ?? undefined} reservationId={activeReservation?.reservationId} onBack={() => goBack()} onChoose={async (day, slot) => {
            if (activeReservation) {
              const [start, end] = slot.split(" – ");
              const date = new Date();
              if (day === "Wed") date.setDate(date.getDate() + 1);
              if (day === "Thu") date.setDate(date.getDate() + 2);
              if (day === "Fri") date.setDate(date.getDate() + 3);
              const dateStr = date.toISOString().slice(0, 10);
              const result = await selectPickupSlot(activeReservation.reservationId, `${dateStr} ${start}:00`, `${dateStr} ${end}:00`, day);
              setActivePickupSlot(result.slot);
            }
            navigateTo("orderDetailsSlot");
          }} />
        )}
        {page === "orderDetailsSlot" && (
          <OrderDetailsSlotScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} deposit={activeDeposit} pickupSlot={activePickupSlot} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "waitlistQueue" && (
          <WaitlistQueueScreen food={selectedSafetyFood ?? undefined} waitlist={activeWaitlist} userId={userId} onBack={() => goBack()} onLoad={async () => {
            if (selectedFood) setActiveWaitlist(await getFoodWaitlist(selectedFood.id));
          }} onJoin={async () => {
            if (!selectedFood) return;
            await joinFoodWaitlist(selectedFood.id, userId, 1);
            setActiveWaitlist(await getFoodWaitlist(selectedFood.id));
          }} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "overdueOrder" && (
          <OverdueOrderScreen food={selectedSafetyFood ?? undefined} reservation={activeReservation} onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "cancelRelease" && (
          <CancelReleaseScreen food={selectedSafetyFood ?? undefined} onBack={() => goBack()} onRelease={async () => {
            const result = activeReservation
              ? await cancelAndReleaseOrder(activeReservation.reservationId)
              : { success: true, portionsReleased: 0, assignedToWaitlist: false, depositTransferred: false };
            setActiveReservation(null);
            setActiveDeposit(null);
            if (selectedFood) setActiveWaitlist(await getFoodWaitlist(selectedFood.id));
            return result;
          }} onNavigate={(r) => {
            if (r === "home") { setPage("home"); setHistory([]); }
            else navigateTo(r as Page);
          }} />
        )}

        {page === "sellerStudio" && <SellerStudioScreen userId={userId} onBack={() => goBack()} />}
        {page === "shiftImpact" && <ShiftImpactScreen userId={userId} onBack={() => goBack()} />}
        {page === "trustComplaints" && <TrustComplaintsScreen userId={userId} shopId={selectedShopId} onBack={() => goBack()} />}

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
          activeTab={activeTab}
          onClose={() => setDrawerOpen(false)}
          onNavigate={handleNavigate}
          onMerchant={() => navigateTo("accountSettings")}
          onOpenSettings={() => navigateTo("accountSettings")}
          onSellerDashboard={() => void openSellerDashboard()}
          onLogout={() => void logout()}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ==========================================
// FOOD DETAIL VIEW COMPONENT
// ==========================================

function AccountSettingsView({ role, onBack, onSwitchRole }: { role: "buyer" | "seller" | "admin"; onBack: () => void; onSwitchRole: () => void }) {
  const switchLabel = role === "seller" ? "Switch to Buyer Mode" : "Switch to Merchant Mode";
  return <View style={s.simpleScreen}>
    <View style={s.simpleHeader}>
      <Pressable onPress={onBack} style={s.simpleBack}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
      <Text style={s.simpleTitle}>Settings</Text>
      <View style={s.simpleBack} />
    </View>
    <View style={s.settingsSection}>
      <Text style={s.settingsHeading}>Account</Text>
      <Text style={s.settingsDescription}>Choose how you want to use ResQ. Your account and store data stay connected.</Text>
      <Pressable onPress={onSwitchRole} style={s.settingsRoleButton}>
        <Ionicons name={role === "seller" ? "person-outline" : "storefront-outline"} size={19} color={colors.primary} />
        <Text style={s.settingsRoleText}>{switchLabel}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </View>
  </View>;
}

function FoodDetailView({
  food,
  onBack,
  onMenu,
  onSafety,
  onOpenShop,
  onReserved,
}: {
  food: Food;
  onBack: () => void;
  onMenu: () => void;
  onSafety: () => void;
  onOpenShop: (shopId: string) => void;
  onReserved: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const original = Number(food.original_price);
  const current = Number(food.current_price);
  const available = Math.max(0, Number(food.quantity_available) || 0);
  const safeQuantity = Math.min(quantity, Math.max(available, 1));
  const discount =
    original > 0
      ? Math.max(0, Math.round((1 - current / original) * 100))
      : 0;

  return (
    <View style={s.destination}>
      <View style={[s.destinationHeader, s.foodDetailHeader]}>
        <Pressable onPress={onBack} style={s.backButton} accessibilityLabel="Back">
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <Text style={s.destinationTitle}>Meal Detail</Text>
        <Pressable onPress={onMenu} style={s.backButton} accessibilityLabel="Menu">
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.foodDetailBody} showsVerticalScrollIndicator={false}>
        <View style={s.detailPhoto}>
          <FallbackPhoto
            uri={imageUrl(food.image_url)}
            fallback={foodPhoto(food.name)}
            style={s.detailImage}
          />
          <View style={s.pickupTimeBadge}>
            <Text style={s.pickupTimeText}>15 min</Text>
          </View>
          {discount > 0 && (
            <View style={s.detailDiscountBadge}>
              <Text style={s.detailDiscountText}>Save {discount}%</Text>
            </View>
          )}
        </View>

        <View style={s.foodTitlePriceRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.foodDetailName}>{food.name}</Text>
            <Pressable onPress={() => onOpenShop(food.shop_id)} style={s.shopLinkRow}>
              <Ionicons name="storefront-outline" size={16} color={colors.primary} />
              <Text style={s.shopLinkText}>{food.shop_name}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={s.foodDetailPrice}>{current === 0 ? "Free" : `${current.toLocaleString("vi-VN")}₫`}</Text>
        </View>

        <View style={s.foodTagRow}>
          <View style={s.foodTag}><Text style={s.foodTagText}>★ {Number(food.reputation_score || 4.6).toFixed(1)} (120)</Text></View>
          <View style={s.foodTag}><Ionicons name="location-outline" size={13} color={colors.ink} /><Text style={s.foodTagText}>1.2 km</Text></View>
          <View style={s.foodTag}><Ionicons name="time-outline" size={13} color={colors.ink} /><Text style={s.foodTagText}>15 min</Text></View>
        </View>

        <View style={s.inventoryCard}>
          <View style={s.inventoryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.inventoryTitle}>Pickup today</Text>
              <Text style={s.inventorySub}>Store closes at 22:45</Text>
            </View>
            <View style={s.inventoryPill}><Text style={s.inventoryPillText}>{available} left</Text></View>
          </View>
          <View style={s.inventoryTrack}><View style={[s.inventoryFill, { width: `${Math.max(12, Math.min(100, available * 5))}%` }]} /></View>
          <Text style={s.inventorySub}>{available} portions still available</Text>
        </View>

        <View style={s.quantityCard}>
          <View><Text style={s.quantityTitle}>Quantity</Text><Text style={s.inventorySub}>Total {(current * safeQuantity).toLocaleString("vi-VN")}₫</Text></View>
          <View style={s.quantityStepper}>
            <Pressable disabled={safeQuantity <= 1} onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={s.quantityStep}><Text style={s.quantityStepText}>−</Text></Pressable>
            <Text style={s.selectedQuantity}>{safeQuantity}</Text>
            <Pressable disabled={safeQuantity >= available} onPress={() => setQuantity((value) => Math.min(available, value + 1))} style={s.quantityStep}><Text style={s.quantityStepText}>+</Text></Pressable>
          </View>
        </View>

        <Pressable onPress={() => onOpenShop(food.shop_id)} style={s.storeAddressCard}>
          <View style={s.storeAvatar}><Ionicons name="storefront-outline" size={17} color={colors.muted} /></View>
          <View style={{ flex: 1 }}><Text style={s.storeAddressName}>{food.shop_name}</Text><Text style={s.storeAddressText}>{food.address}</Text></View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <View style={s.holdBanner}>
          <Ionicons name="time-outline" size={17} color={colors.ink} />
          <View style={{ flex: 1 }}><Text style={s.inventoryTitle}>Hold this order for 15–30 min</Text><Text style={s.inventorySub}>Tap “I’m on my way” to reserve it while you travel. Deposit refunded on pickup.</Text></View>
        </View>

        {food.description || food.storage_instructions ? <Pressable style={s.foodSafetyLink} onPress={onSafety}><Text style={s.foodSafetyLinkText}>Food details & safety</Text><Ionicons name="chevron-forward" size={16} color={colors.primary} /></Pressable> : null}
        <View style={s.foodActions}>
          <Pressable style={s.primaryPillAction} onPress={onReserved}><Text style={s.primaryPillActionText}>I’m on my way</Text></Pressable>
          <Pressable style={s.secondaryPillAction} onPress={onReserved}><Text style={s.secondaryPillActionText}>Schedule pickup</Text></Pressable>
          <Pressable style={s.detailsAction} onPress={onSafety}><Text style={s.primaryPillActionText}>View detail</Text></Pressable>
        </View>
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
  simpleScreen: { flex: 1, backgroundColor: colors.white },
  simpleHeader: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  simpleBack: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  simpleTitle: { color: colors.ink, fontSize: fontSizes.subtitle, fontWeight: "700" },
  settingsSection: { margin: 18, padding: 18, borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.white },
  settingsHeading: { color: colors.ink, fontSize: fontSizes.subtitle, fontWeight: "700" },
  settingsDescription: { color: colors.muted, fontSize: fontSizes.bodySmall, lineHeight: 20, marginTop: 7, marginBottom: 16 },
  settingsRoleButton: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderRadius: 15, backgroundColor: colors.pale },
  settingsRoleText: { flex: 1, color: colors.ink, fontSize: fontSizes.bodyMedium, fontWeight: "700" },
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
  foodDetailHeader: { height: 56, paddingTop: 4, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  foodDetailBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 14 },
  foodTitlePriceRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 4 },
  foodDetailName: { color: colors.ink, fontSize: 16, lineHeight: 24, fontWeight: "800" },
  foodDetailPrice: { color: colors.primary, fontSize: 18, lineHeight: 27 },
  pickupTimeBadge: { position: "absolute", top: 7, left: 6, height: 32, minWidth: 60, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  pickupTimeText: { color: colors.ink, fontSize: 9, fontWeight: "800" },
  foodTagRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  foodTag: { flexDirection: "row", alignItems: "center", gap: 4, height: 25, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: colors.line, backgroundColor: "#e8f3e9" },
  foodTagText: { color: colors.ink, fontSize: 11 },
  inventoryCard: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, padding: 15, borderRadius: 18, gap: 8 },
  inventoryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 4 },
  inventoryTitle: { color: colors.ink, fontSize: 12, lineHeight: 18, fontWeight: "800" },
  inventorySub: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  inventoryPill: { height: 30, borderRadius: 15, borderColor: colors.primary, borderWidth: 1, justifyContent: "center", paddingHorizontal: 15 },
  inventoryPillText: { color: colors.ink, fontSize: 11 },
  inventoryTrack: { height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: "#d4d4d4" },
  inventoryFill: { height: "100%", backgroundColor: colors.primary },
  quantityCard: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, padding: 15, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quantityTitle: { color: colors.ink, fontSize: 12, lineHeight: 18 },
  quantityStepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  quantityStep: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e8f3e9", alignItems: "center", justifyContent: "center" },
  quantityStepText: { color: colors.ink, fontSize: 17, lineHeight: 22 },
  selectedQuantity: { color: colors.ink, fontSize: 12 },
  storeAddressCard: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  storeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#eee", borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  storeAddressName: { color: colors.ink, fontSize: 12, lineHeight: 18 },
  storeAddressText: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  holdBanner: { backgroundColor: colors.white, borderColor: colors.primary, borderWidth: 1, padding: 15, borderRadius: 18, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  foodSafetyLink: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4, paddingVertical: 6 },
  foodSafetyLinkText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  foodActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 4 },
  primaryPillAction: { flex: 1, minWidth: 140, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  primaryPillActionText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  secondaryPillAction: { flex: 1, minWidth: 140, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  secondaryPillActionText: { color: colors.ink, fontSize: 13 },
  detailsAction: { width: "100%", height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
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
