import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

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
      <Pressable onPress={() => onChoose("buyer")} style={s.illustrationTile}><Ionicons name="leaf-outline" size={23} color={colors.ink} /><Text style={s.tileTitle}>Rescue a meal</Text></Pressable>
      <Pressable onPress={() => onChoose("seller")} style={[s.illustrationTile, s.storeTile]}><Ionicons name="storefront-outline" size={23} color={colors.ink} /><Text style={s.tileTitle}>Share surplus</Text></Pressable>
    </View>
    <Text style={s.welcomeTitle}>Good food. Less waste.</Text>
    <Text style={s.welcomeCopy}>Find affordable meals or give your surplus a second chance. Start with your role.</Text>
    <Text style={s.roleHeading}>How will you use ResQ?</Text>
    <Pressable style={s.roleCard} onPress={() => onChoose("buyer")}><View style={s.roleIcon}><Ionicons name="leaf-outline" size={18} color={colors.ink} /></View><View style={s.roleCopy}><Text style={s.roleTitle}>I am a buyer</Text><Text style={s.roleSub}>Find nearby meals and reserve your pickup</Text></View><Text style={s.chevron}>›</Text></Pressable>
    <Pressable style={s.roleCard} onPress={() => onChoose("seller")}><View style={s.roleIcon}><Ionicons name="storefront-outline" size={18} color={colors.ink} /></View><View style={s.roleCopy}><Text style={s.roleTitle}>I am a seller</Text><Text style={s.roleSub}>Share surplus and manage your store</Text></View><Text style={s.chevron}>›</Text></Pressable>
    <Text style={s.roleHint}>You can switch roles later in the menu.</Text>
    <Text style={s.terms}>Terms of service  ·  Privacy policy</Text>
  </ScrollView>;
}

export function BuyerSetupScreen({ onBack, onPreferences, onExplore }: { onBack: () => void; onPreferences: () => void; onExplore: () => void }) {
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Setup Guide</Text><Pressable onPress={onExplore} style={s.roundButton}><Text style={s.headerIcon}>···</Text></Pressable></View>
    <Text style={s.eyebrow}>FOR BUYERS</Text><Text style={s.setupTitle}>Good meals, close to you.</Text><Text style={s.setupSubtitle}>Rescue food in three simple steps.</Text>
    {stepsBuyer.map(([number, title, copy, icon]) => <View key={number} style={s.stepCard}><View style={s.stepTop}><Text style={s.stepNumber}>{number}</Text><Text style={s.stepTitle}>{title}</Text><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={15} color={colors.ink} /></View><Text style={s.stepCopy}>{copy}</Text></View>)}
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
  const toggle = (items: string[], item: string, set: (next: string[]) => void) => set(items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Food Preferences</Text><View style={s.roundButton}><Text style={s.headerIcon}>···</Text></View></View>
    <Text style={s.eyebrow}>YOUR BUYER PROFILE</Text><Text style={s.setupTitle}>Meals that fit you.</Text><Text style={s.setupSubtitle}>Saved to your profile and used to help filter unsafe meals.</Text>
    <Text style={s.sectionLabel}>Your name</Text><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} style={s.input} />
    <Text style={s.sectionLabel}>Allergies</Text><View style={s.chips}>{["Dairy", "Seafood", "Peanuts", "Eggs", "Soy", "Gluten"].map((item) => <Pressable key={item} onPress={() => toggle(allergies, item, setAllergies)} style={[s.chip, allergies.includes(item) && s.chipSelected]}><Text style={[s.chipText, allergies.includes(item) && s.chipSelectedText]}>{item}</Text></Pressable>)}</View>
    <Text style={s.sectionLabel}>Dietary preferences</Text><View style={s.chips}>{["Vegetarian", "Vegan", "Low sugar"].map((item) => <Pressable key={item} onPress={() => toggle(diets, item, setDiets)} style={[s.chip, diets.includes(item) && s.chipSelected]}><Text style={[s.chipText, diets.includes(item) && s.chipSelectedText]}>{item}</Text></Pressable>)}</View>
    <Pressable disabled={busy} onPress={() => { setBusy(true); void onSave(name, allergies, diets).finally(() => setBusy(false)); }} style={s.primary}><Text style={s.primaryText}>{busy ? "Saving…" : "Save preferences"}</Text></Pressable>
  </ScrollView>;
}

