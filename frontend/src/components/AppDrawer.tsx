import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";
import { capybaraProfilePhoto, resqFoodLogoPhoto } from "../data/designPhotos";

type Item = [string, string, string];
const groups: [string, Item[]][] = [
  ["PRIMARY NAVIGATION", [["home-outline", "Home", "home"], ["grid-outline", "Explore", "explore"], ["map-outline", "Food Heatmap", "maps"], ["bookmark-outline", "Saved Items", "saved"], ["receipt-outline", "My Orders", "orders"]]],
  ["COMMUNITY & SPECIALS", [["gift-outline", "0₫ Sharing Corner", "sharing"], ["notifications-outline", "Secret Box", "budgetBags"]]],
  ["SELLER & IMPACT", [["add-circle-outline", "Seller Studio · M6", "sellerStudio"], ["bar-chart-outline", "Shift & Impact · M7", "shiftImpact"]]],
  ["SAFETY & POLICIES", [["shield-checkmark-outline", "Food Safety & Storage", "safety"], ["document-text-outline", "Complaint & Refund Policy", "complaints"]]],
  ["TRUST & SAFETY", [["shield-outline", "Trust & Complaints · M8", "trustComplaints"]]],
  ["PREFERENCES", [["leaf-outline", "Dietary & Allergy Filters", "buyerSetup"], ["lock-closed-outline", "Incognito & Privacy", "privacy"], ["help-circle-outline", "Help & Support Center", "help"]]],
];

export function AppDrawer({ visible, name, role = "buyer", activeTab = "Home", onClose, onNavigate, onMerchant, onOpenSettings, onSellerDashboard, onLogout }: {
  visible: boolean; name: string; role?: "buyer" | "seller" | "admin"; activeTab?: string;
  onClose: () => void; onNavigate: (route: string) => void; onMerchant: () => void; onOpenSettings?: () => void; onSellerDashboard?: () => void; onLogout: () => void;
}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.scrim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={s.drawer}>
        <View style={s.brandRow}>
          <Image source={resqFoodLogoPhoto} style={s.brandLogo} />
          <Text style={s.brand}>ResQ Food</Text>
          <Pressable onPress={onClose} style={s.close}><Ionicons name="close" size={21} color={colors.ink} /></Pressable>
        </View>
        <Pressable onPress={() => onNavigate(role === "seller" ? "sellerProfile" : "buyerProfile")} style={s.profileRow}>
          <Image source={capybaraProfilePhoto} style={s.avatar} />
          <View style={s.profileCopy}><Text numberOfLines={1} style={s.profileName}>{name || "ResQ member"}</Text><Text style={s.handle}>{role === "seller" ? "Store Owner · Tap to view" : "@Capibaras"}</Text></View>
        </Pressable>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.menuScroll}>
          {groups.map(([heading, items], groupIndex) => <View key={heading} style={s.group}>
            <Text style={s.groupHeading}>{heading}</Text>
          {items.map(([icon, label, route], index) => {
              const active = groupIndex === 0 && ["Home", "Explore", "Maps", "Saved"].indexOf(activeTab) === index;
              return <Pressable key={route} onPress={() => onNavigate(route)} style={[s.menuItem, active && s.activeItem]}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={active ? colors.primary : colors.muted} style={s.itemIcon} />
                <Text style={[s.menuLabel, active && s.activeLabel]}>{label}</Text>
              </Pressable>;
            })}
          </View>)}
          {role === "seller" && <Pressable onPress={onSellerDashboard} style={s.menuItem}>
            <Ionicons name="storefront-outline" size={18} color={colors.muted} style={s.itemIcon} />
            <Text style={s.menuLabel}>Seller Dashboard</Text>
          </Pressable>}
          {role !== "seller" && <Pressable onPress={onMerchant} style={s.merchant}>
            <Ionicons name="storefront-outline" size={17} color={colors.white} />
            <Text style={s.merchantText}>Switch to Merchant Mode</Text>
          </Pressable>}
          <View style={s.footer}>
            <Pressable onPress={onOpenSettings ?? (() => onNavigate("accountSettings"))}><Text style={s.footerLink}>Settings</Text></Pressable>
            <Pressable onPress={onLogout}><Text style={s.logout}>Log out</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  scrim: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.32)" },
  drawer: { width: 335, maxWidth: "88%", marginTop: 59, backgroundColor: colors.white, borderTopRightRadius: 25, borderBottomRightRadius: 25, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, elevation: 12 },
  brandRow: { height: 46, flexDirection: "row", alignItems: "center", gap: 8 },
  brandLogo: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.pale },
  brand: { flex: 1, color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "600" },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, height: 66, marginTop: 2, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e4eee3" },
  profileCopy: { flex: 1, gap: 2 }, profileName: { color: colors.ink, fontSize: fontSizes.subtitle, fontWeight: "600" },
  handle: { color: colors.ink, fontSize: fontSizes.caption, letterSpacing: 0.2 },
  menuScroll: { paddingBottom: 4 }, group: { marginBottom: 8 },
  groupHeading: { color: colors.muted, fontSize: fontSizes.micro, letterSpacing: 0.8, fontWeight: "600", marginBottom: 4, marginLeft: 4 },
  menuItem: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 8, borderRadius: 18 },
  activeItem: { backgroundColor: colors.pale }, itemIcon: { width: 18, textAlign: "center" },
  menuLabel: { color: colors.ink, fontSize: fontSizes.bodySmall, fontWeight: "400" }, activeLabel: { fontWeight: "700" },
  merchant: { height: 44, backgroundColor: colors.primary, borderRadius: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 },
  merchantText: { color: colors.white, fontSize: fontSizes.bodySmall, fontWeight: "600" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 10 },
  footerLink: { color: colors.muted, fontSize: fontSizes.caption, fontWeight: "600" }, logout: { color: colors.ink, fontSize: fontSizes.caption, fontWeight: "600", textDecorationLine: "underline" },
});
