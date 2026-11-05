import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";

type Props = {
  food?: FoodSafetyDetail;
  onBack: () => void;
  onLater: () => void;
  onHold: (minutes: number, quantity: number) => Promise<void>;
};

export default function ConfirmSpotReservationScreen({ food, onBack, onLater, onHold }: Props) {
  const [minutes, setMinutes] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const price = Number(food?.current_price ?? 24000);
  const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

  const calculateArrival = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Confirm Spot Reservation</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D1 - 41</Text></View>

        <View style={s.foodCard}>
          <FallbackPhoto
            uri={imageUrl(food?.image_url)}
            fallback={foodPhoto(food?.name ?? "chicken rice")}
            style={s.foodThumb}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.foodName}>{food?.name ?? "Combo Sushi & Rice"} × {quantity}</Text>
            <Text style={s.shopSub}>{food?.shop_name ?? "ResQ Demo Kitchen"} · {food?.address ?? "Pickup address"}</Text>
            <Text style={s.closeTime}>Store closes at 22:45</Text>
            <Text style={s.priceHighlight}>{money(price * quantity)}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Portion Quantity:</Text>
          <View style={s.qtyRow}>
            <Pressable
              style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={18} color={colors.ink} />
            </Pressable>
            <Text style={s.qtyVal}>{quantity}</Text>
            <Pressable
              style={s.qtyBtn}
              onPress={() => setQuantity((q) => Math.min(food?.quantity_available ?? q + 1, q + 1))}
              disabled={quantity >= (food?.quantity_available ?? 99)}
            >
              <Ionicons name="add" size={18} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.rowBetween}>
            <Text style={s.cardTitle}>Holding Duration</Text>
            <Text style={s.badgeHighlight}>{minutes} mins selected</Text>
          </View>
          <Text style={s.cardSub}>
            The system temporarily locks this meal while you are heading to the store.
          </Text>

          <View style={s.timeRow}>
            {[15, 20, 30].map((m) => (
              <Pressable
                key={m}
                style={[s.timeBtn, minutes === m && s.timeBtnActive]}
                onPress={() => setMinutes(m)}
              >
                <Text style={[s.timeText, minutes === m && s.timeTextActive]}>{m} mins</Text>
              </Pressable>
            ))}
          </View>

          <View style={s.alertNote}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={s.alertText}>
              This meal is reserved specifically for you. If the time expires without pickup, it will automatically release to others or move to the waitlist.
            </Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Pickup Window</Text>
          <View style={s.windowRow}>
            <Ionicons name="bicycle-outline" size={24} color={colors.primary} />
            <View>
              <Text style={s.windowTime}>Estimated arrival before {calculateArrival()}</Text>
              <Text style={s.windowSub}>Estimated arrival time based on your travel time.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable style={s.laterBtn} onPress={onLater}><Text style={s.laterText}>Later</Text></Pressable>
        <Pressable style={[s.actionBtn, busy && { opacity: 0.65 }]} disabled={busy} onPress={async () => {
          setBusy(true);
          try { await onHold(minutes, quantity); }
          catch (error) { Alert.alert("Unable to hold spot", error instanceof Error ? error.message : "Please try again."); }
          finally { setBusy(false); }
        }}>
          <Text style={s.actionBtnText}>{busy ? "Reserving spot…" : "I'm on my way"}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    height: 38,
    width: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: colors.ink,
    marginTop: -3,
  },
  headerTitle: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: colors.ink,
    flex: 1,
    textAlign: "center",
  },
  content: { padding: 16, gap: 14, paddingBottom: 100 },
  badgeBox: { alignItems: "flex-start" },
  badge: {
    fontSize: fontSizes.caption,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  foodThumb: { width: 70, height: 70, borderRadius: 10 },
  foodName: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink },
  shopSub: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  closeTime: { fontSize: fontSizes.micro, color: colors.orange, marginTop: 2 },
  priceHighlight: { fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.primary, marginTop: 4 },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  cardTitle: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink },
  cardSub: { fontSize: fontSizes.bodyMedium, color: colors.muted, marginTop: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badgeHighlight: {
    fontSize: fontSizes.caption,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: colors.pale,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 12 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pale,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyVal: { fontSize: fontSizes.subtitle, fontWeight: "700", color: colors.ink },
  timeRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  timeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.pale2,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
  },
  timeBtnActive: { backgroundColor: colors.pale, borderColor: colors.primary },
  timeText: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.muted },
  timeTextActive: { color: colors.primary, fontWeight: "800" },
  alertNote: {
    flexDirection: "row",
    backgroundColor: colors.pale,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 14,
  },
  alertText: { fontSize: fontSizes.caption, color: colors.ink, lineHeight: 18, flex: 1 },
  windowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.pale2,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  windowTime: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  windowSub: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cọcNotice: { fontSize: fontSizes.micro, color: colors.muted },
  bottomTotal: { fontSize: fontSizes.title, fontWeight: "800", color: colors.primary },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
  laterBtn: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 46, borderRadius: 24, backgroundColor: colors.pale },
  laterText: { color: colors.primary, fontWeight: "700", fontSize: fontSizes.body },
});

