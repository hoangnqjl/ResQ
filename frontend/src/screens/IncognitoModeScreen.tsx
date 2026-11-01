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
import { IncognitoConfirmationModal } from "../components/IncognitoConfirmationModal";
import { ProfilePreviewSheet } from "../components/ProfilePreviewSheet";

type Props = {
  initialEnabled?: boolean;
  userName?: string;
  phone?: string;
  onBack: () => void;
  onToggle: (enabled: boolean) => Promise<void> | void;
  onViewHiddenProfile?: () => void;
};

const FEATURES = [
  "Avatar is hidden",
  "Name replaced by anonymous ID",
  "Phone number not shared",
  "Silent pick-up via QR",
] as const;

export default function IncognitoModeScreen({
  initialEnabled = true,
  userName = "Nguyễn Thị Diễm Quỳnh",
  phone = "(+84) 123456789",
  onBack,
  onToggle,
  onViewHiddenProfile,
}: Props) {
  const [enabled, setEnabled] = useState(Boolean(initialEnabled));
  const [busy, setBusy] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [previewSheetVisible, setPreviewSheetVisible] = useState(false);

  const handleToggle = () => {
    if (busy) return;
    if (!enabled) {
      // Need confirmation before turning on
      setConfirmModalVisible(true);
    } else {
      // Turn off directly
      void applyToggle(false);
    }
  };

  const applyToggle = async (nextState: boolean) => {
    setEnabled(nextState);
    setBusy(true);
    try {
      await onToggle(nextState);
    } catch {
      setEnabled(!nextState);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Incognito Mode</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Box: Buy anonymously */}
        <Pressable
          onPress={handleToggle}
          style={s.toggleCard}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
        >
          <View style={s.toggleTextCol}>
            <Text style={s.cardTitle}>Buy anonymously</Text>
            <Text style={s.cardSubtitle}>
              {enabled ? "Currently ON" : "Currently OFF"}
            </Text>
          </View>

          {/* Custom Switch exactly matching mockup */}
          <View
            style={[
              s.switchTrack,
              enabled ? s.switchTrackOn : s.switchTrackOff,
            ]}
          >
            <View
              style={[
                s.switchThumb,
                enabled ? s.switchThumbOn : s.switchThumbOff,
              ]}
            />
          </View>
        </Pressable>

        {/* Section: When enabled */}
        <Text style={s.sectionTitle}>When enabled</Text>

        {/* Feature checklist card */}
        <View style={s.checklistCard}>
          {FEATURES.map((text) => (
            <View key={text} style={s.checkRow}>
              {enabled ? (
                <View style={s.checkedBadge}>
                  <Ionicons name="checkmark" size={13} color="#ffffff" />
                </View>
              ) : (
                <View style={s.uncheckedBadge} />
              )}
              <Text style={s.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button (visible only when enabled = true) */}
      {Boolean(enabled) ? (
        <View style={s.bottomContainer}>
          <Pressable
            onPress={() => {
              setPreviewSheetVisible(true);
              onViewHiddenProfile?.();
            }}
            style={s.viewProfileButton}
          >
            <Text style={s.viewProfileText}>View hidden profile</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Incognito Confirmation Modal - M1-US-A2-1 */}
      <IncognitoConfirmationModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={() => {
          setConfirmModalVisible(false);
          void applyToggle(true);
        }}
      />

      {/* Public vs Incognito Profile Preview Sheet - M1-US-A2-8 */}
      <ProfilePreviewSheet
        visible={previewSheetVisible}
        onClose={() => setPreviewSheetVisible(false)}
        userName={userName}
        phone={phone}
      />
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
    paddingBottom: 24,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e1e9e2",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "#ffffff",
  },
  toggleTextCol: {
    gap: 4,
  },
  cardTitle: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: colors.ink,
  },
  cardSubtitle: {
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    fontWeight: "500",
  },
  switchTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },
  switchTrackOn: {
    backgroundColor: "#111827",
  },
  switchTrackOff: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#67756d",
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  switchThumbOn: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-end",
    marginRight: 1,
  },
  switchThumbOff: {
    backgroundColor: "#67756d",
    alignSelf: "flex-start",
    marginLeft: 1,
  },
  sectionTitle: {
    fontSize: fontSizes.bodyMedium,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 24,
    marginBottom: 12,
  },
  checklistCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e9e2",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 16,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  uncheckedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#64756a",
    backgroundColor: "transparent",
  },
  featureText: {
    fontSize: fontSizes.bodyMedium,
    color: colors.ink,
    fontWeight: "500",
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  viewProfileButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  viewProfileText: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: "#ffffff",
  },
});
