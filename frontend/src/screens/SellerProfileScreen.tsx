import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";
import { cornerKitchenPhoto } from "../data/designPhotos";

type Props = {
  storeName?: string;
  storeAddress?: string;
  onBack?: () => void;
  onEditStore?: () => void;
  onItemPress?: (itemKey: string) => void;
};

export default function SellerProfileScreen({
  storeName = "The Corner Kitchen",
  storeAddress = "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng",
  onBack,
  onEditStore,
  onItemPress,
}: Props) {
  return (
    <View style={s.root}>
      {/* Seamless Header (no bottom border) */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Preview</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Store Top Row: Avatar & Edit store button */}
        <View style={s.storeTopRow}>
          <Image
            source={cornerKitchenPhoto}
            style={s.avatarImage}
          />

          <Pressable onPress={onEditStore} style={s.editStoreButton}>
            <Ionicons name="pencil-outline" size={13} color={colors.ink} />
            <Text style={s.editStoreText}>Edit store</Text>
          </Pressable>
        </View>

        {/* Store Name & Verification Badge */}
        <View style={s.storeTitleRow}>
          <Text style={s.storeName}>{storeName}</Text>
          <View style={s.verifiedBadge}>
            <Ionicons name="checkmark" size={11} color="#ffffff" />
          </View>
        </View>

        {/* Address */}
        <Pressable onPress={() => onItemPress?.("location")} style={s.addressRow}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text style={s.addressText}>{storeAddress}</Text>
        </Pressable>

        {/* 2 Stats Cards */}
        <View style={s.statsCardsRow}>
          {/* Card 1: Meals rescued (Green) */}
          <View style={s.greenCard}>
            <View style={s.cardTopLine}>
              <Text style={s.greenCardLabel}>Meals rescued</Text>
              <Ionicons name="leaf-outline" size={15} color="#ffffff" />
            </View>
            <View style={s.cardBottomLine}>
              <Text style={s.greenCardValue} numberOfLines={1} adjustsFontSizeToFit>
                18
              </Text>
              <Text style={s.greenCardTrend} numberOfLines={1}>
                ↑ 12%
              </Text>
            </View>
          </View>

          {/* Card 2: Recovered rev (White) */}
          <View style={s.whiteCard}>
            <View style={s.cardTopLine}>
              <Text style={s.whiteCardLabel}>Recovered rev</Text>
              <Ionicons name="information-circle-outline" size={16} color="#9aa79e" />
            </View>
            <View style={s.cardBottomLine}>
              <Text style={s.whiteCardValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                $142.50
              </Text>
              <Text style={s.whiteCardTrend} numberOfLines={1}>
                ↑ 14%
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Section */}
        <View style={s.sectionWrap}>
          <Text style={s.sectionTitle}>Verification</Text>

          <View style={s.verificationCard}>
            {/* 1. Food safety certificate */}
            <Pressable
              onPress={() => onItemPress?.("safety_cert")}
              style={s.verifyItem}
            >
              <View style={s.verifyIconBox}>
                <Ionicons name="document-text-outline" size={19} color={colors.primary} />
              </View>
              <Text style={s.verifyItemTitle}>Food safety certificate</Text>
              <View style={s.approvedBadge}>
                <Text style={s.approvedText}>✓ Approved</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9aa79e" style={s.chevron} />
            </Pressable>

            <View style={s.itemDivider} />

            {/* 2. Store location */}
            <Pressable
              onPress={() => onItemPress?.("location")}
              style={s.verifyItem}
            >
              <View style={s.verifyIconBox}>
                <Ionicons name="location-outline" size={19} color={colors.primary} />
              </View>
              <Text style={s.verifyItemTitle}>Store location</Text>
              <View style={s.approvedBadge}>
                <Text style={s.approvedText}>✓ Confirmed</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9aa79e" style={s.chevron} />
            </Pressable>

            <View style={s.itemDivider} />

            {/* 3. Trust badge */}
            <Pressable
              onPress={() => onItemPress?.("trust_badge")}
              style={s.verifyItem}
            >
              <View style={s.verifyIconBox}>
                <Ionicons name="shield-checkmark-outline" size={19} color={colors.primary} />
              </View>
              <Text style={s.verifyItemTitle}>Trust badge</Text>
              <View style={s.pendingBadge}>
                <Text style={s.pendingText}>⏱ Pending</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9aa79e" style={s.chevron} />
            </Pressable>

            <View style={s.itemDivider} />

            {/* 4. Operating hours */}
            <Pressable
              onPress={() => onItemPress?.("hours")}
              style={s.verifyItem}
            >
              <View style={s.verifyIconBox}>
                <Ionicons name="time-outline" size={19} color={colors.primary} />
              </View>
              <Text style={s.verifyItemTitle}>Operating hours</Text>
              <Text style={s.hoursText}>10:00–21:00</Text>
              <Ionicons name="chevron-forward" size={16} color="#9aa79e" style={s.chevron} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
    // Seamless header without bottom border
    borderBottomWidth: 0,
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
    fontSize: fontSizes.header,
    color: colors.ink,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: "800",
    color: colors.ink,
  },
  moreIcon: {
    fontSize: fontSizes.title,
    color: colors.ink,
    fontWeight: "900",
    marginTop: -4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  storeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#eaf3ea",
  },
  editStoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#d5e2d9",
    backgroundColor: "#ffffff",
  },
  editStoreText: {
    fontSize: fontSizes.caption,
    fontWeight: "700",
    color: colors.ink,
  },
  storeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  storeName: {
    fontSize: fontSizes.title,
    fontWeight: "800",
    color: colors.ink,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  addressText: {
    fontSize: fontSizes.caption,
    color: colors.muted,
  },
  statsCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  greenCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 88,
    justifyContent: "space-between",
  },
  cardTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greenCardLabel: {
    fontSize: fontSizes.caption,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  cardBottomLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 8,
  },
  greenCardValue: {
    fontSize: fontSizes.titleLarge,
    fontWeight: "900",
    color: "#ffffff",
  },
  greenCardTrend: {
    fontSize: fontSizes.badge,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    paddingHorizontal: 8,
    paddingVertical: 14,
    minHeight: 88,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  whiteCardLabel: {
    fontSize: fontSizes.caption,
    fontWeight: "600",
    color: colors.muted,
  },
  whiteCardValue: {
    fontSize: fontSizes.titleSmall,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: colors.ink,
    flexShrink: 1,
  },
  whiteCardTrend: {
    fontSize: fontSizes.badge,
    fontWeight: "600",
    color: colors.muted,
    flexShrink: 0,
  },
  sectionWrap: {
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: fontSizes.subtitleSmall,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 12,
  },
  verificationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    overflow: "hidden",
  },
  verifyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  verifyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eaf3ea",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyItemTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: fontSizes.bodyMedium,
    fontWeight: "600",
    color: colors.ink,
  },
  approvedBadge: {
    backgroundColor: "#eaf3ea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedText: {
    fontSize: fontSizes.caption,
    fontWeight: "700",
    color: colors.primary,
  },
  pendingBadge: {
    backgroundColor: "#fff4ea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: fontSizes.caption,
    fontWeight: "700",
    color: "#d97706",
  },
  hoursText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "600",
    color: colors.muted,
  },
  chevron: {
    marginLeft: 6,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#f0f4f1",
    marginLeft: 62,
    marginRight: 14,
  },
});
