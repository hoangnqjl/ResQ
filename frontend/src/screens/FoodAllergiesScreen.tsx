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
import { AddCustomAllergyModal } from "../components/AddCustomAllergyModal";

type Props = {
  initialAllergies?: string[];
  onBack: () => void;
  onSave: (allergies: string[]) => Promise<void> | void;
};

const DEFAULT_ALLERGENS = [
  "Milk",
  "Peanut",
  "Seafood",
  "Egg",
  "Gluten",
  "Soy",
  "Tree nuts",
  "Sesame",
];

export default function FoodAllergiesScreen({
  initialAllergies = ["Milk", "Seafood"],
  onBack,
  onSave,
}: Props) {
  const [allergensList, setAllergensList] = useState<string[]>(() => {
    // Merge initialAllergies with default allergens, maintaining order
    const merged = [...DEFAULT_ALLERGENS];
    for (const item of initialAllergies) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
    return merged;
  });

  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    initialAllergies.length ? initialAllergies : ["Milk", "Seafood"]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleAllergen = (item: string) => {
    setSavedSuccess(false);
    setSelectedAllergens((prev) =>
      prev.includes(item)
        ? prev.filter((a) => a !== item)
        : [...prev, item]
    );
  };

  const handleAddCustomTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!allergensList.includes(trimmed)) {
      setAllergensList((prev) => [...prev, trimmed]);
    }
    if (!selectedAllergens.includes(trimmed)) {
      setSelectedAllergens((prev) => [...prev, trimmed]);
    }
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(selectedAllergens);
      setSavedSuccess(true);
    } catch {
      // Keep on screen if error
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Header - Seamless without bottom border */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Food Allergies</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Box */}
          <View style={s.infoBox}>
            <Text style={s.infoText}>
              Dishes containing selected allergens are hidden automatically.
            </Text>
          </View>

          {/* Section Title */}
          <Text style={s.sectionTitle}>Select allergens</Text>

          {/* Allergens Chips Cloud */}
          <View style={s.chipsWrap}>
            {allergensList.map((item) => {
              const isSelected = selectedAllergens.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggleAllergen(item)}
                  style={[s.chip, isSelected ? s.chipSelected : s.chipUnselected]}
                >
                  <Text
                    style={[
                      s.chipText,
                      isSelected ? s.chipTextSelected : s.chipTextUnselected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Floating Action Button (+) */}
        <View style={s.floatingRow}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={s.floatingAddButton}
            accessibilityLabel="Add custom allergy tag"
          >
            <Ionicons name="add" size={24} color={colors.ink} />
          </Pressable>
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
                <Text style={s.successSubtitle}>Your Allergies has been updated.</Text>
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

      {/* Add Custom Allergy Tag Modal - M1-US-A1-2 */}
      <AddCustomAllergyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTag={handleAddCustomTag}
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
  },
  scrollContent: {
    paddingBottom: 16,
  },
  infoBox: {
    backgroundColor: "#eaf3ea",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#28523b",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 20,
    marginBottom: 14,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1ded4",
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  chipTextUnselected: {
    color: colors.ink,
    fontWeight: "600",
  },
  floatingRow: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  floatingAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
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
