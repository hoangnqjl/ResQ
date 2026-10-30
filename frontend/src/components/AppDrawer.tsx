import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type Item = [string, string, string];
const groups: [string, Item[]][] = [
  ["PRIMARY NAVIGATION", [["home-outline", "Home", "home"], ["grid-outline", "Explore", "explore"], ["map-outline", "Food Heatmap", "maps"], ["bookmark-outline", "Saved Items", "saved"], ["receipt-outline", "My Orders", "orders"]]],
  ["COMMUNITY & SPECIALS", [["gift-outline", "0đ Sharing Corner", "sharing"], ["pricetag-outline", "Budget Mystery Bags", "budgetBags"], ["map-outline", "0đ Sharing Station Map", "stationMap"], ["storefront-outline", "Shop Detail", "shopDetail"], ["notifications-outline", "Drop Alert", "dropAlert"]]],
  ["SAFETY & POLICIES", [["shield-checkmark-outline", "Food Safety & Storage", "safety"], ["document-text-outline", "Complaint & Refund Policy", "complaints"]]],
  ["PREFERENCES", [["leaf-outline", "Dietary & Allergy Filters", "buyerSetup"], ["eye-off-outline", "Incognito & Privacy", "privacy"], ["help-circle-outline", "Help & Support Center", "help"]]],
];

export function AppDrawer({ visible, name, onClose, onNavigate, onMerchant, onLogout }: {
  visible: boolean; name: string; onClose: () => void; onNavigate: (route: string) => void; onMerchant: () => void; onLogout: () => void;
}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.scrim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={s.drawer}>
        <View style={s.topLine}><View style={s.brandLockup}><View style={s.logoDot}><Text style={s.logoMark}>R</Text></View><Text style={s.brandName}>ResQ Food</Text></View><Pressable onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable></View>
        <View style={s.profileRow}><View style={s.photo}><Text style={s.photoText}>{(name || "R").slice(0, 1).toUpperCase()}</Text></View><View style={s.profileText}><Text style={s.profileName}>{name || "ResQ member"}</Text><Text style={s.profileHandle}>@resqmember</Text></View></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.menuScroll}>
          {groups.map(([heading, items]) => <View key={heading} style={s.group}><Text style={s.groupHeading}>{heading}</Text>{items.map(([icon, label, route]) => <Pressable key={route} onPress={() => onNavigate(route)} style={s.menuItem}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={12} color={colors.ink} style={s.menuIcon} /><Text style={s.menuLabel}>{label}</Text></Pressable>)}</View>)}
          <Pressable onPress={onMerchant} style={s.merchant}><Ionicons name="storefront-outline" size={12} color={colors.white} /><Text style={s.merchantText}>Switch to Merchant Mode</Text></Pressable>
          <View style={s.footer}><Pressable onPress={() => onNavigate("settings")}><Text style={s.footerLink}>Settings</Text></Pressable><Pressable onPress={onLogout}><Text style={s.footerLinkStrong}>Log out</Text></Pressable></View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(25,34,28,0.28)", flexDirection: "row", alignItems: "stretch" }, drawer: { width: 276, maxWidth: "82%", marginVertical: 28, marginLeft: 13, backgroundColor: colors.white, borderRadius: 18, paddingTop: 13, paddingHorizontal: 12, paddingBottom: 8, elevation: 12 }, topLine: { height: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2 }, brandLockup: { flexDirection: "row", alignItems: "center", gap: 7 }, logoDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#e8f1e7", alignItems: "center", justifyContent: "center" }, logoMark: { color: colors.primary, fontSize: 11, fontWeight: "900" }, brandName: { color: colors.ink, fontSize: 10, fontWeight: "800" }, close: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center" }, closeText: { color: colors.ink, fontSize: 18, lineHeight: 20 }, profileRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9, marginBottom: 12 }, photo: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#dce9db", alignItems: "center", justifyContent: "center" }, photoText: { color: colors.primary, fontSize: 12, fontWeight: "900" }, profileText: { gap: 2 }, profileName: { color: colors.ink, fontSize: 9, fontWeight: "800" }, profileHandle: { color: colors.muted, fontSize: 7 }, menuScroll: { paddingBottom: 3 }, group: { marginBottom: 9 }, groupHeading: { color: "#748278", fontSize: 6, letterSpacing: 0.45, fontWeight: "700", marginBottom: 4, marginLeft: 2 }, menuItem: { height: 23, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 7, borderRadius: 12 }, menuIcon: { width: 12, color: colors.ink, fontSize: 10, textAlign: "center" }, menuLabel: { color: "#304538", fontSize: 8 }, merchant: { minHeight: 31, backgroundColor: colors.primary, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 1 }, merchantIcon: { color: colors.white, fontSize: 10 }, merchantText: { color: colors.white, fontSize: 8, fontWeight: "800" }, footer: { marginTop: 7, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 }, footerLink: { color: colors.muted, fontSize: 7 }, footerLinkStrong: { color: colors.primary, fontSize: 7, fontWeight: "800", textDecorationLine: "underline" },
});
