import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

type Item = [string, string, string];
const groups: [string, Item[]][] = [
  [
    "PRIMARY NAVIGATION",
    [
      ["home-outline", "Home", "home"],
      ["grid-outline", "Explore", "explore"],
      ["map-outline", "Food Heatmap", "maps"],
      ["bookmark-outline", "Saved Items", "saved"],
      ["receipt-outline", "My Orders", "orders"],
      ["person-outline", "Hồ sơ người mua", "buyerProfile"],
      ["storefront-outline", "Hồ sơ người bán", "sellerProfile"],
      ["create-outline", "Chỉnh sửa hồ sơ", "editProfile"],
      ["location-outline", "Vị trí & Huy hiệu uy tín", "storeLocation"],
      ["document-text-outline", "Giấy chứng nhận ATVSTP", "certificate"],
    ],
  ],
  [
    "COMMUNITY & SPECIALS",
    [
      ["gift-outline", "0đ Sharing Corner", "sharing"],
      ["pricetag-outline", "Budget Mystery Bags", "budgetBags"],
      ["map-outline", "0đ Sharing Station Map", "stationMap"],
      ["storefront-outline", "Shop Detail", "shopDetail"],
      ["notifications-outline", "Drop Alert Feed", "myDropAlert"],
      ["options-outline", "Drop Alert Center", "dropAlert"],
    ],
  ],
  [
    "SAFETY & POLICIES",
    [
      ["shield-checkmark-outline", "Food Safety & Storage", "safety"],
      ["document-text-outline", "Complaint & Refund Policy", "complaints"],
    ],
  ],
  [
    "PREFERENCES",
    [
      ["alert-circle-outline", "Dị ứng thực phẩm", "foodAllergies"],
      ["eye-off-outline", "Chế độ ẩn danh", "privacy"],
      ["eye-outline", "Xem trước hồ sơ ẩn danh", "incognitoPreview"],
      ["restaurant-outline", "Thiết lập chế độ ăn", "diet"],
      ["radio-outline", "Cài đặt bán kính thông báo", "notificationRadius"],
      ["leaf-outline", "Dietary & Allergy Filters", "buyerSetup"],
      ["help-circle-outline", "Help & Support Center", "help"],
    ],
  ],
];

export function AppDrawer({
  visible,
  name,
  role = "buyer",
  onClose,
  onNavigate,
  onMerchant,
  onLogout,
}: {
  visible: boolean;
  name: string;
  role?: "buyer" | "seller" | "admin";
  onClose: () => void;
  onNavigate: (route: string) => void;
  onMerchant: () => void;
  onLogout: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
        <View style={s.drawer}>
          <View style={s.topLine}>
            <View style={s.brandLockup}>
              <View style={s.logoDot}>
                <Text style={s.logoMark}>R</Text>
              </View>
              <Text style={s.brandName}>ResQ Food</Text>
            </View>
            <Pressable onPress={onClose} style={s.close}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => onNavigate(role === "seller" ? "sellerProfile" : "buyerProfile")}
            style={s.profileRow}
          >
            <View style={s.photo}>
              <Text style={s.photoText}>{(name || "R").slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={s.profileText}>
              <Text style={s.profileName}>{name || "ResQ member"}</Text>
              <Text style={s.profileHandle}>
                {role === "seller" ? "Store Owner · Tap to view" : "@resqmember · Tap to view"}
              </Text>
            </View>
          </Pressable>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.menuScroll}>
            {groups.map(([heading, items]) => (
              <View key={heading} style={s.group}>
                <Text style={s.groupHeading}>{heading}</Text>
                {items.map(([icon, label, route]) => (
                  <Pressable key={route} onPress={() => onNavigate(route)} style={s.menuItem}>
                    <Ionicons
                      name={icon as keyof typeof Ionicons.glyphMap}
                      size={17}
                      color={colors.ink}
                      style={s.menuIcon}
                    />
                    <Text style={s.menuLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
            <Pressable onPress={onMerchant} style={s.merchant}>
              <Ionicons
                name={role === "seller" ? "person-outline" : "storefront-outline"}
                size={17}
                color={colors.white}
              />
              <Text style={s.merchantText}>
                {role === "seller" ? "Switch to Buyer Mode" : "Switch to Merchant Mode"}
              </Text>
            </Pressable>
            <View style={s.footer}>
              <Pressable onPress={() => onNavigate("settings")}>
                <Text style={s.footerLink}>Settings</Text>
              </Pressable>
              <Pressable onPress={onLogout}>
                <Text style={s.footerLinkStrong}>Log out</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(25,34,28,0.28)",
    flexDirection: "row",
    alignItems: "stretch",
  },
  drawer: {
    width: 300,
    maxWidth: "84%",
    marginVertical: 24,
    marginLeft: 14,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    elevation: 12,
  },
  topLine: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e8f1e7",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: { color: colors.primary, fontSize: fontSizes.bodyLarge, fontWeight: "900" },
  brandName: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  close: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: colors.ink, fontSize: 20, lineHeight: 22 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dce9db",
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: { color: colors.primary, fontSize: fontSizes.title, fontWeight: "900" },
  profileText: { gap: 2 },
  profileName: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  profileHandle: { color: colors.muted, fontSize: fontSizes.caption },
  menuScroll: { paddingBottom: 10 },
  group: { marginBottom: 14 },
  groupHeading: {
    color: "#748278",
    fontSize: fontSizes.micro,
    letterSpacing: 0.8,
    fontWeight: "800",
    marginBottom: 6,
    marginLeft: 4,
  },
  menuItem: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuIcon: { width: 18, color: colors.ink, textAlign: "center" },
  menuLabel: { color: "#304538", fontSize: fontSizes.bodySmall, fontWeight: "500" },
  merchant: {
    minHeight: 42,
    backgroundColor: colors.primary,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  merchantText: { color: colors.white, fontSize: fontSizes.bodySmall, fontWeight: "800" },
  footer: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  footerLink: { color: colors.muted, fontSize: fontSizes.caption },
  footerLinkStrong: {
    color: colors.primary,
    fontSize: fontSizes.caption,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
