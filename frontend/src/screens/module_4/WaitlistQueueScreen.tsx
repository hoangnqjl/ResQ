import { useEffect, useState } from "react";
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
import type { FoodSafetyDetail, WaitlistStatus } from "../../services/foodSafetyReservationApi";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";

type Props = {
  food?: FoodSafetyDetail;
  waitlist: WaitlistStatus | null;
  userId: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
  onLoad: () => Promise<void>;
  onJoin: () => Promise<void>;
};

export default function WaitlistQueueScreen({ food, waitlist, userId, onBack, onNavigate, onLoad, onJoin }: Props) {
  const [busy, setBusy] = useState(false);
  const myEntry = waitlist?.waitlist.find((row) => row.user_id === userId);
  useEffect(() => { void onLoad(); }, [food?.id]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Hàng đợi Waitlist</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badgeBox}><Text style={s.badge}>US - D4 - 51</Text></View>

        <View style={s.headerCard}>
          <FallbackPhoto
            uri={imageUrl(food?.image_url)}
            fallback={foodPhoto(food?.name ?? "chicken rice")}
            style={s.foodThumb}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.foodName}>{food?.name ?? "Meal"}</Text>
            <Text style={s.shopText}>{food?.shop_name ?? "ResQ Demo Kitchen"}</Text>
            <Text style={s.priceText}>{Number(food?.current_price ?? 0).toLocaleString("vi-VN")}đ/suất · {food?.quantity_available ?? 0} suất còn lại</Text>
          </View>
        </View>

        {/* Count Tabs */}
        <View style={s.countRow}>
          <View style={s.countBox}>
            <Text style={s.countVal}>{waitlist?.heldCount ?? 0}</Text>
            <Text style={s.countLabel}>Đang giữ chỗ</Text>
          </View>
          <View style={[s.countBox, s.countBoxActive]}>
            <Text style={[s.countVal, s.countValActive]}>{waitlist?.waitlistCount ?? 0}</Text>
            <Text style={[s.countLabel, s.countValActive]}>Trong hàng chờ</Text>
          </View>
        </View>

        {/* My Position Card */}
        <View style={s.myPosCard}>
          <View style={s.myPosHeader}>
            <View style={s.myPosBadge}>
              <Text style={s.myPosBadgeText}>VỊ TRÍ CỦA BẠN</Text>
            </View>
            <Text style={s.autoReleaseText}>Tự động nhận suất khi có người hủy</Text>
          </View>

          <View style={s.posCenter}>
            <Text style={s.posNumber}>#{myEntry?.queue_position ?? "—"}</Text>
            <Text style={s.posSub}>{myEntry ? `Bạn đang ở vị trí ${myEntry.queue_position} trong hàng đợi` : "Bạn chưa tham gia hàng đợi"}</Text>
          </View>

          <View style={s.noticeBox}>
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            <Text style={s.noticeText}>
              Hệ thống sẽ gửi Push Notification thông báo ngay lập tức nếu người giữ chỗ trước bùng hẹn hoặc hủy đơn. Bạn có 15 phút để xác nhận nhận suất.
            </Text>
          </View>
        </View>

        {/* Waitlist Rows */}
        <View style={s.listCard}>
          <Text style={s.listSectionTitle}>Người đang giữ chỗ (Held)</Text>
          <Text style={s.userStatus}>{waitlist?.heldCount ?? 0} reservations currently hold portions.</Text>

          <Text style={[s.listSectionTitle, { marginTop: 14 }]}>Hàng chờ tiếp theo (Waitlist)</Text>
          {(waitlist?.waitlist ?? []).map((row) => (
            <View key={row.id} style={s.userRow}>
              <View style={s.avatar}><Text style={s.avatarText}>{row.queue_position}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{row.user_name} (Vị trí #{row.queue_position})</Text>
                <Text style={s.userStatus}>{row.quantity} suất · {row.status === "offered" ? "Đang được đề nghị" : "Đang chờ"}</Text>
              </View>
              <Ionicons name="time-outline" size={16} color={colors.muted} />
            </View>
          ))}
        </View>

        {!myEntry && <Pressable style={s.nextBtn} disabled={busy} onPress={async () => {
          setBusy(true);
          try { await onJoin(); }
          catch (error) { Alert.alert("Không thể tham gia Waitlist", error instanceof Error ? error.message : "Vui lòng thử lại."); }
          finally { setBusy(false); }
        }}>
          <Text style={s.nextBtnText}>{busy ? "Đang tham gia…" : "Tham gia danh sách chờ"}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>}
        <Pressable style={s.secondaryBtn} onPress={() => onNavigate("overdueOrder")}>
          <Text style={s.secondaryBtnText}>Xem trạng thái quá hạn</Text>
        </Pressable>
      </ScrollView>
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
  content: { padding: 16, gap: 14, paddingBottom: 60 },
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
  headerCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    alignItems: "center",
  },
  foodThumb: { width: 64, height: 64, borderRadius: 8 },
  foodName: { fontSize: fontSizes.bodyLarge, fontWeight: "700", color: colors.ink },
  shopText: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  priceText: { fontSize: fontSizes.caption, fontWeight: "600", color: colors.primary, marginTop: 4 },
  countRow: { flexDirection: "row", gap: 12 },
  countBox: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  countBoxActive: { backgroundColor: colors.pale, borderColor: colors.primary },
  countVal: { fontSize: 24, fontWeight: "800", color: colors.ink },
  countValActive: { color: colors.primary },
  countLabel: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  myPosCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  myPosHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  myPosBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  myPosBadgeText: { color: colors.white, fontSize: fontSizes.micro, fontWeight: "800" },
  autoReleaseText: { fontSize: fontSizes.micro, color: colors.muted },
  posCenter: { alignItems: "center", marginVertical: 12 },
  posNumber: { fontSize: 44, fontWeight: "900", color: colors.primary },
  posSub: { fontSize: fontSizes.caption, color: colors.muted, marginTop: 2 },
  noticeBox: {
    flexDirection: "row",
    backgroundColor: colors.pale,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    alignItems: "flex-start",
  },
  noticeText: { fontSize: fontSizes.caption, color: colors.ink, lineHeight: 18, flex: 1 },
  listCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  listSectionTitle: { fontSize: fontSizes.body, fontWeight: "700", color: colors.ink, marginBottom: 8 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 12,
  },
  myRow: { backgroundColor: colors.pale2, borderRadius: 8, paddingHorizontal: 8, marginVertical: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  userName: { fontSize: fontSizes.bodyMedium, fontWeight: "700", color: colors.ink },
  userStatus: { fontSize: fontSizes.micro, color: colors.muted, marginTop: 2 },
  timeTag: { fontSize: fontSizes.caption, fontWeight: "700", color: colors.orange },
  nextBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  secondaryBtn: { alignItems: "center", paddingVertical: 12 },
  secondaryBtnText: { color: colors.primary, fontWeight: "700", fontSize: fontSizes.bodyMedium },
  nextBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.body },
});

