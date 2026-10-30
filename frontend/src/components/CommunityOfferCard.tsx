import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CommunityListing } from "../data/communityListings";
import { imageUrl } from "../services/communityApi";
import { communityColors } from "./CommunityLayout";

export function CommunityOfferCard({
  listing,
  onPress,
}: {
  listing: CommunityListing;
  onPress: (listing: CommunityListing) => void;
}) {
  const isFree = listing.kind === "free";
  const uri = imageUrl(listing.image_url);
  return (
    <View style={styles.card}>
      <Pressable onPress={() => onPress(listing)} style={styles.photoWrap}>
        {uri ? <Image source={{ uri }} style={styles.photo} resizeMode="cover" /> : <View style={styles.photoFallback} />}
        <View style={[styles.badge, !isFree && styles.discountBadge]}>
          <Text style={[styles.badgeText, !isFree && styles.discountText]}>{listing.badge}</Text>
        </View>
      </Pressable>
      <Text numberOfLines={1} style={styles.name}>{listing.name}</Text>
      <Text numberOfLines={1} style={styles.subtitle}>{listing.shop_name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>{listing.priceLabel}</Text>
        <Pressable onPress={() => onPress(listing)} style={styles.action}>
          <Text style={styles.actionText}>{isFree ? "Nhận" : "Đặt"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderWidth: 1.2,
    borderColor: communityColors.line,
    borderRadius: 19,
    padding: 8,
    backgroundColor: communityColors.white,
  },
  photoWrap: {
    height: 112,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: communityColors.pale,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoFallback: {
    flex: 1,
    backgroundColor: communityColors.pale,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minHeight: 23,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: communityColors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: communityColors.ink,
    fontSize: 10,
    fontWeight: "800",
  },
  discountBadge: {
    backgroundColor: communityColors.paleOrange,
  },
  discountText: {
    color: communityColors.orange,
  },
  name: {
    color: communityColors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitle: {
    color: "#52675a",
    fontSize: 10,
    marginTop: 6,
  },
  cardFooter: {
    minHeight: 33,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  price: {
    color: communityColors.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  action: {
    minWidth: 69,
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: communityColors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: communityColors.white,
    fontSize: 12,
    fontWeight: "800",
  },
});
