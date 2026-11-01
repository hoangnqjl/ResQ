import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  phone?: string;
  receiptId?: string;
};

export function ProfilePreviewSheet({
  visible,
  onClose,
  userName = "Nguyễn Thị Diễm Quỳnh",
  phone = "(+84) 123456789",
  receiptId = "#BUYER-2041",
}: Props) {
  const [mode, setMode] = useState<"normal" | "incognito">("incognito");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={s.sheet}>
          {/* Sheet Handle */}
          <View style={s.handle} />

          {/* Title & Subtitle */}
          <Text style={s.title}>Profile preview</Text>
          <Text style={s.subtitle}>What the store sees on the cashier screen</Text>

          {/* Segmented Mode Selector */}
          <View style={s.segmentedContainer}>
            <Pressable
              onPress={() => setMode("normal")}
              style={[
                s.segmentTab,
                mode === "normal" && s.segmentTabActiveNormal,
              ]}
            >
              <Text
                style={[
                  s.segmentText,
                  mode === "normal" && s.segmentTextActiveNormal,
                ]}
              >
                Normal mode
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("incognito")}
              style={[
                s.segmentTab,
                mode === "incognito" && s.segmentTabActiveIncognito,
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={15}
                color={mode === "incognito" ? "#ffffff" : "#64756a"}
              />
              <Text
                style={[
                  s.segmentText,
                  mode === "incognito" && s.segmentTextActiveIncognito,
                ]}
              >
                Incognito Protected
              </Text>
            </Pressable>
          </View>

          {/* Preview Info Card */}
          <View style={s.card}>
            {/* 1. Name */}
            <View style={s.cardRow}>
              <View style={s.iconCol}>
                <Ionicons name="person-outline" size={17} color="#6b7280" />
              </View>
              <Text style={s.label}>Name</Text>
              <Text style={s.value}>{userName}</Text>
            </View>

            {/* 2. Avatar */}
            <View style={s.cardRow}>
              <View style={s.iconCol}>
                <Ionicons name="image-outline" size={17} color="#6b7280" />
              </View>
              <Text style={s.label}>Avatar</Text>
              <Text style={s.value}>Profile photo</Text>
              {mode === "incognito" ? (
                <View style={s.hiddenBadge}>
                  <Ionicons name="eye-off-outline" size={13} color="#dc2626" />
                  <Text style={s.hiddenText}>Hidden</Text>
                </View>
              ) : (
                <View style={s.visibleBadge}>
                  <Text style={s.visibleText}>Visible</Text>
                </View>
              )}
            </View>

            {/* 3. Phone */}
            <View style={s.cardRow}>
              <View style={s.iconCol}>
                <Ionicons name="call-outline" size={17} color="#6b7280" />
              </View>
              <Text style={s.label}>Phone</Text>
              <Text style={s.value}>{phone}</Text>
              {mode === "incognito" ? (
                <View style={s.hiddenBadge}>
                  <Ionicons name="eye-off-outline" size={13} color="#dc2626" />
                  <Text style={s.hiddenText}>Hidden</Text>
                </View>
              ) : (
                <View style={s.visibleBadge}>
                  <Text style={s.visibleText}>Visible</Text>
                </View>
              )}
            </View>

            {/* 4. Receipt */}
            <View style={s.cardRow}>
              <View style={s.iconCol}>
                <Ionicons name="receipt-outline" size={17} color="#6b7280" />
              </View>
              <Text style={s.label}>Receipt</Text>
              <Text style={s.value}>{receiptId}</Text>
            </View>
          </View>

          {/* Got it CTA */}
          <Pressable onPress={onClose} style={s.gotItButton}>
            <Text style={s.gotItText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(18, 30, 22, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d7ded8",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: fontSizes.titleSmall,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 18,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f5f2",
    borderRadius: 22,
    padding: 3,
    marginBottom: 18,
  },
  segmentTab: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segmentTabActiveNormal: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabActiveIncognito: {
    backgroundColor: colors.deepGreen,
  },
  segmentText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "700",
    color: "#64756a",
  },
  segmentTextActiveNormal: {
    color: colors.ink,
  },
  segmentTextActiveIncognito: {
    color: "#ffffff",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e4ece5",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 22,
    backgroundColor: "#ffffff",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCol: {
    width: 24,
    alignItems: "flex-start",
  },
  label: {
    width: 58,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    fontWeight: "500",
  },
  value: {
    flex: 1,
    fontSize: fontSizes.bodySmall,
    fontWeight: "600",
    color: colors.ink,
  },
  hiddenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hiddenText: {
    fontSize: fontSizes.badge,
    fontWeight: "700",
    color: "#dc2626",
  },
  visibleBadge: {
    backgroundColor: "#eaf3ea",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  visibleText: {
    fontSize: fontSizes.badge,
    fontWeight: "700",
    color: colors.primary,
  },
  gotItButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  gotItText: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: "#ffffff",
  },
});
