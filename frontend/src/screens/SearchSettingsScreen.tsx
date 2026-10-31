import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { requestJson } from "../api";

type Props = { userId: string; onBack: () => void };
type SortPriority = "Nearest distance (Default)" | "Highest discount percentage (> 60%)" | "Expiring soonest (Strict countdown)";
type Preferences = {
  sortPriority: SortPriority;
  radiusKm: number;
  inStockOnly: boolean;
  freeParkingOnly: boolean;
  saveHistory: boolean;
  upcomingDrops: boolean;
};
const defaults: Preferences = {
  sortPriority: "Nearest distance (Default)",
  radiusKm: 1,
  inStockOnly: true,
  freeParkingOnly: true,
  saveHistory: true,
  upcomingDrops: false,
};
const radii = [0.5, 1, 2, 3];
const sortOptions: SortPriority[] = [
  "Nearest distance (Default)",
  "Highest discount percentage (> 60%)",
  "Expiring soonest (Strict countdown)",
];
const storageKey = (userId: string) => `resq.search-settings.${userId}`;

export default function SearchSettingsScreen({ userId, onBack }: Props) {
  const [settings, setSettings] = useState<Preferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      AsyncStorage.getItem(storageKey(userId)),
      requestJson<{ notification_radius_km: number | string }>(`/api/users/${encodeURIComponent(userId)}/preferences`),
    ]).then(([stored, serverPreferences]) => {
      if (!active) return;
      let local = defaults;
      if (stored) {
        try {
          local = { ...defaults, ...JSON.parse(stored) as Partial<Preferences> };
        } catch {
          setError("Saved search settings are invalid. Default choices are shown.");
        }
      }
      const radius = Number(serverPreferences.notification_radius_km);
      setSettings({
        ...local,
        radiusKm: radii.includes(radius) ? radius : defaults.radiusKm,
      });
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load search settings.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const current = await requestJson<{ quiet_start: string; quiet_end: string }>(
        `/api/users/${encodeURIComponent(userId)}/preferences`,
      );
      await requestJson(`/api/users/${encodeURIComponent(userId)}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_radius_km: settings.radiusKm,
          quiet_start: String(current.quiet_start).slice(0, 5),
          quiet_end: String(current.quiet_end).slice(0, 5),
        }),
      });
      await AsyncStorage.setItem(storageKey(userId), JSON.stringify(settings));
      Alert.alert("Settings saved", "Your search preferences have been applied.", [{ text: "OK", onPress: onBack }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save search settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: "inStockOnly" | "freeParkingOnly" | "saveHistory" | "upcomingDrops", value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Search settings" onBack={onBack} onMore={() => Alert.alert("Search settings", "Preferences apply to search results on this device.")} />
      {loading ? <View style={styles.loading}><ActivityIndicator color={communityColors.green} /></View> : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.heading}>Default sort priority</Text>
            <View style={styles.sortList}>
              {sortOptions.map((option) => (
                <Pressable key={option} onPress={() => setSettings((current) => ({ ...current, sortPriority: option }))} style={styles.sortRow}>
                  <Text style={[styles.sortText, settings.sortPriority === option && styles.sortTextSelected]}>{option}</Text>
                  <View style={[styles.radio, settings.sortPriority === option && styles.radioSelected]}>
                    {settings.sortPriority === option ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              ))}
            </View>
            <Text style={styles.heading}>Default search radius</Text>
            <View style={styles.radiusRow}>
              {radii.map((radius) => (
                <Pressable key={radius} onPress={() => setSettings((current) => ({ ...current, radiusKm: radius }))} style={[styles.radiusPill, settings.radiusKm === radius && styles.radiusActive]}>
                  <Text style={[styles.radiusText, settings.radiusKm === radius && styles.radiusTextActive]}>
                    {radius === 0.5 ? "500m" : `${radius.toFixed(1)} km`}{settings.radiusKm === radius ? " ✓" : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.heading}>Search preferences &amp; filters</Text>
            <PreferenceRow title="In-stock items only" description="Hide items already sold out for today" value={settings.inStockOnly} onChange={(value) => toggle("inStockOnly", value)} />
            <PreferenceRow title="Free parking shops only" description="Only show stores without 5k parking fee" value={settings.freeParkingOnly} onChange={(value) => toggle("freeParkingOnly", value)} />
            <PreferenceRow title="Save search history" description="Keep recent searches for fast reuse" value={settings.saveHistory} onChange={(value) => toggle("saveHistory", value)} />
            <PreferenceRow title="Show upcoming drops (in 1h)" description="Display stores preparing to open drops" value={settings.upcomingDrops} onChange={(value) => toggle("upcomingDrops", value)} />
            <View style={{ height: 92 }} />
          </ScrollView>
          <Pressable disabled={saving} onPress={() => void save()} style={[styles.apply, saving && styles.disabled]}>
            <Text style={styles.applyText}>{saving ? "Saving…" : "Apply settings"}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function PreferenceRow({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: "#eaf3eb", true: communityColors.green }} thumbColor="#fff" ios_backgroundColor="#eaf3eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 18, paddingTop: 9, paddingBottom: 20 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#a23930", fontSize: 12, marginBottom: 10 },
  heading: { color: communityColors.ink, fontSize: 15, fontWeight: "800", marginTop: 14, marginBottom: 12 },
  sortList: { gap: 9 },
  sortRow: { minHeight: 55, borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 30, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  sortText: { color: communityColors.ink, fontSize: 13, flex: 1 },
  sortTextSelected: { fontWeight: "800" },
  radio: { width: 23, height: 23, borderRadius: 13, borderWidth: 1.5, borderColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  radioSelected: { backgroundColor: communityColors.green, borderColor: communityColors.green },
  radioDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: "#fff" },
  radiusRow: { flexDirection: "row", justifyContent: "space-between", gap: 7 },
  radiusPill: { flex: 1, minHeight: 42, borderRadius: 24, borderWidth: 1.2, borderColor: communityColors.line, alignItems: "center", justifyContent: "center" },
  radiusActive: { backgroundColor: communityColors.pale, borderColor: communityColors.pale },
  radiusText: { color: communityColors.ink, fontSize: 12 },
  radiusTextActive: { fontWeight: "800" },
  preferenceRow: { minHeight: 78, borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 23, paddingHorizontal: 15, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  preferenceCopy: { flex: 1 },
  preferenceTitle: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  preferenceDescription: { color: communityColors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  apply: { position: "absolute", bottom: 12, left: 18, right: 18, height: 57, borderRadius: 30, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.6 },
  applyText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