export function SellerSetupScreen({ onBack, onSetup, onDashboard }: { onBack: () => void; onSetup: () => void; onDashboard: () => void }) {
  return <ScrollView contentContainerStyle={s.setupPage}>
    <View style={s.setupHeader}><Pressable onPress={onBack} style={s.roundButton}><Text style={s.headerIcon}>‹</Text></Pressable><Text style={s.setupHeaderTitle}>Setup Your Store</Text><Pressable onPress={onDashboard} style={s.roundButton}><Text style={s.headerIcon}>···</Text></Pressable></View>
    <Text style={s.eyebrow}>FOR SELLERS</Text><Text style={s.setupTitle}>Give surplus a second chance.</Text><Text style={s.setupSubtitle}>Set up your store and rescue more food.</Text>
    {stepsSeller.map(([number, title, copy, icon]) => <View key={number} style={s.stepCard}><View style={s.stepTop}><Text style={s.stepNumber}>{number}</Text><Text style={s.stepTitle}>{title}</Text><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={15} color={colors.ink} /></View><Text style={s.stepCopy}>{copy}</Text></View>)}
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
  welcomePage: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 28, backgroundColor: colors.white },
  brand: { height: 34, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, brandName: { color: colors.ink, fontWeight: "900", fontSize: 17 }, brandTag: { color: colors.muted, fontSize: 7, letterSpacing: 0.8 },
  roleIllustration: { marginTop: 12, height: 174, backgroundColor: "#dfe9dd", borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }, illustrationTile: { width: 102, height: 88, borderRadius: 12, borderWidth: 1, borderColor: "#c8d6c9", backgroundColor: "#eaf2e9", alignItems: "center", justifyContent: "center", gap: 5 }, storeTile: { backgroundColor: colors.white, borderColor: "#d5ded5" }, tileIcon: { color: colors.ink, fontSize: 21 }, tileTitle: { color: colors.ink, fontSize: 8, fontWeight: "700" }, welcomeTitle: { color: colors.ink, fontSize: 23, fontWeight: "900", marginTop: 14 }, welcomeCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }, roleHeading: { color: colors.ink, fontSize: 12, fontWeight: "800", marginTop: 17, marginBottom: 8 },
  roleCard: { minHeight: 62, borderWidth: 1, borderColor: colors.line, borderRadius: 18, marginTop: 7, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 10 }, roleIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.pale }, roleCopy: { flex: 1 }, roleTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" }, roleSub: { color: colors.muted, fontSize: 8, marginTop: 3 }, chevron: { color: colors.ink, fontSize: 21 }, roleHint: { color: colors.muted, textAlign: "center", fontSize: 8, marginTop: 13 }, terms: { color: colors.muted, textAlign: "center", fontSize: 8, marginTop: 14 },
  setupPage: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 28, backgroundColor: colors.white }, setupHeader: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }, roundButton: { width: 34, height: 34, borderWidth: 1, borderColor: colors.line, borderRadius: 17, alignItems: "center", justifyContent: "center" }, headerIcon: { color: colors.ink, fontSize: 18 }, setupHeaderTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" }, eyebrow: { alignSelf: "flex-start", backgroundColor: colors.pale, color: colors.primary, borderRadius: 11, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5, fontSize: 7, fontWeight: "800", marginBottom: 9 }, setupTitle: { color: colors.ink, fontSize: 20, lineHeight: 25, fontWeight: "900" }, setupSubtitle: { color: colors.muted, fontSize: 9, marginTop: 5, marginBottom: 13 },
  stepCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 11, marginTop: 7 }, stepTop: { flexDirection: "row", alignItems: "center", gap: 8 }, stepNumber: { width: 19, height: 19, textAlign: "center", textAlignVertical: "center", borderRadius: 10, overflow: "hidden", backgroundColor: colors.ink, color: colors.white, fontSize: 9, fontWeight: "900" }, stepTitle: { flex: 1, color: colors.ink, fontSize: 9, fontWeight: "800" }, stepIcon: { color: colors.ink, fontSize: 15 }, stepCopy: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 7 }, setupNote: { color: colors.muted, fontSize: 8, textAlign: "center", marginTop: 13, marginBottom: 10 }, primary: { minHeight: 42, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 13 }, primaryText: { color: colors.white, fontSize: 9, fontWeight: "800" }, textButton: { minHeight: 30, alignItems: "center", justifyContent: "center" }, textButtonText: { color: colors.muted, fontSize: 8 }, sectionLabel: { color: colors.ink, fontSize: 10, fontWeight: "800", marginTop: 13, marginBottom: 6 }, input: { minHeight: 41, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 11, fontSize: 10, color: colors.ink, textAlignVertical: "center" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 }, chipSelected: { borderColor: colors.primary, backgroundColor: colors.pale }, chipText: { color: colors.muted, fontSize: 8 }, chipSelectedText: { color: colors.primary, fontWeight: "800" },
});
