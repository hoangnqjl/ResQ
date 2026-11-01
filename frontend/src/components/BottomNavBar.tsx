import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

export const BOTTOM_TABS = [
  ["Home", "home-outline"],
  ["Explore", "search-outline"],
  ["Maps", "map-outline"],
  ["Saved", "bookmark-outline"],
  ["Profile", "person-outline"],
] as const;

export type TabName = (typeof BOTTOM_TABS)[number][0];

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  floating?: boolean;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

export function BottomNavBar({
  activeTab,
  onTabChange,
  floating = false,
  bottomInset = 0,
  style,
}: Props) {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.bar,
    floating
      ? [styles.floating, { bottom: Math.max(8, bottomInset + 6) }]
      : styles.static,
    style,
  ];

  return (
    <View style={containerStyle}>
      {BOTTOM_TABS.map(([label, icon]) => {
        const isActive = activeTab === label;
        return (
          <Pressable
            key={label}
            onPress={() => onTabChange(label)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            hitSlop={4}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={icon as any}
                size={20}
                color={isActive ? colors.primary : "#4f6356"}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[styles.label, isActive && styles.labelActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e3ebe5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    shadowColor: "#213628",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  static: {
    marginHorizontal: 16,
    marginBottom: 6,
  },
  floating: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 44,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.pale,
  },
  label: {
    fontSize: fontSizes.micro,
    color: "#53665a",
    fontWeight: "500",
    marginTop: 1,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "800",
  },
});

export default BottomNavBar;
