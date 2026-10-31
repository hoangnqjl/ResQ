import type { ImageSourcePropType } from "react-native";

export const categoryPhotos = {
  bakery: require("../../assets/design/category-bakery.jpg"),
  meal: require("../../assets/design/category-hot-meals.jpg"),
  free: require("../../assets/design/category-sharing-corner.jpg"),
  produce: require("../../assets/design/category-produce.jpg"),
} satisfies Record<string, ImageSourcePropType>;

export const cornerKitchenPhoto = require("../../assets/design/shop-corner-kitchen.jpg");
export const dropAlertFoodPhoto = require("../../assets/design/food-chicken-rice.jpg");
export const sharingStationPhoto = require("../../assets/design/category-sharing-corner.jpg");
export const sharingMapPhoto = require("../../assets/design/sharing-station-map.jpg");
export const heatmapMapPhoto = require("../../assets/design/heatmap-map-background.jpg");

const foodPhotos = {
  chicken: require("../../assets/design/food-chicken-rice.jpg"),
  salmon: require("../../assets/design/food-salmon-poke.jpg"),
  noodles: require("../../assets/design/food-beef-noodles.jpg"),
  pancakes: require("../../assets/design/food-berry-pancakes.jpg"),
  avocado: require("../../assets/design/food-avocado-toast.jpg"),
  pasta: require("../../assets/design/food-truffle-pasta.jpg"),
  vegetable: require("../../assets/design/food-vegetable-rice.jpg"),
  bread: require("../../assets/design/food-banh-mi.jpg"),
  pizza: require("../../assets/design/food-pizza.jpg"),
} satisfies Record<string, ImageSourcePropType>;

export function foodPhoto(name: string): ImageSourcePropType {
  const normalized = name.toLowerCase();
  if (normalized.includes("salmon") || normalized.includes("poke")) return foodPhotos.salmon;
  if (normalized.includes("pancake")) return foodPhotos.pancakes;
  if (normalized.includes("avocado") || normalized.includes("toast")) return foodPhotos.avocado;
  if (normalized.includes("pasta") || normalized.includes("truffle")) return foodPhotos.pasta;
  if (normalized.includes("noodle") || normalized.includes("pho")) return foodPhotos.noodles;
  if (normalized.includes("pizza")) return foodPhotos.pizza;
  if (normalized.includes("bread") || normalized.includes("bakery") || normalized.includes("croissant") || normalized.includes("cafe") || normalized.includes("surprise bag")) return foodPhotos.bread;
  if (normalized.includes("vegetable") || normalized.includes("produce") || normalized.includes("lunch box")) return foodPhotos.vegetable;
  return foodPhotos.chicken;
}
