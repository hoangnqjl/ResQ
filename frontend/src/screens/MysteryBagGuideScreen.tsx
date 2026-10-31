import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityHeader, communityColors } from "../components/CommunityLayout";

const benefits = [
  {
    icon: "checkmark-circle-outline",
    title: "Daily Fresh Quality",
    detail: "All items are freshly made today and certified safe under Food Safety guidelines.",
  },
  {
    icon: "bag-handle-outline",
    title: "Guaranteed 2x–3x Value",
    detail: "Actual food retail value is always at least double the discounted rescue amount you pay.",
  },
  {
    icon: "pricetag-outline",
    title: "Dietary Category Tags",
    detail: "Pre-sort your surprise bag: Bakery, Savory Bento, or 100% Vegetarian options.",
  },
] as const;

export default function MysteryBagGuideScreen({
  onBack,
  onBrowse,
}: {
  onBack: () => void;
  onBrowse: () => void;
}) {
  return (
    <View style={styles.root}>
      <CommunityHeader title="Mystery Bag Guide" onBack={onBack} onMore={() => {}} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.surpriseBag}>
            <View style={styles.diagonalA} />
            <View style={styles.diagonalB} />
            <Text style={styles.bagLabel}>Surprise bag</Text>
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.eyebrow}>SAVE 50%–70%</Text>
            <Text style={styles.introTitle}>What is inside?</Text>
            <Text style={styles.introDetail}>
              Delicious surplus food packed safely at day&apos;s end. Good for wallet &amp; planet.
            </Text>
          </View>
        </View>
        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit.title} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon} size={29} color={communityColors.ink} />
              </View>
              <View style={styles.benefitCopy}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDetail}>{benefit.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Pressable onPress={onBrowse} style={styles.browseButton}>
        <Text style={styles.browseText}>Browse Today&apos;s Mystery Bags</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 92 },
  intro: { minHeight: 224, flexDirection: "row", alignItems: "center", gap: 16 },
  surpriseBag: { width: "32%", aspectRatio: 0.77, borderWidth: 1.4, borderColor: communityColors.line, borderRadius: 19, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  diagonalA: { position: "absolute", width: "140%", height: 1.5, backgroundColor: communityColors.line, transform: [{ rotate: "48deg" }] },
  diagonalB: { position: "absolute", width: "140%", height: 1.5, backgroundColor: communityColors.line, transform: [{ rotate: "-48deg" }] },
  bagLabel: { color: communityColors.ink, fontSize: 13, fontWeight: "800", backgroundColor: "rgba(255,255,255,0.82)", paddingHorizontal: 5 },
  introCopy: { flex: 1, gap: 8 },
  eyebrow: { color: communityColors.muted, fontSize: 12, fontWeight: "800" },
  introTitle: { color: communityColors.ink, fontSize: 19, fontWeight: "800" },
  introDetail: { color: communityColors.muted, fontSize: 14, lineHeight: 21 },
  benefits: { gap: 15, marginTop: 18 },
  benefitCard: { minHeight: 103, paddingHorizontal: 15, paddingVertical: 15, borderRadius: 25, borderWidth: 1.3, borderColor: communityColors.line, flexDirection: "row", alignItems: "center", gap: 13 },
  benefitIcon: { width: 57, height: 57, borderRadius: 31, backgroundColor: communityColors.pale, alignItems: "center", justifyContent: "center" },
  benefitCopy: { flex: 1 },
  benefitTitle: { color: communityColors.ink, fontSize: 15, fontWeight: "800" },
  benefitDetail: { color: communityColors.muted, fontSize: 13, lineHeight: 19, marginTop: 3 },
  browseButton: { position: "absolute", bottom: 12, left: 18, right: 18, height: 62, borderRadius: 34, backgroundColor: communityColors.green, alignItems: "center", justifyContent: "center" },
  browseText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
