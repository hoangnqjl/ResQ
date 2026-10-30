import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const communityColors = {
  ink: "#193d2e",
  green: "#176b49",
  muted: "#75847a",
  line: "#e1e9e1",
  pale: "#eaf3eb",
  orange: "#ad5315",
  paleOrange: "#fff0df",
  white: "#ffffff",
};

export function CommunityHeader({
  title,
  onBack,
  onMore,
}: {
  title: string;
  onBack: () => void;
  onMore: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.headerButton} accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={19} color={communityColors.ink} />
      </Pressable>
      <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
      <Pressable onPress={onMore} style={styles.headerButton} accessibilityLabel="More options">
        <Ionicons name="ellipsis-horizontal" size={21} color={communityColors.ink} />
      </Pressable>
    </View>
  );
}

export function FilterPill({
  label,
  selected,
  onPress,
  warm = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  warm?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        selected && styles.filterSelected,
        warm && !selected && styles.filterWarm,
      ]}
    >
      <Text style={[
        styles.filterText,
        selected && styles.filterTextSelected,
        warm && !selected && styles.filterTextWarm,
      ]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
  },
  headerButton: {
    width: 39,
    height: 39,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: communityColors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginHorizontal: 8,
  },
  filterPill: {
    flex: 1,
    height: 32,
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: communityColors.white,
  },
  filterSelected: {
    borderColor: communityColors.green,
    backgroundColor: communityColors.green,
  },
  filterWarm: {
    borderColor: "#e9e2d9",
  },
  filterText: {
    color: "#3d5548",
    fontSize: 11,
  },
  filterTextSelected: {
    color: communityColors.white,
    fontWeight: "700",
  },
  filterTextWarm: {
    color: communityColors.orange,
  },
});
