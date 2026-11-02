import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";

type PrivacyFlags = { hideAvatar: boolean; hideName: boolean; hideOrderHistory: boolean };
const defaults: PrivacyFlags = { hideAvatar: true, hideName: true, hideOrderHistory: false };
const keyFor = (userId: string) => `resq.privacy-settings.${userId}`;

export default function PrivacySettingsScreen({ userId, incognitoEnabled, onBack, onOpenIncognito }: {
  userId: string; incognitoEnabled: boolean; onBack: () => void; onOpenIncognito: () => void;
}) {
  const [flags, setFlags] = useState(defaults);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(keyFor(userId)).then((saved) => {
      if (!active || !saved) return;
      try { setFlags({ ...defaults, ...JSON.parse(saved) as Partial<PrivacyFlags> }); }
      catch { Alert.alert("Privacy settings", "Saved settings could not be read."); }
    }).catch(() => undefined);
    return () => { active = false; };
  }, [userId]);

  const update = (field: keyof PrivacyFlags, value: boolean) => {
    const next = { ...flags, [field]: value };
    setFlags(next);
    void AsyncStorage.setItem(keyFor(userId), JSON.stringify(next)).catch(() =>
      Alert.alert("Privacy settings", "Could not save this change."),
    );
  };

  return <View style={s.root}>
    <View style={s.header}>
      <Pressable onPress={onBack} style={s.headerButton} accessibilityLabel="Back"><Ionicons name="chevron-back" size={20} color={colors.ink} /></Pressable>
      <Text style={s.title}>Privacy</Text>
      <Pressable onPress={() => Alert.alert("Privacy", "Choose what sellers can see when you use ResQ.")} style={s.headerButton} accessibilityLabel="More options"><Ionicons name="ellipsis-horizontal" size={21} color={colors.ink} /></Pressable>
    </View>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.card}>
        <Pressable style={s.incognitoRow} onPress={onOpenIncognito}>
          <Ionicons name="radio-button-on-outline" size={14} color="#4f5d54" />
          <Text style={s.rowLabel}>Incognito Mode</Text>
          <Text style={s.modeValue}>{incognitoEnabled ? "On" : "Off"}</Text>
          <Ionicons name="chevron-forward" size={14} color="#a0aaa3" />
        </Pressable>
        <PrivacyToggle icon="radio-button-on-outline" label="Hide avatar" value={flags.hideAvatar} onValueChange={(v) => update("hideAvatar", v)} />
        <PrivacyToggle icon="radio-button-on-outline" label="Hide name from seller" value={flags.hideName} onValueChange={(v) => update("hideName", v)} />
        <PrivacyToggle icon="radio-button-on-outline" label="Hide order history" value={flags.hideOrderHistory} onValueChange={(v) => update("hideOrderHistory", v)} last />
      </View>
      <View style={s.notice}>
        <Text style={s.noticeText}>Seller only sees a pick-up QR code and an anonymous ID.</Text>
      </View>
    </ScrollView>
  </View>;
}

function PrivacyToggle({ icon, label, value, onValueChange, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: boolean; onValueChange: (value: boolean) => void; last?: boolean }) {
  return <View style={[s.toggleRow, !last && s.divider]}>
    <Ionicons name={icon} size={14} color="#4f5d54" />
    <Text style={s.rowLabel}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.pale, true: colors.primary }} thumbColor="#ffffff" ios_backgroundColor={colors.pale} />
  </View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  title: { color: colors.ink, fontSize: fontSizes.subtitle, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 63, paddingBottom: 24 },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: 18, overflow: "hidden", backgroundColor: colors.white },
  incognitoRow: { minHeight: 50, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  toggleRow: { minHeight: 50, paddingLeft: 16, paddingRight: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { flex: 1, color: colors.ink, fontSize: fontSizes.body, fontWeight: "400" },
  modeValue: { color: colors.ink, fontSize: fontSizes.bodySmall },
  notice: { minHeight: 66, marginTop: 16, borderRadius: 17, backgroundColor: colors.pale, paddingHorizontal: 16, justifyContent: "center" },
  noticeText: { color: colors.ink, fontSize: fontSizes.bodySmall, lineHeight: 18 },
});
