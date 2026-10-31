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
  buyerId?: string;
  onBack: () => void;
  onSave?: () => Promise<void> | void;
};

export default function AnonymousProfilePreviewScreen({
  buyerId = "#BUYER-2041",
  onBack,
  onSave,
}: Props) {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave?.();
      setSavedSuccess(true);
    } catch {
      // Keep on screen if error
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Top Header - Seamless without bottom border */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Preview</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Anonymous Buyer Badge Card */}
          <View style={s.anonymousCard}>
            <View style={s.avatarCircle}>
              <Ionicons name="person-outline" size={22} color="#526458" />
            </View>

            <View style={s.anonymousTextCol}>
              <Text style={s.anonymousTitle}>Anonymous Buyer</Text>
              <Text style={s.anonymousId}>{buyerId}</Text>
            </View>

            <View style={s.hiddenBadge}>
              <Ionicons name="eye-off-outline" size={14} color="#dc2626" />
              <Text style={s.hiddenText}>Hidden</Text>
            </View>
          </View>

          {/* Section Heading: What the seller sees */}
          <Text style={s.sectionTitle}>What the seller sees</Text>

          {/* What the seller sees Info Card */}
          <View style={s.sellerCard}>
            {/* 1. Name */}
            <View style={s.sellerRow}>
              <View style={s.sellerIconBox}>
                <Ionicons name="person-outline" size={18} color={colors.primary} />
              </View>
              <Text style={s.sellerLabel}>Name</Text>
              <Text style={s.sellerValue}>Anonymous</Text>
            </View>

            <View style={s.rowDivider} />

            {/* 2. Avatar */}
            <View style={s.sellerRow}>
              <View style={s.sellerIconBox}>
                <Ionicons name="image-outline" size={18} color={colors.primary} />
              </View>
              <Text style={s.sellerLabel}>Avatar</Text>
              <Text style={s.sellerValue}>Hidden</Text>
            </View>

            <View style={s.rowDivider} />

            {/* 3. Phone */}
            <View style={s.sellerRow}>
              <View style={s.sellerIconBox}>
                <Ionicons name="call-outline" size={18} color={colors.primary} />
              </View>
              <Text style={s.sellerLabel}>Phone</Text>
              <Text style={s.sellerValue}>Hidden</Text>
            </View>

            <View style={s.rowDivider} />

            {/* 4. Pick-up */}
            <View style={s.sellerRow}>
              <View style={s.sellerIconBox}>
                <Ionicons name="qr-code-outline" size={18} color={colors.primary} />
              </View>
              <Text style={s.sellerLabel}>Pick-up</Text>
              <Text style={s.sellerValue}>QR code only</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Section: Changes saved Card & Save CTA */}
        <View style={s.bottomSection}>
          {savedSuccess && (
            <View style={s.successCard}>
              <View style={s.successCheckCircle}>
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              </View>
              <View style={s.successTextCol}>
                <Text style={s.successTitle}>Changes saved</Text>
                <Text style={s.successSubtitle}>Your profile has been updated.</Text>
              </View>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={s.saveButton}
          >
            <Text style={s.saveButtonText}>
              {saving ? "Saving…" : "Save"}
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
    paddingTop: 16,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  anonymousCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ea",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dbe8dd",
    alignItems: "center",
    justifyContent: "center",
  },
  anonymousTextCol: {
    flex: 1,
    marginLeft: 12,
    gap: 3,
  },
  anonymousTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  anonymousId: {
    fontSize: 12,
    color: colors.muted,
  },
  hiddenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hiddenText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 26,
    marginBottom: 14,
  },
  sellerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    overflow: "hidden",
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sellerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eaf3ea",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  sellerValue: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "500",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#f0f4f1",
    marginLeft: 62,
    marginRight: 14,
  },
  bottomSection: {
    width: "100%",
  },
  successCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  successCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  successTextCol: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  successSubtitle: {
    fontSize: 12,
    color: "#64756a",
  },
  saveButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
