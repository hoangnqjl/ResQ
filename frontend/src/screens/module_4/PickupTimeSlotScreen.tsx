import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../../theme";
import { Alert } from "react-native";
import type { FoodSafetyDetail } from "../../services/foodSafetyReservationApi";

type Props = {
  food?: FoodSafetyDetail;
  reservationId?: string;
  onBack: () => void;
  onChoose: (day: string, slot: string) => Promise<void>;
};

export default function PickupTimeSlotScreen({ food, onBack, onChoose }: Props) {
  const [selectedDay, setSelectedDay] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState("19:30 – 20:00");
  const [busy, setBusy] = useState(false);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Khung giờ nhận món</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D3 - 47</Text></View>

        <View style={s.orderSummary}>
          <Text style={s.foodName}>{food?.name ?? "Meal"}</Text>
          <Text style={s.shopText}>{food?.shop_name ?? "ResQ Demo Kitchen"} · {Number(food?.current_price ?? 0).toLocaleString("vi-VN")}đ</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Chọn ngày nhận</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayScroll}>
            {[
              { id: "Today", label: "Hôm nay", sub: "20 Oct" },
              { id: "Wed", label: "Thứ 4", sub: "21 Oct" },
              { id: "Thu", label: "Thứ 5", sub: "22 Oct" },
              { id: "Fri", label: "Thứ 6", sub: "23 Oct" },
            ].map((d) => (
              <Pressable
                key={d.id}
                style={[s.dayBox, selectedDay === d.id && s.dayBoxActive]}
                onPress={() => setSelectedDay(d.id)}
              >
                <Text style={[s.dayLabel, selectedDay === d.id && s.dayLabelActive]}>{d.label}</Text>
                <Text style={[s.daySub, selectedDay === d.id && s.daySubActive]}>{d.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Khung giờ sẵn sàng (Pick-up Time Slot)</Text>
          {[
            { slot: "18:30 – 19:00", avail: "Còn trống" },
            { slot: "19:00 – 19:30", avail: "Đông khách" },
            { slot: "19:30 – 20:00", avail: "Khuyên dùng (Đã chọn)" },
            { slot: "20:00 – 20:30", avail: "Sắp đóng ca" },
          ].map((sItem) => (
            <Pressable
              key={sItem.slot}
              style={[s.slotItem, selectedSlot === sItem.slot && s.slotItemActive]}
              onPress={() => setSelectedSlot(sItem.slot)}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={selectedSlot === sItem.slot ? colors.primary : colors.muted}
              />
              <View style={{ flex: 1 }}>
                <Text style={[s.slotText, selectedSlot === sItem.slot && s.slotTextActive]}>
                  {sItem.slot}
                </Text>
                <Text style={s.slotAvail}>{sItem.avail}</Text>
              </View>
              <Ionicons
                name={selectedSlot === sItem.slot ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selectedSlot === sItem.slot ? colors.primary : colors.muted}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <Pressable style={s.confirmBtn} disabled={busy} onPress={async () => {
          setBusy(true);
          try { await onChoose(selectedDay, selectedSlot); }
          catch (error) { Alert.alert("Không thể lưu khung giờ", error instanceof Error ? error.message : "Vui lòng thử lại."); }
          finally { setBusy(false); }
        }}>
          <Text style={s.confirmBtnText}>{busy ? "Đang lưu…" : "Xác nhận khung giờ"}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: fontSizes.subtitle, fontWeight: "700", color: colors.ink },
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
  orderSummary: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  foodName: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink },
  shopText: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  cardTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  dayScroll: { gap: 10 },
  dayBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.pale2,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
  },
  dayBoxActive: { backgroundColor: colors.pale, borderColor: colors.primary },
  dayLabel: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  dayLabelActive: { color: colors.primary },
  daySub: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  daySubActive: { color: colors.primary, fontWeight: "600" },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    marginBottom: 10,
  },
  slotItemActive: { borderColor: colors.primary, backgroundColor: colors.pale },
  slotText: { fontSize: fontSizes.bodyMedium, fontWeight: "600", color: colors.ink },
  slotTextActive: { fontWeight: "800", color: colors.primary },
  slotAvail: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

