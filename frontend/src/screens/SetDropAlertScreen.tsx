import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { foodPhoto } from "../data/designPhotos";
import { getSavedShops, imageUrl, saveSearchDropAlert, type SavedShop } from "../services/communityApi";
import type { SearchAlertOptions } from "../services/communityApi";

type Props = { userId: string; onBack: () => void };
type Target = "food" | "shop";
const suggestions = ["Bánh mì", "Cơm trưa", "Trà sữa"];
const radii = [
  { label: "< 1 km", value: 0.5 },
  { label: "3 km", value: 3 },
  { label: "5 km", value: 5 },
];
const times = ["Any time", "After 19:00", "After 20:30"];

function Choice({
  label,
  selected,
  onPress,
  targetSize = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  targetSize?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, targetSize && styles.targetChoice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SetDropAlertScreen({ userId, onBack }: Props) {
  const [target, setTarget] = useState<Target>("shop");
  const [keyword, setKeyword] = useState("");
  const [radius, setRadius] = useState(3);
  const [discountsOnly, setDiscountsOnly] = useState(true);
  const [freeOnly, setFreeOnly] = useState(false);
  const [timeWindow, setTimeWindow] = useState("After 19:00");
  const [customTime, setCustomTime] = useState({ hour: 20, minute: 30 });
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [shops, setShops] = useState<SavedShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [loadingShops, setLoadingShops] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (target !== "shop") return;
    let active = true;
    setLoadingShops(true);
    setError("");
    void getSavedShops(userId, { includeDesignSamples: true })
      .then(({ items }) => {
        if (!active) return;
        setShops(items);
        setSelectedShopId((current) => items.some((shop) => shop.id === current) ? current : items[0]?.id ?? "");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load saved shops.");
      })
      .finally(() => { if (active) setLoadingShops(false); });
    return () => { active = false; };
  }, [target, userId]);

  const selectedShop = useMemo(() => shops.find((shop) => shop.id === selectedShopId), [shops, selectedShopId]);
  const alertKeyword = target === "shop" ? selectedShop?.name ?? "" : keyword.trim();
  const displayTime = timeWindow === "Set time"
    ? `${String(customTime.hour).padStart(2, "0")}:${String(customTime.minute).padStart(2, "0")}`
    : timeWindow;

  const save = async () => {
    if (!alertKeyword || saving) return;
    const options: SearchAlertOptions = {
      target,
      shopIds: selectedShop ? [selectedShop.id] : [],
      discountsOnly,
      freeOnly,
      timeWindow: displayTime,
    };
    setSaving(true);
    try {
      await saveSearchDropAlert(userId, alertKeyword, radius, options);
      Alert.alert("Drop-alert saved", `You will be alerted for ${alertKeyword}.`, [{ text: "OK", onPress: onBack }]);
    } catch (reason) {
      Alert.alert("Could not save Drop-alert", reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stepTime = (key: "hour" | "minute", delta: number) => {
    setCustomTime((current) => {
      const value = (current[key] + delta + (key === "hour" ? 24 : 60)) % (key === "hour" ? 24 : 60);
      return { ...current, [key]: value };
    });
  };

  return (
    <View style={styles.root}>
      <CommunityHeader title="Set Drop-alert" onBack={onBack} onMore={() => Alert.alert("Drop-alert", "Choose what food and stores you want to hear about.")} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>ALERT TARGET</Text>
        <View style={styles.targetRow}>
          <Choice label="Food item" selected={target === "food"} onPress={() => setTarget("food")} targetSize />
          <Choice label="Saved shop" selected={target === "shop"} onPress={() => setTarget("shop")} targetSize />
        </View>
        {target === "food" ? (
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={communityColors.ink} />
              <TextInput value={keyword} onChangeText={setKeyword} placeholder="E.g. Bánh mì, cơm tấm, salad..." placeholderTextColor={communityColors.ink} style={styles.searchInput} returnKeyType="done" />
            </View>
            <View style={styles.suggestions}>
              {suggestions.map((item) => (
                <Pressable key={item} onPress={() => setKeyword(item)} style={styles.suggestion}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.eyebrow, styles.spaced]}>APPLY TO STORES</Text>
            <View style={styles.radioList}>
              <Pressable onPress={() => {}} style={styles.radioRow}>
                <View style={[styles.radio, styles.radioSelected]}><View style={styles.radioDot} /></View>
                <Text style={styles.radioText}>Any store nearby</Text>
              </Pressable>
              <Pressable onPress={() => setTarget("shop")} style={styles.radioRow}>
                <View style={styles.radio} />
                <Text style={styles.radioText}>Only my saved stores</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {loadingShops ? <ActivityIndicator style={styles.shopLoading} color={communityColors.green} /> : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : shops.length ? (
              <>
                {selectedShop ? (
                  <View style={styles.selectedShopCard}>
                    <FallbackPhoto
                      uri={imageUrl(selectedShop.image_url)}
                      fallback={foodPhoto(selectedShop.name)}
                      style={styles.selectedShopPhoto}
                    />
                    <View style={styles.selectedShopCopy}>
                      <Text style={styles.selectedShopEyebrow}>SELECTED SHOP</Text>
                      <Text numberOfLines={1} style={styles.shopName}>{selectedShop.name}</Text>
                      <Text numberOfLines={1} style={styles.shopAddress}>{selectedShop.address}</Text>
                    </View>
                    <Ionicons name="bookmark-outline" size={18} color={communityColors.ink} />
                  </View>
                ) : null}
                <View style={styles.shopList}>
                  {shops.map((shop, index) => (
                    <Pressable
                      key={shop.id}
                      onPress={() => setSelectedShopId(shop.id)}
                      style={[styles.shopRow, index === shops.length - 1 && styles.shopRowLast]}
                    >
                      <View style={styles.shopCopy}>
                        <Text numberOfLines={1} style={styles.shopName}>{shop.name}</Text>
                        <Text numberOfLines={1} style={styles.shopAddress}>{shop.address}</Text>
                      </View>
                      <View style={[styles.radio, selectedShopId === shop.id && styles.radioSelected]}>
                        {selectedShopId === shop.id ? <View style={styles.radioDot} /> : null}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noShops}>
                <Text style={styles.noShopsText}>Save a shop first to create a shop-specific alert.</Text>
              </View>
            )}
          </>
        )}

        {target === "food" ? (
          <>
            <Text style={[styles.eyebrow, styles.sectionGap]}>SEARCH RADIUS</Text>
            <View style={styles.radiusRow}>
              {radii.map((item) => (
                <Choice key={item.value} label={item.label} selected={radius === item.value} onPress={() => setRadius(item.value)} />
              ))}
            </View>
          </>
        ) : null}
        <Text style={[styles.eyebrow, styles.sectionGap, styles.discountHeading]}>DISCOUNT REQUIREMENT</Text>
        <Pressable onPress={() => { setDiscountsOnly((value) => !value); setFreeOnly(false); }} style={styles.checkRow}>
          <View style={[styles.checkbox, discountsOnly && styles.checkboxSelected]}>{discountsOnly ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}</View>
          <Text style={styles.checkText}>50% – 70% discounts</Text>
        </Pressable>
        <Pressable onPress={() => { setFreeOnly((value) => !value); setDiscountsOnly(false); }} style={styles.checkRow}>
          <View style={[styles.checkbox, freeOnly && styles.checkboxSelected]}>{freeOnly ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}</View>
          <Text style={styles.checkText}>Free food only (0đ)</Text>
        </Pressable>
        <Text style={[styles.eyebrow, styles.sectionGap]}>TIME WINDOW</Text>
        <View style={styles.timeGrid}>
          <View style={styles.timeRow}>
            {times.slice(0, 2).map((item) => <Choice key={item} label={item} selected={timeWindow === item} onPress={() => setTimeWindow(item)} />)}
          </View>
          <View style={styles.timeRow}>
            <Choice label={times[2]} selected={timeWindow === times[2]} onPress={() => setTimeWindow(times[2])} />
            <Choice label={timeWindow === "Set time" ? displayTime : "Set time"} selected={timeWindow === "Set time"} onPress={() => setTimePickerOpen(true)} />
          </View>
        </View>
        <View style={{ height: 85 }} />
      </ScrollView>
      <Pressable disabled={!alertKeyword || saving || (target === "shop" && !selectedShop)} onPress={() => void save()} style={[styles.saveButton, (!alertKeyword || saving || (target === "shop" && !selectedShop)) && styles.saveDisabled]}>
        <Text style={[styles.saveText, (!alertKeyword || saving || (target === "shop" && !selectedShop)) && styles.saveTextDisabled]}>
          {saving ? "Saving…" : "Save Drop-alert"}
        </Text>
      </Pressable>

      <Modal visible={timePickerOpen} transparent animationType="slide" onRequestClose={() => setTimePickerOpen(false)}>
        <View style={styles.modalScrim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTimePickerOpen(false)} />
          <View style={styles.timeSheet}>
            <View style={styles.handle} />
            <Pressable onPress={() => setTimePickerOpen(false)} style={styles.closeButton}><Ionicons name="close" size={20} color={communityColors.ink} /></Pressable>
            <Text style={styles.eyebrow}>TIME WINDOW</Text>
            <Text style={styles.timeTitle}>Set alert time</Text>
            <Text style={styles.timeDescription}>Choose the earliest time you want to receive food-drop alerts.</Text>
            <View style={styles.timePickerRow}>
              <Pressable onPress={() => stepTime("hour", 1)}><Text style={styles.adjust}>+</Text></Pressable>
              <View><Text style={styles.timeNumber}>{String(customTime.hour).padStart(2, "0")}</Text><Text style={styles.timeUnit}>HOUR</Text></View>
              <Pressable onPress={() => stepTime("hour", -1)}><Text style={styles.adjust}>−</Text></Pressable>
              <Text style={styles.colon}>:</Text>
              <Pressable onPress={() => stepTime("minute", 1)}><Text style={styles.adjust}>+</Text></Pressable>
              <View><Text style={styles.timeNumber}>{String(customTime.minute).padStart(2, "0")}</Text><Text style={styles.timeUnit}>MINUTE</Text></View>
              <Pressable onPress={() => stepTime("minute", -1)}><Text style={styles.adjust}>−</Text></Pressable>
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setTimePickerOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable onPress={() => { setTimeWindow("Set time"); setTimePickerOpen(false); }} style={styles.applyButton}><Text style={styles.applyText}>Apply time</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 18, paddingTop: 0, paddingBottom: 22 },
  eyebrow: { color: communityColors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 0.8, marginBottom: 11 },
  targetRow: { flexDirection: "row", gap: 12 },
  choice: { flex: 1, minHeight: 31, paddingHorizontal: 9, borderRadius: 23, borderWidth: 1.2, borderColor: communityColors.line, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  targetChoice: { minHeight: 35 },
  choiceSelected: { backgroundColor: communityColors.green, borderColor: communityColors.green },
  choiceText: { color: communityColors.ink, fontSize: 13 },
  choiceTextSelected: { color: "#fff", fontWeight: "800" },
  searchBox: { minHeight: 42, borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 28, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  searchInput: { flex: 1, color: communityColors.ink, fontSize: 13, paddingVertical: 0 },
  suggestions: { flexDirection: "row", gap: 8, marginTop: 9 },
  suggestion: { minHeight: 31, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: communityColors.line, backgroundColor: communityColors.pale, justifyContent: "center" },
  suggestionText: { color: communityColors.ink, fontSize: 13 },
  spaced: { marginTop: 24 },
  radioList: { gap: 12, marginTop: 7 },
  radioRow: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 11 },
  radio: { width: 16, height: 16, borderRadius: 10, borderWidth: 1.5, borderColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderWidth: 2 },
  radioDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: communityColors.green },
  radioText: { color: communityColors.ink, fontSize: 13 },
  shopLoading: { marginVertical: 20 },
  errorText: { color: "#a23930", fontSize: 12, paddingVertical: 14 },
  shopList: { borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 20, paddingHorizontal: 10 },
  selectedShopCard: { minHeight: 82, borderWidth: 1.2, borderColor: communityColors.line, borderRadius: 20, padding: 10, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, marginBottom: 14 },
  selectedShopPhoto: { width: 60, height: 60, borderRadius: 13, backgroundColor: communityColors.pale },
  selectedShopCopy: { flex: 1, gap: 4 },
  selectedShopEyebrow: { color: communityColors.muted, fontSize: 10, fontWeight: "700" },
  shopRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderColor: communityColors.line },
  shopRowLast: { borderBottomWidth: 0 },
  shopCopy: { flex: 1 },
  shopName: { color: communityColors.ink, fontSize: 13, fontWeight: "800" },
  shopAddress: { color: communityColors.muted, fontSize: 12, marginTop: 4 },
  noShops: { minHeight: 70, borderRadius: 18, backgroundColor: communityColors.pale, justifyContent: "center", paddingHorizontal: 15 },
  noShopsText: { color: communityColors.muted, fontSize: 12 },
  sectionGap: { marginTop: 24 },
  radiusRow: { flexDirection: "row", gap: 9 },
  checkRow: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: 11 },
  discountHeading: { marginBottom: 4 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: communityColors.green, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  checkboxSelected: { backgroundColor: communityColors.ink, borderColor: communityColors.ink },
  checkText: { color: communityColors.ink, fontSize: 13 },
  timeGrid: { gap: 8 },
  timeRow: { flexDirection: "row", gap: 9 },
  saveButton: { position: "absolute", bottom: 58, left: 18, right: 18, height: 48, borderRadius: 30, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  saveDisabled: { backgroundColor: "#fff" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  saveTextDisabled: { color: communityColors.muted },
  modalScrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,29,23,0.38)" },
  timeSheet: { minHeight: 384, borderTopLeftRadius: 25, borderTopRightRadius: 25, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 22, paddingBottom: 23 },
  handle: { position: "absolute", top: 9, alignSelf: "center", width: 43, height: 5, borderRadius: 4, backgroundColor: communityColors.pale },
  closeButton: { position: "absolute", top: 34, right: 18, width: 43, height: 43, borderRadius: 23, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  timeTitle: { color: communityColors.ink, fontSize: 21, marginTop: 2 },
  timeDescription: { color: communityColors.muted, fontSize: 13, lineHeight: 19, marginTop: 15 },
  timePickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 35, paddingHorizontal: 5 },
  adjust: { color: communityColors.ink, fontSize: 25, fontWeight: "700" },
  timeNumber: { color: communityColors.ink, fontSize: 33, fontWeight: "800", textAlign: "center" },
  timeUnit: { color: communityColors.muted, fontSize: 11, textAlign: "center", marginTop: 5 },
  colon: { color: communityColors.ink, fontSize: 28, fontWeight: "800" },
  modalActions: { flexDirection: "row", alignItems: "center", marginTop: 38, gap: 12 },
  cancelButton: { flex: 1, height: 49, alignItems: "center", justifyContent: "center" },
  cancelText: { color: communityColors.ink, fontSize: 13, fontWeight: "700" },
  applyButton: { flex: 1.4, height: 49, borderRadius: 26, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  applyText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
