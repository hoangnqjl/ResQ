import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import { AddCustomAllergyModal } from "../../components/AddCustomAllergyModal";

const stepsBuyer = [
  ["1", "Make food fit your needs", "Set allergies and dietary preferences. Check labels, expiry and storage before ordering.", "shield-checkmark-outline"],
  ["2", "Find and reserve a meal", "Explore nearby meals. Hold a portion or choose a pickup slot, then confirm the deposit.", "navigate-outline"],
  ["3", "Collect with your pickup QR", "Arrive within your pickup time and show your QR to staff for a quick, silent handover.", "qr-code-outline"],
];
const stepsSeller = [
  ["1", "Build trust in your store", "Add your store location and food safety certificate so buyers know where to collect.", "storefront-outline"],
  ["2", "Post surplus in seconds", "Choose items from your menu, add quantity, check food labels and set your rescue price.", "leaf-outline"],
  ["3", "Manage pickups and your shift", "Scan buyer QR codes to hand over orders. Track deposits, complaints and shift reports.", "qr-code-outline"],
];

export function WelcomeScreen({ onChoose }: { onChoose: (role: "buyer" | "seller") => void }) {
  return <ScrollView contentContainerStyle={s.welcomePage}>
    <View style={s.brand}><Text style={s.brandName}>ResQ</Text><Text style={s.brandTag}>FOOD RESCUE</Text></View>
    <View style={s.roleIllustration}>
      <Pressable onPress={() => onChoose("buyer")} style={s.buyerIllustration}><Ionicons name="leaf-outline" size={23} color={colors.ink} /><Text style={s.tileTitle}>Rescue a meal</Text></Pressable>
      <Pressable onPress={() => onChoose("seller")} style={s.sellerIllustration}><Ionicons name="storefront-outline" size={32} color={colors.ink} /><Text style={s.tileTitle}>Share surplus</Text></Pressable>
    </View>
    <Text style={s.welcomeTitle}>Good food. Less waste.</Text>
    <Text style={s.welcomeCopy}>Find affordable meals or give your surplus a second chance. Start with your role.</Text>
    <Text style={s.roleHeading}>How will you use ResQ?</Text>
    <Pressable style={s.roleCard} onPress={() => onChoose("buyer")}><View style={s.roleIcon}><Ionicons name="leaf-outline" size={22} color={colors.ink} /></View><View style={s.roleCopy}><Text style={s.roleTitle}>I am a buyer</Text><Text style={s.roleSub}>Find nearby meals and reserve your pickup</Text></View><Text style={s.chevron}>›</Text></Pressable>
    <Pressable style={s.roleCard} onPress={() => onChoose("seller")}><View style={s.roleIcon}><Ionicons name="storefront-outline" size={22} color={colors.ink} /></View><View style={s.roleCopy}><Text style={s.roleTitle}>I am a seller</Text><Text style={s.roleSub}>Share surplus and manage your store</Text></View><Text style={s.chevron}>›</Text></Pressable>
    <Text style={s.roleHint}>You can switch roles later in the menu.</Text>
    <Text style={s.terms}>Terms of service  ·  Privacy policy</Text>
  </ScrollView>;
}

export function BuyerSetupScreen({ onBack, onPreferences, onExplore }: { onBack: () => void; onPreferences: () => void; onExplore: () => void }) {
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Setup Guide</Text><Pressable onPress={onExplore} style={s.roundButton}><Text style={s.headerIcon}>···</Text></Pressable></View>
    <Text style={s.eyebrow}>FOR BUYERS</Text><Text style={s.setupTitle}>Good meals, close to you.</Text><Text style={s.setupSubtitle}>Rescue food in three simple steps.</Text>
    {stepsBuyer.map(([number, title, copy, icon]) => <View key={number} style={s.stepCard}><View style={s.stepTop}><Text style={s.stepNumber}>{number}</Text><Text style={s.stepTitle}>{title}</Text><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.ink} /></View><Text style={s.stepCopy}>{copy}</Text></View>)}
    <Text style={s.setupNote}>Your preferences can be changed in Settings.</Text>
    <Pressable onPress={onPreferences} style={s.primary}><Text style={s.primaryText}>Set my food preferences</Text></Pressable>
    <Pressable onPress={onExplore} style={s.textButton}><Text style={s.textButtonText}>Explore meals first</Text></Pressable>
  </ScrollView>;
}

