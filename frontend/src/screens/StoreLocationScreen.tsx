import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

type Props = {
  storeName?: string;
  storeAddress?: string;
  onBack: () => void;
  onConfirm?: () => Promise<void> | void;
  onEditAddress?: () => void;
};

export default function StoreLocationScreen({
  storeName = "The Corner Kitchen",
  storeAddress = "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng",
  onBack,
  onConfirm,
  onEditAddress,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      await onConfirm?.();
      setConfirmed(true);
    } catch {
      // Keep on screen if error
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Top Header - Seamless without bottom border */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Store Location</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Map Preview Card */}
          <View style={s.mapCard}>
            {/* City Grid Background */}
            <View style={s.mapBackground}>
              {/* Horizontal white streets */}
              <View style={[s.streetH, { top: 40 }]} />
              <View style={[s.streetH, { top: 110 }]} />
              <View style={[s.streetH, { top: 180 }]} />

              {/* Vertical white streets */}
              <View style={[s.streetV, { left: 45 }]} />
              <View style={[s.streetV, { left: 125 }]} />
              <View style={[s.streetV, { left: 205 }]} />
              <View style={[s.streetV, { left: 275 }]} />

              {/* Street Names */}
              <Text style={[s.streetLabel, { top: 92, left: 62 }]}>
                Lê Văn{"\n"}Hiến
              </Text>
              <Text
                style={[
                  s.streetLabel,
                  { top: 60, left: 188, transform: [{ rotate: "90deg" }] },
                ]}
              >
                Nguyễn
              </Text>
              <Text style={[s.streetLabel, { top: 82, right: 28 }]}>
                Biển{"\n"}Đông
              </Text>

              {/* Center Building block */}
              <View style={s.centerBuilding} />

              {/* Pin Callout & Target Radius */}
              <View style={s.pinContainer}>
                {/* Store Name Callout */}
                <View style={s.calloutBubble}>
                  <Text style={s.calloutText}>{storeName}</Text>
                </View>

                {/* Accuracy Radius Dashed Circle */}
                <View style={s.radiusCircle}>
                  <Ionicons name="location" size={34} color={colors.deepGreen} />
                  <View style={s.pinBaseDot} />
                </View>
              </View>

              {/* 100m Map Scale */}
              <View style={s.scaleContainer}>
                <Text style={s.scaleText}>100 m</Text>
                <View style={s.scaleBracket} />
              </View>

              {/* Locate Me Button */}
              <Pressable style={s.locateButton}>
                <Ionicons name="locate-outline" size={19} color={colors.ink} />
              </Pressable>
            </View>
          </View>

          {/* Address Bar Card */}
          <View style={s.addressCard}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={s.addressText}>{storeAddress}</Text>
            <Pressable onPress={onEditAddress} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color="#55655b" />
            </Pressable>
          </View>

          {/* Trusted Seller badge Card */}
          <View style={s.badgeCard}>
            <View style={s.badgeCardHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={colors.ink}
              />
              <Text style={s.badgeCardTitle}>Trusted Seller badge</Text>
            </View>

            {/* Checklist item 1: Certificate uploaded */}
            <View style={s.statusRow}>
              <View style={s.checkedCircle}>
                <Ionicons name="checkmark" size={13} color="#ffffff" />
              </View>
              <Text style={s.statusTextDark}>Certificate uploaded</Text>
            </View>

            {/* Checklist item 2: Location confirmed */}
            <View style={s.statusRow}>
              <View style={s.checkedCircle}>
                <Ionicons name="checkmark" size={13} color="#ffffff" />
              </View>
              <Text style={s.statusTextDark}>Location confirmed</Text>
            </View>

            {/* Checklist item 3: Review in progress */}
            <View style={s.statusRow}>
              <View style={s.pendingCircle}>
                <Ionicons name="time-outline" size={14} color="#d97706" />
              </View>
              <Text style={s.statusTextOrange}>Review in progress</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Section: Confirm CTA */}
        <View style={s.bottomSection}>
          <Pressable
            onPress={handleConfirm}
            disabled={confirming}
            style={s.confirmButton}
          >
            <Text style={s.confirmButtonText}>
              {confirming ? "Confirming…" : "Confirm"}
            </Text>
          </Pressable>
        </View>
      </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapCard: {
    height: 270,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1ede4",
    backgroundColor: "#ebf3ec",
  },
  mapBackground: {
    flex: 1,
    position: "relative",
    backgroundColor: "#ebf3ec",
  },
  streetH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#ffffff",
  },
  streetV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: "#ffffff",
  },
  streetLabel: {
    position: "absolute",
    fontSize: 10,
    color: "#6b7d70",
    fontWeight: "600",
    lineHeight: 13,
  },
  centerBuilding: {
    position: "absolute",
    top: 85,
    left: 145,
    width: 44,
    height: 26,
    backgroundColor: "#b2c5b7",
    borderRadius: 3,
  },
  pinContainer: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  calloutBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    marginBottom: 6,
  },
  calloutText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  radiusCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3f805a",
    backgroundColor: "rgba(63, 128, 90, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pinBaseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.deepGreen,
    marginTop: -3,
  },
  scaleContainer: {
    position: "absolute",
    bottom: 12,
    left: 14,
    alignItems: "flex-start",
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 2,
  },
  scaleBracket: {
    width: 46,
    height: 4,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.ink,
  },
  locateButton: {
    position: "absolute",
    bottom: 12,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ea",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    marginHorizontal: 10,
  },
  badgeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    padding: 16,
    marginTop: 14,
    gap: 14,
  },
  badgeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  badgeCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff4ea",
    alignItems: "center",
    justifyContent: "center",
  },
  statusTextDark: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  statusTextOrange: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d97706",
  },
  bottomSection: {
    width: "100%",
  },
  confirmButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
