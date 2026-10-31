import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddTag: (tagName: string) => void;
};

const SUGGESTIONS = ["Onion", "Fermented soy", "Gluten"] as const;

export function AddCustomAllergyModal({ visible, onClose, onAddTag }: Props) {
  const [allergyName, setAllergyName] = useState("Onion");

  const handleSelectSuggestion = (item: string) => {
    setAllergyName(item);
  };

  const handleAdd = () => {
    const trimmed = allergyName.trim();
    if (!trimmed) return;
    onAddTag(trimmed);
    setAllergyName("");
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={s.card}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Add custom allergy</Text>
            <Pressable onPress={handleClose} style={s.closeButton} hitSlop={8}>
              <Ionicons name="close" size={18} color="#183d2d" />
            </Pressable>
          </View>

          {/* Allergy name input */}
          <Text style={s.label}>Allergy name</Text>
          <TextInput
            value={allergyName}
            onChangeText={setAllergyName}
            placeholder="e.g. Onion"
            placeholderTextColor="#94a89b"
            style={s.input}
            autoFocus={false}
          />

          {/* Suggestions */}
          <Text style={s.suggestionsTitle}>Suggestions</Text>
          <View style={s.suggestionsRow}>
            {SUGGESTIONS.map((item) => {
              const isSelected = allergyName.trim().toLowerCase() === item.toLowerCase();
              return (
                <Pressable
                  key={item}
                  onPress={() => handleSelectSuggestion(item)}
                  style={[s.chip, isSelected && s.chipSelected]}
                >
                  <Text style={[s.chipText, isSelected && s.chipTextSelected]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Notice box */}
          <View style={s.noticeBox}>
            <Text style={s.noticeText}>
              Dishes containing this tag will be hidden automatically.
            </Text>
          </View>

          {/* Action buttons */}
          <View style={s.buttonRow}>
            <Pressable onPress={handleClose} style={s.cancelButton}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleAdd}
              disabled={!allergyName.trim()}
              style={[
                s.addButton,
                !allergyName.trim() && s.addButtonDisabled,
              ]}
            >
              <Text style={s.addText}>Add tag</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(18, 30, 22, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 348,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#183d2d",
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eaf3ea",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#223b2c",
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#dbe5dc",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#183d2d",
    backgroundColor: "#ffffff",
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#223b2c",
    marginTop: 18,
    marginBottom: 10,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d5dfd6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "#ffffff",
  },
  chipSelected: {
    borderColor: "#176b49",
    backgroundColor: "#eaf3ea",
  },
  chipText: {
    fontSize: 13,
    color: "#223b2c",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#176b49",
    fontWeight: "700",
  },
  noticeBox: {
    backgroundColor: "#ebf4ea",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 18,
    marginBottom: 22,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#275039",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#faede8",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#c24734",
    fontSize: 15,
    fontWeight: "700",
  },
  addButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#176b49",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