export function FoodPreferencesScreen({ onBack, onSave, initialName, initialAllergies = [], initialDiets = [] }: { onBack: () => void; onSave: (name: string, allergies: string[], diet: string[]) => Promise<void>; initialName: string; initialAllergies?: string[]; initialDiets?: string[] }) {
  const [name, setName] = useState(initialName);
  const [allergies, setAllergies] = useState<string[]>(initialAllergies);
  const [diets, setDiets] = useState<string[]>(initialDiets);
  const [busy, setBusy] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const toggle = (items: string[], item: string, set: (next: string[]) => void) => set(items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  const defaultList = ["Dairy", "Seafood", "Peanuts", "Eggs", "Soy", "Gluten"];
  const allList = Array.from(new Set([...defaultList, ...allergies]));
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Food Preferences</Text><View style={s.roundButton}><Text style={s.headerIcon}>···</Text></View></View>
    <Text style={s.eyebrow}>YOUR BUYER PROFILE</Text><Text style={s.setupTitle}>Meals that fit you.</Text><Text style={s.setupSubtitle}>Saved to your profile and used to help filter unsafe meals.</Text>
    <Text style={s.sectionLabel}>Your name</Text><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} style={s.input} />
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 }}>
      <Text style={[s.sectionLabel, { marginTop: 0, marginBottom: 0 }]}>Allergies</Text>
      <Pressable onPress={() => setCustomModalVisible(true)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eaf3ea", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, gap: 4 }}>
        <Ionicons name="add" size={16} color={colors.primary} />
        <Text style={{ fontSize: fontSizes.caption, color: colors.primary, fontWeight: "700" }}>Add custom</Text>
      </Pressable>
    </View>
    <View style={s.chips}>
      {allList.map((item) => (
        <Pressable key={item} onPress={() => toggle(allergies, item, setAllergies)} style={[s.chip, allergies.includes(item) && s.chipSelected]}>
          <Text style={[s.chipText, allergies.includes(item) && s.chipSelectedText]}>{item}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => setCustomModalVisible(true)} style={[s.chip, { borderStyle: "dashed", borderColor: colors.primary }]}>
        <Text style={[s.chipText, { color: colors.primary, fontWeight: "700" }]}>+ Custom allergy</Text>
      </Pressable>
    </View>
    <Text style={s.sectionLabel}>Dietary preferences</Text><View style={s.chips}>{["Vegetarian", "Vegan", "Low sugar"].map((item) => <Pressable key={item} onPress={() => toggle(diets, item, setDiets)} style={[s.chip, diets.includes(item) && s.chipSelected]}><Text style={[s.chipText, diets.includes(item) && s.chipSelectedText]}>{item}</Text></Pressable>)}</View>
    <Pressable disabled={busy} onPress={() => { setBusy(true); void onSave(name, allergies, diets).finally(() => setBusy(false)); }} style={s.primary}><Text style={s.primaryText}>{busy ? "Saving…" : "Save preferences"}</Text></Pressable>
    <AddCustomAllergyModal
      visible={customModalVisible}
      onClose={() => setCustomModalVisible(false)}
      onAddTag={(tag) => {
        if (!allergies.includes(tag)) setAllergies([...allergies, tag]);
      }}
    />
  </ScrollView>;
}

export function SellerSetupScreen({ onBack, onSetup, onDashboard }: { onBack: () => void; onSetup: () => void; onDashboard: () => void }) {
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Setup Your Store</Text><Pressable onPress={onDashboard} style={s.roundButton}><Text style={s.headerIcon}>···</Text></Pressable></View>
    <Text style={s.eyebrow}>FOR SELLERS</Text><Text style={s.setupTitle}>Give surplus a second chance.</Text><Text style={s.setupSubtitle}>Set up your store and rescue more food.</Text>
    {stepsSeller.map(([number, title, copy, icon]) => <View key={number} style={s.stepCard}><View style={s.stepTop}><Text style={s.stepNumber}>{number}</Text><Text style={s.stepTitle}>{title}</Text><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.ink} /></View><Text style={s.stepCopy}>{copy}</Text></View>)}
    <Text style={s.setupNote}>Set your pickup cut-off before the store closes.</Text>
    <Pressable onPress={onSetup} style={s.primary}><Text style={s.primaryText}>Set up your store</Text></Pressable>
    <Pressable onPress={onDashboard} style={s.textButton}><Text style={s.textButtonText}>Open store dashboard</Text></Pressable>
  </ScrollView>;
}

export function ShopSetupScreen({ onBack, onSave, busy }: { onBack: () => void; onSave: (name: string, address: string, storeType: string, phone: string) => Promise<void>; busy: boolean }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [storeType, setStoreType] = useState("Bakery");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const storeTypes = ["Bakery", "Restaurant", "Café", "Grocery", "Other"];
  const submit = async () => {
    if (saving || !name.trim() || !address.trim()) return;
    setSaving(true);
    try { await onSave(name.trim(), address.trim(), storeType, phone.trim()); }
    catch { Alert.alert("Could not save store", "Please check your details and try again."); }
    finally { setSaving(false); }
  };
  return <View style={s.storeRoot}>
    <View style={s.storeHeader}>
      <Pressable onPress={onBack} style={s.roundButton} accessibilityLabel="Back"><Text style={s.headerIcon}>‹</Text></Pressable>
      <Text style={s.setupHeaderTitle}>Setup Your Store</Text>
      <Pressable style={s.roundButton} accessibilityLabel="More options"><Text style={s.headerIcon}>···</Text></Pressable>
    </View>
    <ScrollView contentContainerStyle={s.storeContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={s.storeTitle}>Tell buyers about your store</Text>
      <Text style={s.storeSubtitle}>Buyers see this before they reserve, so keep it accurate.</Text>
      <Text style={s.storeLabel}>Store name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Tiệm bánh Nắng Mai" placeholderTextColor={colors.muted} style={s.storeInput} />
      <Text style={s.storeLabel}>Store type</Text>
      <View style={s.storeTypes}>{storeTypes.map((type) => <Pressable key={type} onPress={() => setStoreType(type)} style={[s.storeType, type === storeType && s.storeTypeActive]}><Text style={[s.storeTypeText, type === storeType && s.storeTypeTextActive]}>{type}</Text></Pressable>)}</View>
      <Text style={s.storeLabel}>Pickup address</Text>
      <View style={s.addressInputWrap}><Ionicons name="search-outline" size={17} color={colors.muted} /><TextInput value={address} onChangeText={setAddress} placeholder="Search address" placeholderTextColor={colors.muted} style={s.addressInput} /></View>
      <Pressable onPress={() => setAddress((current) => current || "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng")} style={s.pinCard}><Ionicons name="location-outline" size={16} color={colors.ink} /><Text style={s.pinText}>Drag pin to set exact spot</Text></Pressable>
      <Pressable style={s.locationRow} onPress={() => { setUseCurrentLocation((value) => !value); if (!useCurrentLocation && !address) setAddress("Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng"); }}>
        <View style={[s.checkbox, useCurrentLocation && s.checkboxChecked]}>{useCurrentLocation ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}</View><Text style={s.locationText}>Use my current location</Text>
      </Pressable>
      <Text style={s.storeLabel}>Phone number</Text>
      <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+84 90 123 4567" placeholderTextColor={colors.muted} style={s.storeInput} />
      <View style={{ height: 110 }} />
    </ScrollView>
    <View style={s.storeCta}><Pressable disabled={busy || saving || !name.trim() || !address.trim()} onPress={() => void submit()} style={[s.primary, (!name.trim() || !address.trim()) && { opacity: 0.55 }]}><Text style={s.primaryText}>{busy || saving ? "Saving…" : "Save"}</Text></Pressable></View>
  </View>;
}

const s = StyleSheet.create({
  welcomePage: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, backgroundColor: colors.white },
  brand: { height: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandName: { color: colors.ink, fontWeight: "700", fontSize: fontSizes.header },
  brandTag: { color: colors.muted, fontSize: fontSizes.micro, fontWeight: "500", letterSpacing: 0.8 },
  roleIllustration: { marginTop: 12, height: 230, backgroundColor: "#dfe6dc", borderRadius: 22, position: "relative", overflow: "hidden" },
  buyerIllustration: { position: "absolute", left: 24, bottom: 18, width: 135, height: 106, borderRadius: 16, borderWidth: 1, borderColor: "#bfcbbf", backgroundColor: "#e9f1e8", alignItems: "center", justifyContent: "center", gap: 5 },
  sellerIllustration: { position: "absolute", top: 44, right: 24, width: 150, height: 130, borderRadius: 16, borderWidth: 1, borderColor: "#bfc4be", backgroundColor: colors.white, alignItems: "center", justifyContent: "center", gap: 8 },
  tileTitle: { color: colors.ink, fontSize: fontSizes.caption, fontWeight: "600" },
  welcomeTitle: { color: colors.ink, fontSize: fontSizes.headerLarge, fontWeight: "700", marginTop: 18, lineHeight: 32 },
  welcomeCopy: { color: colors.muted, fontSize: fontSizes.bodySmall, lineHeight: 19, marginTop: 4 },
  roleHeading: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  roleCard: { minHeight: 82, borderWidth: 1, borderColor: colors.line, borderRadius: 30, marginTop: 10, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  roleIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.pale },
  roleCopy: { flex: 1, gap: 2 },
  roleTitle: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "600" },
  roleSub: { color: colors.muted, fontSize: fontSizes.badge, marginTop: 1, lineHeight: 16 },
  chevron: { color: colors.ink, fontSize: fontSizes.header },
  roleHint: { color: colors.muted, textAlign: "center", fontSize: fontSizes.caption, marginTop: 16 },
  terms: { color: colors.muted, textAlign: "center", fontSize: fontSizes.badge, marginTop: 14 },

  setupPage: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32, backgroundColor: colors.white },
  setupHeader: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  roundButton: { width: 38, height: 38, borderWidth: 1, borderColor: colors.line, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerIcon: { color: colors.ink, fontSize: fontSizes.title },
  setupHeaderTitle: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "600" },
  eyebrow: { alignSelf: "flex-start", backgroundColor: colors.pale, color: colors.primary, borderRadius: 11, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, fontSize: fontSizes.caption, fontWeight: "600", marginBottom: 10 },
  setupTitle: { color: colors.ink, fontSize: fontSizes.header, lineHeight: 31, fontWeight: "700" },
  setupSubtitle: { color: colors.muted, fontSize: fontSizes.body, marginTop: 6, marginBottom: 16, lineHeight: 21 },
  stepCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 15, marginTop: 10 },
  stepTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNumber: { width: 30, height: 30, textAlign: "center", textAlignVertical: "center", borderRadius: 15, overflow: "hidden", backgroundColor: colors.ink, color: colors.white, fontSize: fontSizes.bodySmall, fontWeight: "600", lineHeight: 30 },
  stepTitle: { flex: 1, color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "600" },
  stepIcon: { color: colors.ink, fontSize: fontSizes.subtitle },
  stepCopy: { color: colors.muted, fontSize: fontSizes.bodySmall, lineHeight: 19.5, marginTop: 8 },
  setupNote: { color: colors.muted, fontSize: fontSizes.caption, textAlign: "center", marginTop: 16, marginBottom: 12 },
  primary: { minHeight: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 16 },
  primaryText: { color: colors.white, fontSize: fontSizes.bodySmall, fontWeight: "500" },
  textButton: { minHeight: 38, alignItems: "center", justifyContent: "center", marginTop: 6 },
  textButtonText: { color: colors.muted, fontSize: fontSizes.bodySmall },
  sectionLabel: { color: colors.ink, fontSize: fontSizes.body, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, fontSize: fontSizes.body, color: colors.ink, textAlignVertical: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.pale },
  chipText: { color: colors.muted, fontSize: fontSizes.bodySmall },
  chipSelectedText: { color: colors.primary, fontWeight: "600" },
  storeRoot: { flex: 1, backgroundColor: colors.white },
  storeHeader: { height: 52, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storeContent: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 16 },
  storeTitle: { color: colors.ink, fontSize: fontSizes.header, lineHeight: 31, fontWeight: "700", marginBottom: 8 },
  storeSubtitle: { color: colors.muted, fontSize: fontSizes.bodySmall, lineHeight: 19, marginBottom: 16 },
  storeLabel: { color: colors.ink, fontSize: fontSizes.body, fontWeight: "600", marginBottom: 7, marginTop: 10 },
  storeInput: { height: 46, borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, color: colors.ink, fontSize: fontSizes.bodySmall },
  storeTypes: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 1 },
  storeType: { minHeight: 32, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  storeTypeActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  storeTypeText: { color: colors.ink, fontSize: fontSizes.caption },
  storeTypeTextActive: { color: colors.white },
  addressInputWrap: { minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  addressInput: { flex: 1, color: colors.ink, fontSize: fontSizes.bodySmall, paddingVertical: 8 },
  pinCard: { minHeight: 68, marginTop: 7, borderRadius: 16, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  pinText: { color: colors.ink, fontSize: fontSizes.caption },
  locationRow: { minHeight: 30, flexDirection: "row", alignItems: "center", gap: 9, marginTop: 4 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  locationText: { color: colors.ink, fontSize: fontSizes.caption },
  storeCta: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 2 },
});
