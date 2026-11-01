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
  initialDiet?: string;
  onBack: () => void;
  onSave: (diet: string) => Promise<void> | void;
};

const DIET_OPTIONS = [
  "Vegetarian",
  "Non-vegetarian",
  "Vegan",
  "No preference",
] as const;

export default function DietScreen({
  initialDiet = "Non-vegetarian",
  onBack,
  onSave,
}: Props) {
  const [selectedDiet, setSelectedDiet] = useState<string>(
    initialDiet || "Non-vegetarian"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(selectedDiet);
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
        <Text style={s.headerTitle}>Diet</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <View style={s.container}>
        {/* Diet Options List */}
        <View style={s.optionsList}>
          {DIET_OPTIONS.map((option) => {
            const isSelected = selectedDiet === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setSelectedDiet(option);
                  setSavedSuccess(false);
                }}
                style={s.optionCard}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={s.optionLabel}>{option}</Text>

                {/* Radio / Check indicator */}
                {isSelected ? (
                  <View style={s.selectedBadge}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                ) : (
                  <View style={s.unselectedBadge} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Bottom Section: Changes saved Card & Save CTA */}
        <View style={s.bottomSection}>
          {savedSuccess && (
            <View style={s.successCard}>
              <View style={s.successCheckCircle}>
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              </View>
              <View style={s.successTextCol}>
                <Text style={s.successTitle}>Changes saved</Text>
                <Text style={s.successSubtitle}>Your diet has been updated.</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontSize: fontSizes.body,
    fontWeight: "700",
    color: colors.ink,
  },
  selectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#64756a",
    backgroundColor: "transparent",
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
    fontSize: fontSizes.bodyMedium,
    fontWeight: "800",
    color: colors.ink,
  },
  successSubtitle: {
    fontSize: fontSizes.caption,
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
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: "#ffffff",
  },
});
