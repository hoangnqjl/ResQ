import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";
import { AddCustomAllergyModal } from "../components/AddCustomAllergyModal";

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
      <Pressable onPress={() => onChoose("buyer")} style={s.illustrationTile}><Ionicons name="leaf-outline" size={26} color={colors.ink} /><Text style={s.tileTitle}>Rescue a meal</Text></Pressable>
      <Pressable onPress={() => onChoose("seller")} style={[s.illustrationTile, s.storeTile]}><Ionicons name="storefront-outline" size={26} color={colors.ink} /><Text style={s.tileTitle}>Share surplus</Text></Pressable>
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

export function FoodPreferencesScreen({ onBack, onSave, initialName }: { onBack: () => void; onSave: (name: string, allergies: string[], diet: string[]) => Promise<void>; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);
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

export function ShopSetupScreen({ onBack, onSave, busy }: { onBack: () => void; onSave: (name: string, address: string) => Promise<void>; busy: boolean }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Set up your store</Text><View style={s.roundButton}><Text style={s.headerIcon}>···</Text></View></View>
    <Text style={s.eyebrow}>STORE PROFILE</Text><Text style={s.setupTitle}>Build trust in your store.</Text><Text style={s.setupSubtitle}>Buyers will use this address for pickup.</Text>
    <Text style={s.sectionLabel}>Store name</Text><TextInput value={name} onChangeText={setName} placeholder="Your restaurant or shop" placeholderTextColor={colors.muted} style={s.input} />
    <Text style={s.sectionLabel}>Pickup address</Text><TextInput value={address} onChangeText={setAddress} placeholder="Street, ward, district" placeholderTextColor={colors.muted} style={[s.input, { minHeight: 74 }]} multiline />
    <View style={s.stepCard}><Text style={s.stepTitle}>Food safety certificate</Text><Text style={s.stepCopy}>You can add your certificate after creating the store profile.</Text></View>
    <Pressable disabled={busy || !name.trim() || !address.trim()} onPress={() => void onSave(name, address)} style={[s.primary, (!name.trim() || !address.trim()) && { opacity: 0.5 }]}><Text style={s.primaryText}>{busy ? "Creating…" : "Create store profile"}</Text></Pressable>
  </ScrollView>;
}

const s = StyleSheet.create({
  welcomePage: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 32, backgroundColor: colors.white },
  brand: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandName: { color: colors.ink, fontWeight: "900", fontSize: fontSizes.title },
  brandTag: { color: colors.muted, fontSize: fontSizes.caption, fontWeight: "700", letterSpacing: 1 },
  roleIllustration: { marginTop: 14, height: 160, backgroundColor: "#dfe9dd", borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" },
  illustrationTile: { width: 120, height: 100, borderRadius: 14, borderWidth: 1, borderColor: "#c8d6c9", backgroundColor: "#eaf2e9", alignItems: "center", justifyContent: "center", gap: 6 },
  storeTile: { backgroundColor: colors.white, borderColor: "#d5ded5" },
  tileIcon: { color: colors.ink, fontSize: 24 },
  tileTitle: { color: colors.ink, fontSize: fontSizes.bodySmall, fontWeight: "700" },
  welcomeTitle: { color: colors.ink, fontSize: 26, fontWeight: "900", marginTop: 18, lineHeight: 32 },
  welcomeCopy: { color: colors.muted, fontSize: fontSizes.body, lineHeight: 22, marginTop: 6 },
  roleHeading: { color: colors.ink, fontSize: fontSizes.subtitle, fontWeight: "800", marginTop: 22, marginBottom: 10 },
  roleCard: { minHeight: 72, borderWidth: 1, borderColor: colors.line, borderRadius: 18, marginTop: 10, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  roleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.pale },
  roleCopy: { flex: 1, gap: 2 },
  roleTitle: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  roleSub: { color: colors.muted, fontSize: fontSizes.bodySmall, marginTop: 2, lineHeight: 18 },
  chevron: { color: colors.ink, fontSize: 24 },
  roleHint: { color: colors.muted, textAlign: "center", fontSize: fontSizes.caption, marginTop: 16 },
  terms: { color: colors.muted, textAlign: "center", fontSize: fontSizes.caption, marginTop: 14 },

  setupPage: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32, backgroundColor: colors.white },
  setupHeader: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  roundButton: { width: 38, height: 38, borderWidth: 1, borderColor: colors.line, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerIcon: { color: colors.ink, fontSize: 20 },
  setupHeaderTitle: { color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  eyebrow: { alignSelf: "flex-start", backgroundColor: colors.pale, color: colors.primary, borderRadius: 11, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, fontSize: fontSizes.caption, fontWeight: "800", marginBottom: 10 },
  setupTitle: { color: colors.ink, fontSize: fontSizes.header, lineHeight: 30, fontWeight: "900" },
  setupSubtitle: { color: colors.muted, fontSize: fontSizes.body, marginTop: 6, marginBottom: 16, lineHeight: 21 },
  stepCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, marginTop: 10 },
  stepTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNumber: { width: 24, height: 24, textAlign: "center", textAlignVertical: "center", borderRadius: 12, overflow: "hidden", backgroundColor: colors.ink, color: colors.white, fontSize: fontSizes.bodySmall, fontWeight: "900", lineHeight: 24 },
  stepTitle: { flex: 1, color: colors.ink, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  stepIcon: { color: colors.ink, fontSize: 18 },
  stepCopy: { color: colors.muted, fontSize: fontSizes.bodySmall, lineHeight: 19, marginTop: 8 },
  setupNote: { color: colors.muted, fontSize: fontSizes.caption, textAlign: "center", marginTop: 16, marginBottom: 12 },
  primary: { minHeight: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 16 },
  primaryText: { color: colors.white, fontSize: fontSizes.bodyLarge, fontWeight: "800" },
  textButton: { minHeight: 38, alignItems: "center", justifyContent: "center", marginTop: 6 },
  textButtonText: { color: colors.muted, fontSize: fontSizes.bodySmall },
  sectionLabel: { color: colors.ink, fontSize: fontSizes.body, fontWeight: "800", marginTop: 16, marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, fontSize: fontSizes.body, color: colors.ink, textAlignVertical: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.pale },
  chipText: { color: colors.muted, fontSize: fontSizes.bodySmall },
  chipSelectedText: { color: colors.primary, fontWeight: "800" },
});
