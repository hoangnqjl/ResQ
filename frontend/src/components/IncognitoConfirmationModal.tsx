import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function IncognitoConfirmationModal({
  visible,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={s.card}>
          {/* Eye Off Icon Circle */}
          <View style={s.iconCircle}>
            <Ionicons name="eye-off-outline" size={24} color={colors.deepGreen} />
          </View>

          {/* Title */}
          <Text style={s.title}>Turn on Incognito Mode?</Text>

          {/* Subtitle */}
          <Text style={s.subtitle}>
            Your real name, avatar and phone number will be hidden on the receipt
            and the store's cashier screen.
          </Text>

          {/* 3 Hidden items card */}
          <View style={s.itemsCard}>
            {/* 1. Real name */}
            <View style={s.itemRow}>
              <View style={s.itemIconCircle}>
                <Ionicons name="person-outline" size={15} color="#55655b" />
              </View>
              <Text style={s.itemLabel}>Real name</Text>
              <Text style={s.itemStatus}>Hidden</Text>
            </View>

            {/* 2. Avatar */}
            <View style={s.itemRow}>
              <View style={s.itemIconCircle}>
                <Ionicons name="image-outline" size={15} color="#55655b" />
              </View>
              <Text style={s.itemLabel}>Avatar</Text>
              <Text style={s.itemStatus}>Hidden</Text>
            </View>

            {/* 3. Phone number */}
            <View style={s.itemRow}>
              <View style={s.itemIconCircle}>
                <Ionicons name="call-outline" size={15} color="#55655b" />
              </View>
              <Text style={s.itemLabel}>Phone number</Text>
              <Text style={s.itemStatus}>Hidden</Text>
            </View>
          </View>

          {/* Button Row */}
          <View style={s.buttonRow}>
            <Pressable onPress={onClose} style={s.cancelButton}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onClose();
                onConfirm();
              }}
              style={s.confirmButton}
            >
              <Text style={s.confirmText}>Turn on</Text>
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
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 335,
    backgroundColor: "#ffffff",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#eaf3ea",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: fontSizes.titleSmall,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  itemsCard: {
    width: "100%",
    backgroundColor: "#f7f9f7",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6ede7",
  },
  itemLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: fontSizes.bodySmall,
    fontWeight: "600",
    color: colors.ink,
  },
  itemStatus: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.muted,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fdf2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: fontSizes.bodyMedium,
    fontWeight: "700",
    color: "#b91c1c",
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: fontSizes.bodyMedium,
    fontWeight: "800",
    color: "#ffffff",
  },
});
