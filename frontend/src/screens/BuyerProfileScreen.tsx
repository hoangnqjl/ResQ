import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

type Props = {
  userName?: string;
  isIncognito?: boolean;
  isGuest?: boolean;
  onBack?: () => void;
  onOpenMenu?: () => void;
  onNavigateQuickAction?: (action: "allergies" | "diet" | "radius" | "route" | "privacy") => void;
  onEditProfile?: () => void;
  onReport?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
};

// 6 demo meal photos for the 3-column grid
const MEAL_PHOTOS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
];

const TABS = [
  ["Home", "home-outline"],
  ["Explore", "search-outline"],
  ["Maps", "map-outline"],
  ["Saved", "bookmark-outline"],
  ["Profile", "person-outline"],
] as const;

export default function BuyerProfileScreen({
  userName = "Nguyen Capybaras",
  isIncognito = false,
  isGuest = false,
  onBack,
  onOpenMenu,
  onNavigateQuickAction,
  onEditProfile,
  onReport,
  activeTab = "Profile",
  onTabChange,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<"grid" | "saved">("grid");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "Link copied",
    sub: "Profile link has been copied to clipboard.",
  });
  const [showMenu, setShowMenu] = useState(false);

  const handleShare = () => {
    setToastMessage({
      title: "Link copied",
      sub: "Profile link has been copied to clipboard.",
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleReport = () => {
    onReport?.();
    setToastMessage({
      title: "Report submitted",
      sub: "Thank you for helping keep ResQ safe.",
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const displayName = isIncognito ? "Anonymous Buyer" : userName;
  const displayAddress = isIncognito
    ? "********************"
    : "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng";
  const displayPhone = isIncognito ? "********************" : "(+84) 0123456789";

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        {onBack ? (
          <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
            <Text style={s.backIcon}>‹</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onOpenMenu} style={s.roundButton} hitSlop={8}>
            <Ionicons name="menu-outline" size={20} color={colors.ink} />
          </Pressable>
        )}
        <Text style={s.headerTitle}>Profile</Text>
        <Pressable
          onPress={() => setShowMenu(true)}
          style={s.roundButton}
          hitSlop={8}
        >
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* User Info Row */}
        <View style={s.profileTopRow}>
          {/* Avatar with capybara */}
          <View style={s.avatarWrap}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=200&q=80",
              }}
              style={s.avatarImage}
            />
            {!isGuest && (
              <View style={s.avatarPlusBadge}>
                <Ionicons name="add" size={14} color="#ffffff" />
              </View>
            )}
          </View>

          {/* 3 Stats */}
          <View style={s.statsContainer}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{isGuest ? "24" : "18"}</Text>
              <Text style={s.statLabel}>Meals rescued</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statValue}>{isGuest ? "15" : "12"}</Text>
              <Text style={s.statLabel}>Reviews</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statValue}>{isGuest ? "4.9" : "4.8"}</Text>
              <Text style={s.statLabel}>Trust score</Text>
            </View>
          </View>
        </View>

        {/* User Details */}
        <View style={s.nameBlock}>
          <View style={s.nameTitleRow}>
            <Text style={s.userName}>{isGuest ? (userName || "Tran Minh Anh") : displayName}</Text>
            {isGuest && (
              <View style={s.trustedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#176b49" />
                <Text style={s.trustedText}>Trusted</Text>
              </View>
            )}
          </View>
          {isGuest ? (
            <Text style={s.userDetail}>Đà Nẵng</Text>
          ) : (
            <>
              <Text style={s.userDetail}>{displayAddress}</Text>
              <Text style={s.userDetail}>{displayPhone}</Text>
            </>
          )}
        </View>

        {/* Buttons Row: Guest Mode vs Owner Mode */}
        {isGuest ? (
          <View style={s.actionsRow}>
            <Pressable onPress={handleShare} style={s.guestShareButton}>
              <Text style={s.guestButtonText}>Share profile</Text>
            </Pressable>

            <Pressable onPress={handleReport} style={s.guestReportButton}>
              <Ionicons name="flag-outline" size={15} color={colors.primary} />
              <Text style={s.guestButtonText}>Report</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.actionsRow}>
            <Pressable onPress={onEditProfile} style={s.editButton}>
              <Text style={s.editButtonText}>Edit profile</Text>
            </Pressable>

            <Pressable onPress={handleShare} style={s.shareButton}>
              <Text style={s.shareButtonText}>Share profile</Text>
            </Pressable>

            <Pressable style={s.iconUserButton}>
              <Ionicons name="person-outline" size={18} color={colors.ink} />
            </Pressable>
          </View>
        )}

        {/* 5 Circular Quick Navigation Shortcuts (Hidden in Guest Mode) */}
        {!isGuest && (
          <View style={s.quickNavRow}>
          <Pressable
            onPress={() => onNavigateQuickAction?.("allergies")}
            style={s.quickNavItem}
          >
            <View style={s.quickCircle}>
              <Ionicons name="warning-outline" size={20} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Allergies</Text>
          </Pressable>

          <Pressable
            onPress={() => onNavigateQuickAction?.("diet")}
            style={s.quickNavItem}
          >
            <View style={s.quickCircle}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Diet</Text>
          </Pressable>

          <Pressable
            onPress={() => onNavigateQuickAction?.("radius")}
            style={s.quickNavItem}
          >
            <View style={s.quickCircle}>
              <Ionicons name="locate-outline" size={20} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Radius</Text>
          </Pressable>

          <Pressable
            onPress={() => onNavigateQuickAction?.("route")}
            style={s.quickNavItem}
          >
            <View style={s.quickCircle}>
              <Ionicons name="git-branch-outline" size={20} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Route</Text>
          </Pressable>

          <Pressable
            onPress={() => onNavigateQuickAction?.("privacy")}
            style={s.quickNavItem}
          >
            <View style={s.quickCircle}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Privacy</Text>
          </Pressable>
        </View>
        )}

        {/* Sub Tabs: Grid ⊞ vs Star ☆ */}
        <View style={s.subTabsWrap}>
          <Pressable
            onPress={() => setActiveSubTab("grid")}
            style={[s.subTab, activeSubTab === "grid" && s.subTabActive]}
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color={activeSubTab === "grid" ? colors.primary : colors.muted}
            />
          </Pressable>
          <Pressable
            onPress={() => setActiveSubTab("saved")}
            style={[s.subTab, activeSubTab === "saved" && s.subTabActive]}
          >
            <Ionicons
              name="star-outline"
              size={22}
              color={activeSubTab === "saved" ? colors.primary : colors.muted}
            />
          </Pressable>
        </View>

        {/* 3-Column Photo Grid (Visible in Normal Mode) */}
        {!isIncognito ? (
          <View style={s.gridContainer}>
            {MEAL_PHOTOS.map((url, idx) => (
              <View key={idx} style={s.gridItem}>
                <Image source={{ uri: url }} style={s.gridPhoto} resizeMode="cover" />
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyIncognitoFeed} />
        )}
      </ScrollView>

      {/* Toast Notification */}
      {showToast && (
        <View style={s.toast}>
          <View style={s.toastIconCircle}>
            <Ionicons name="checkmark" size={16} color="#ffffff" />
          </View>
          <View style={s.toastTextCol}>
            <Text style={s.toastTitle}>{toastMessage.title}</Text>
            <Text style={s.toastSub}>{toastMessage.sub}</Text>
          </View>
        </View>
      )}

      {/* Bottom Tab Bar */}
      {onTabChange && (
        <View style={s.tabBar}>
          {TABS.map(([label, icon]) => {
            const isSelected = activeTab === label;
            return (
              <Pressable
                key={label}
                onPress={() => onTabChange(label)}
                style={s.tab}
              >
                <View
                  style={[s.tabIconWrap, isSelected && s.tabIconWrapActive]}
                >
                  <Ionicons
                    name={icon}
                    size={18}
                    color={isSelected ? colors.primary : "#456051"}
                  />
                </View>
                <Text
                  style={[s.tabLabel, isSelected && s.tabLabelActive]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {/* 3-Dot Dropdown Menu Modal */}
      {showMenu && (
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <Pressable
            style={s.menuOverlay}
            onPress={() => setShowMenu(false)}
          >
            <View style={s.menuDropdown}>
              {isGuest ? (
                <>
                  <Pressable
                    style={s.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      handleShare();
                    }}
                  >
                    <Ionicons name="share-outline" size={17} color={colors.ink} />
                    <Text style={s.menuItemText}>Share profile</Text>
                  </Pressable>

                  <Pressable
                    style={s.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      handleReport();
                    }}
                  >
                    <Ionicons name="flag-outline" size={17} color={colors.ink} />
                    <Text style={s.menuItemText}>Report user</Text>
                  </Pressable>
                </>
              ) : !isIncognito ? (
                <>
                  <Pressable
                    style={s.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      onEditProfile?.();
                    }}
                  >
                    <Ionicons name="pencil-outline" size={17} color={colors.ink} />
                    <Text style={s.menuItemText}>Edit profile</Text>
                  </Pressable>

                  <Pressable
                    style={s.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      handleShare();
                    }}
                  >
                    <Ionicons name="share-outline" size={17} color={colors.ink} />
                    <Text style={s.menuItemText}>Share profile</Text>
                  </Pressable>

                  <Pressable
                    style={s.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      onNavigateQuickAction?.("privacy");
                    }}
                  >
                    <Ionicons name="lock-closed-outline" size={17} color={colors.ink} />
                    <Text style={[s.menuItemText, { flex: 1 }]}>Privacy</Text>
                    <Ionicons name="chevron-forward" size={16} color="#9aa79e" />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={s.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    onNavigateQuickAction?.("privacy");
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={17} color={colors.ink} />
                  <Text style={[s.menuItemText, { flex: 1 }]}>Privacy</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9aa79e" />
                </Pressable>
              )}
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  backIcon: {
    fontSize: 24,
    color: colors.ink,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: "800",
    color: colors.ink,
  },
  moreIcon: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: "900",
    marginTop: -4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eaf3ea",
  },
  avatarPlusBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.deepGreen,
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 16,
  },
  statItem: {
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  nameBlock: {
    marginTop: 14,
    gap: 3,
  },
  nameTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trustedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f0eb",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  trustedText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  guestShareButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eaf3ea",
    alignItems: "center",
    justifyContent: "center",
  },
  guestReportButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eaf3ea",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  guestButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  userName: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: colors.ink,
  },
  userDetail: {
    fontSize: fontSizes.caption,
    color: colors.muted,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  shareButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eaf3ea",
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  iconUserButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  quickNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingHorizontal: 6,
  },
  quickNavItem: {
    alignItems: "center",
    gap: 6,
  },
  quickCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  quickLabel: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: "500",
  },
  subTabsWrap: {
    flexDirection: "row",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2ee",
  },
  subTab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  subTabActive: {
    borderBottomColor: colors.primary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginHorizontal: -2,
  },
  gridItem: {
    width: "33.333%",
    aspectRatio: 1,
    padding: 2,
  },
  gridPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  emptyIncognitoFeed: {
    minHeight: 180,
  },
  toast: {
    position: "absolute",
    bottom: 74,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  toastIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  toastTextCol: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  toastSub: {
    fontSize: 11,
    color: colors.muted,
  },
  tabBar: {
    height: 56,
    marginHorizontal: 14,
    marginBottom: 8,
    flexDirection: "row",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabIconWrap: {
    width: 34,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: colors.pale,
  },
  tabLabel: {
    color: "#64756a",
    fontSize: fontSizes.caption,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "800",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuDropdown: {
    position: "absolute",
    top: 56,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 170,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
});
