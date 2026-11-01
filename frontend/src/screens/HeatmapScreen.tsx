import { BottomNavBar } from "../components/BottomNavBar";
import { useEffect, useMemo, useRef, useState } from "react";
import RealMapView, { Marker, type Region } from "../components/RealMapView";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getCommunityFoods, reserveCommunityFood, type CommunityFood } from "../services/communityApi";
import { heatmapMapPhoto } from "../data/designPhotos";

type Props = {
  userId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenShop: (shopId: string) => void;
  onOpenHotspots: () => void;
};

type Screen = "map" | "foodTypes" | "timeSlots" | "parking";
type ShopCluster = { id: string; name: string; foods: CommunityFood[]; latitude?: number; longitude?: number };

const ink = "#193d2e";
const green = "#176b49";
const muted = "#77877c";
const line = "#e1e9e1";
const pale = "#eaf3eb";
const parkingOptions = [
  { key: "motorbike", title: "Free motorbike parking", detail: "No parking fee when picking up", icon: "P" },
  { key: "curbside", title: "Curbside pickup (Vỉa hè)", detail: "Staff brings food to your bike outside", icon: "↔" },
  { key: "temporaryCar", title: "Temporary car parking", detail: "Wide street or front parking space", icon: "P" },
  { key: "mainStreet", title: "Main street location", detail: "Easy access, no deep narrow alleys", icon: "↗" },
] as const;
type ParkingPreferences = Record<(typeof parkingOptions)[number]["key"], boolean>;
const defaultParkingPreferences: ParkingPreferences = { motorbike: true, curbside: true, temporaryCar: false, mainStreet: true };
const foodOptions = [
  { id: "ready", title: "Ready to eat (Ăn liền)", detail: "Warm bread, pastries • No cooking needed", icon: "checkmark", color: green },
  { id: "reheat", title: "Needs microwave reheat", detail: "Meal boxes, noodles • 2 mins microwave", icon: "flame-outline", color: "#e11b22" },
  { id: "ingredients", title: "Fresh ingredients to cook", detail: "Fresh veggies, fillet meats near date", icon: "flame-outline", color: "#e11b22" },
  { id: "frozen", title: "Freezer storage (3 - 7 days)", detail: "Long term storage in freezer", icon: "snow-outline", color: "#52a9d8" },
] as const;
const timeLabels = ["16:00", "17:00", "18:00", "19:30", "21:00", "22:00", "22:30"];

function pickupTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function MapBackdrop({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <ImageBackground
      source={heatmapMapPhoto}
      style={[styles.mapBackdrop, fullScreen && styles.fullScreenMapBackdrop]}
      resizeMode={fullScreen ? "stretch" : "cover"}
    />
  );
}

function FilterIcon() {
  return (
    <View style={styles.filterIcon}>
      <View style={[styles.filterIconLine, styles.filterIconLong]} />
      <View style={[styles.filterIconLine, styles.filterIconShort]} />
      <View style={[styles.filterIconLine, styles.filterIconMedium]} />
    </View>
  );
}

function ParkingToggle({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      aria-checked={value}
      onPress={() => onValueChange(!value)}
      style={[styles.parkingToggle, value ? styles.parkingToggleOn : styles.parkingToggleOff]}
    >
      <View style={[styles.parkingToggleThumb, value ? styles.parkingToggleThumbOn : styles.parkingToggleThumbOff]} />
    </Pressable>
  );
}

function ParkingOptionIcon({ icon }: { icon: (typeof parkingOptions)[number]["icon"] }) {
  if (icon === "↔") {
    return <Image source={require("../../assets/design/parking-curbside-icon.png")} style={styles.parkingArrowIcon} />;
  }
  if (icon === "↗") {
    return <Image source={require("../../assets/design/parking-main-street-icon.png")} style={styles.parkingDiagonalIcon} />;
  }
  return (
    <View style={styles.parkingIconBadge}><Text style={styles.parkingIconText}>P</Text></View>
  );
}

function FoodTypeIcon({ id, selected }: { id: (typeof foodOptions)[number]["id"]; selected: boolean }) {
  if (selected) {
    return <Image source={require("../../assets/design/food-type-selected-check.png")} style={styles.foodTypeSelectedIcon} />;
  }
  if (id === "reheat" || id === "ingredients") {
    return <Image source={require("../../assets/design/food-type-steam-icon.png")} style={styles.foodTypeSteamIcon} />;
  }
  return <Image source={require("../../assets/design/food-type-snowflake-icon.png")} style={styles.foodTypeSnowflakeIcon} />;
}

function MapCluster({
  cluster,
  left,
  top,
  selected,
  onPress,
}: {
  cluster: ShopCluster;
  left: number;
  top: number;
  selected: boolean;
  onPress: () => void;
}) {
  const mealCount = cluster.foods.reduce((sum, food) => sum + Number(food.quantity_available), 0);
  return (
    <Pressable onPress={onPress} style={[styles.clusterPin, { left: `${left}%`, top: `${top}%` }]}>
      <Text style={styles.clusterLabel}>{mealCount} {mealCount === 1 ? "meal" : "meals"}</Text>
      <View style={[styles.clusterTip, selected && styles.clusterTipSelected]} />
    </Pressable>
  );
}

function PreviewPin({ left, top, color }: { left: number; top: number; color: string }) {
  return (
    <View style={[styles.previewPin, { left: `${left}%`, top: `${top}%` }]}>
      <View style={styles.previewPinBody} />
      <View style={[styles.previewPinTip, { backgroundColor: color }]} />
    </View>
  );
}

export default function HeatmapScreen({ userId, activeTab, onTabChange, onOpenShop, onOpenHotspots }: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const [foods, setFoods] = useState<CommunityFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState<Screen>("map");
  const [search, setSearch] = useState("");
  const [filterMenu, setFilterMenu] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [unit, setUnit] = useState<"KM+" | "MI+">("KM+");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [foodOrRestaurant, setFoodOrRestaurant] = useState<"Food" | "Restaurants">("Food");
  const [foodType, setFoodType] = useState<(typeof foodOptions)[number]["id"]>("ready");
  const [foodTypeEnabled, setFoodTypeEnabled] = useState(false);
  const [includeCutlery, setIncludeCutlery] = useState(true);
  const [parkingPreferences, setParkingPreferences] = useState<ParkingPreferences>(defaultParkingPreferences);
  const [selectedTime, setSelectedTime] = useState(3);
  const [timeFilterEnabled, setTimeFilterEnabled] = useState(false);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    let active = true;
    void getCommunityFoods()
      .then((items) => { if (active) { setFoods(items); setError(""); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load food locations."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(`resq.parking-preferences.${userId}`).then((stored) => {
      if (!active || !stored) return;
      try {
        const parsed = JSON.parse(stored) as Partial<ParkingPreferences>;
        setParkingPreferences({ ...defaultParkingPreferences, ...parsed });
      } catch {
        Alert.alert("Parking preferences", "Saved parking preferences could not be read.");
      }
    }).catch(() => {
      if (active) Alert.alert("Parking preferences", "Could not load saved parking preferences.");
    });
    return () => { active = false; };
  }, [userId]);

  const clusters = useMemo(() => {
    const timeLabel = timeLabels[selectedTime];
    const selectedMinute = Number(timeLabel.slice(0, 2)) * 60 + Number(timeLabel.slice(3));
    const groups = new Map<string, CommunityFood[]>();
    for (const food of foods) {
      if (search.trim() && !`${food.name} ${food.shop_name}`.toLowerCase().includes(search.trim().toLowerCase())) continue;
      if (foodOrRestaurant === "Restaurants" && !food.shop_name) continue;
      const storage = food.storage_instructions?.toLowerCase() ?? "";
      if (foodTypeEnabled && storage) {
        const matchesType = foodType === "ready"
          ? /ready to eat|no cooking|eat cold|consume immediately/i.test(storage)
          : foodType === "reheat"
            ? /reheat|microwave|heat/i.test(storage)
            : foodType === "ingredients"
              ? /ingredient|fresh|cook/i.test(storage)
              : /freez|frozen/i.test(storage);
        if (!matchesType) continue;
      }
      const start = pickupTime(food.pickup_starts_at);
      const end = pickupTime(food.pickup_ends_at);
      if (timeFilterEnabled && start && end) {
        const startMinute = Number(start.slice(0, 2)) * 60 + Number(start.slice(3));
        const endMinute = Number(end.slice(0, 2)) * 60 + Number(end.slice(3));
        if (selectedMinute < startMinute || selectedMinute > endMinute) continue;
      }
      const current = groups.get(food.shop_id) ?? [];
      current.push(food);
      groups.set(food.shop_id, current);
    }
    return [...groups.entries()].map(([id, shopFoods]) => ({
      id,
      name: shopFoods[0].shop_name,
      foods: shopFoods,
      latitude: shopFoods[0].latitude == null ? undefined : Number(shopFoods[0].latitude),
      longitude: shopFoods[0].longitude == null ? undefined : Number(shopFoods[0].longitude),
    }));
  }, [foods, foodOrRestaurant, foodType, foodTypeEnabled, search, selectedTime, timeFilterEnabled]);

  const initialRegion = useMemo<Region>(() => {
    const withCoords = clusters.filter((c) => c.latitude != null && c.longitude != null);
    if (withCoords.length > 0) {
      const lats = withCoords.map((c) => c.latitude as number);
      const lngs = withCoords.map((c) => c.longitude as number);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.035, (maxLat - minLat) * 1.6),
        longitudeDelta: Math.max(0.035, (maxLng - minLng) * 1.6),
      };
    }
    return {
      latitude: 15.9748,
      longitude: 108.2500,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [clusters]);

  const selectedCluster = clusters.find((cluster) => cluster.id === selectedShopId) ?? null;
  const selectedPinNumber = selectedCluster
    ? clusters.findIndex((cluster) => cluster.id === selectedCluster.id) + 1
    : 0;

  const reserveSelectedFood = async () => {
    const food = selectedCluster?.foods[0];
    if (!food) return;
    try {
      const result = await reserveCommunityFood(food.id, userId);
      setSelectedShopId(null);
      Alert.alert("Meal reserved", `Your pickup is held for ${result.holdMinutes} minutes.`);
    } catch (reason) {
      Alert.alert("Unable to reserve", reason instanceof Error ? reason.message : "Please try again.");
    }
  };

  const applyFilters = () => {
    void AsyncStorage.setItem(`resq.parking-preferences.${userId}`, JSON.stringify(parkingPreferences))
      .catch(() => Alert.alert("Parking preferences", "Could not save your parking preferences."));
    setScreen("map");
    setSelectedShopId(null);
    setFilterMenu(false);
  };

  const changeTimeline = (locationX: number) => {
    if (!timelineWidth) return;
    const value = Math.max(0, Math.min(timeLabels.length - 1, Math.round((locationX / timelineWidth) * (timeLabels.length - 1))));
    setSelectedTime(value);
    setTimeFilterEnabled(true);
  };

  if (screen === "parking") {
    return (
      <View style={[styles.filterPage, { paddingTop: insets.top }]}>
        <View style={[styles.filterHeader, styles.parkingHeader]}>
          <Pressable accessibilityLabel="Back" onPress={() => setScreen("map")} style={styles.roundButton}>
            <Ionicons name="chevron-back" size={22} color={ink} />
          </Pressable>
          <Text style={styles.filterHeaderTitle}>Picking options</Text>
          <Pressable accessibilityLabel="More options" onPress={() => Alert.alert("Picking options", "Parking preferences are saved on this device.")} style={styles.roundButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.parkingBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.parkingHeading}>Parking &amp; convenience preferences</Text>
          {parkingOptions.map((option) => (
            <View key={option.key} style={styles.parkingCard}>
              <View style={styles.parkingIcon}><ParkingOptionIcon icon={option.icon} /></View>
              <View style={styles.parkingCopy}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDetail}>{option.detail}</Text>
              </View>
              <ParkingToggle
                label={option.title}
                value={parkingPreferences[option.key]}
                onValueChange={(value) => setParkingPreferences((current) => ({ ...current, [option.key]: value }))}
              />
            </View>
          ))}
          <View style={styles.saverTip}>
            <Text style={styles.saverTitle}>Saver tip:</Text>
            <Text style={styles.saverText}>Choose curbside or free parking to avoid extra 5k parking fee.</Text>
          </View>
        </ScrollView>
        <Pressable onPress={applyFilters} style={[styles.applyButton, styles.parkingApplyButton, { bottom: Math.max(20, insets.bottom - 12) }]}>
          <Text style={styles.parkingApplyButtonText}>Apply filters</Text>
        </Pressable>
      </View>
    );
  }

  if (screen === "foodTypes") {
    return (
      <View style={[styles.filterPage, { paddingTop: insets.top }]}>
        <View style={[styles.filterHeader, styles.foodTypeHeader]}>
          <Pressable accessibilityLabel="Back" onPress={() => setScreen("map")} style={styles.roundButton}>
            <Ionicons name="chevron-back" size={22} color={ink} />
          </Pressable>
          <Text style={styles.filterHeaderTitle}>Food types</Text>
          <Pressable accessibilityLabel="More options" onPress={() => Alert.alert("ResQ filters", "Choose an option and apply filters to the map.")} style={styles.roundButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.foodTypeBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.foodTypeQuestion}>How do you want to enjoy your meal?</Text>
          {foodOptions.map((option) => {
            const selected = foodType === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => { setFoodType(option.id); setFoodTypeEnabled(true); }}
                style={[styles.foodTypeCard, selected && styles.foodTypeCardSelected]}
              >
                <View style={styles.foodTypeIcon}>
                  <FoodTypeIcon id={option.id} selected={selected} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDetail}>{option.detail}</Text>
                </View>
                <View style={[styles.foodTypeRadio, selected && styles.foodTypeRadioSelected]}>
                  {selected ? <View style={styles.foodTypeRadioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
          <Pressable onPress={() => setIncludeCutlery((value) => !value)} style={styles.cutleryRow}>
            <View style={[styles.foodTypeCheckSquare, includeCutlery && styles.checkSquareSelected]}>
              {includeCutlery ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
            </View>
            <Text style={styles.cutleryText}>Include disposable spoon, fork &amp; napkin</Text>
          </Pressable>
        </ScrollView>
        <Pressable onPress={applyFilters} style={[styles.applyButton, styles.foodTypesApplyButton, { bottom: Math.max(19, insets.bottom - 15) }]}>
          <Text style={styles.applyButtonText}>Apply filters</Text>
        </Pressable>
      </View>
    );
  }

  if (screen === "timeSlots") {
    const fillPercent = timelineWidth ? (selectedTime / (timeLabels.length - 1)) * 100 : 55;
    return (
      <View style={[styles.timePage, { paddingTop: insets.top }]}>
        <View style={styles.filterHeader}>
          <Pressable accessibilityLabel="Back" onPress={() => setScreen("map")} style={styles.roundButton}>
            <Ionicons name="chevron-back" size={22} color={ink} />
          </Pressable>
          <Text style={styles.filterHeaderTitle}>Times slots</Text>
          <Pressable accessibilityLabel="More options" onPress={() => Alert.alert("Time slots", "Choose a pickup time on the timeline.")} style={styles.roundButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.timeBody} showsVerticalScrollIndicator={false}>
          <View style={styles.timelineCard}>
            <View style={styles.timelineTitleRow}>
              <Text style={styles.timelineTitle}>Rescue time timeline</Text>
              <View style={styles.peakBadge}><Text style={styles.peakText}>Peak hours</Text></View>
            </View>
            <View
              onLayout={(event) => setTimelineWidth(event.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(event) => changeTimeline(event.nativeEvent.locationX)}
              onResponderMove={(event) => changeTimeline(event.nativeEvent.locationX)}
              style={styles.timelineTrack}
            >
              <View style={[styles.timelineFill, { width: `${fillPercent}%` }]} />
              <View style={[styles.timelineThumb, { left: `${fillPercent}%` }]}>
                <View style={styles.timelineThumbDot} />
              </View>
            </View>
            <View style={styles.timeLabels}>
              {timeLabels.filter((_, index) => [0, 2, 3, 4, 6].includes(index)).map((time, index) => {
                const timeIndex = [0, 2, 3, 4, 6][index];
                return <Text key={time} style={[styles.timeLabel, timeIndex === selectedTime && styles.timeLabelSelected]}>{time}</Text>;
              })}
            </View>
          </View>
          <View style={styles.previewMap}>
            <MapBackdrop />
            {clusters.slice(0, 3).map((cluster, index) => (
              <PreviewPin
                key={cluster.id}
                left={index === 0 ? 34 : index === 1 ? 66 : 50}
                top={index === 0 ? 44 : index === 1 ? 58 : 36}
                color={index % 2 === 0 ? "#df812e" : "#c84c4c"}
              />
            ))}
            <Text style={styles.previewTitle}>Heatmap preview at {timeLabels[selectedTime]}</Text>
          </View>
          <View style={styles.notifyCard}>
            <View style={styles.notifyCopy}>
              <Text style={styles.notifyTitle}>{timeLabels[selectedTime]} - Closing shift discounts</Text>
              <Text style={styles.notifyDescription}>18 shops offering 50% - 70% off near you</Text>
            </View>
            <Pressable
              onPress={() => Alert.alert("Slot notifications", "Your selected time is ready. Push notifications are not enabled in this app yet.")}
              style={styles.notifyButton}
            >
              <Text style={styles.notifyButtonText}>Notify slot</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mapScreen}>
      <RealMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {clusters.map((cluster) => {
          if (cluster.latitude == null || cluster.longitude == null) return null;
          const mealCount = cluster.foods.reduce((sum, food) => sum + Number(food.quantity_available), 0);
          const isSelected = cluster.id === selectedShopId;
          return (
            <Marker
              key={cluster.id}
              coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
              onPress={() => {
                setSelectedShopId(cluster.id);
                setListOpen(false);
                setFilterMenu(false);
              }}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.clusterPin, isSelected && styles.clusterPinSelected]}>
                  <Text style={[styles.clusterLabel, isSelected && styles.clusterLabelSelected]}>
                    {mealCount} {mealCount === 1 ? "meal" : "meals"}
                  </Text>
                </View>
                <View style={[styles.clusterTip, isSelected && styles.clusterTipSelected]} />
              </View>
            </Marker>
          );
        })}
      </RealMapView>
      <View style={[styles.searchBar, { top: insets.top + 8 }]}>
        <View style={styles.searchField}>
          <Ionicons name="search-outline" size={21} color="#718278" />
          <TextInput
            value={search}
            onChangeText={(value) => { setSearch(value); setSelectedShopId(null); }}
            placeholder="Search food or restaurants"
            placeholderTextColor="#78877d"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <Pressable onPress={() => { setFilterMenu((open) => !open); setListOpen(false); }} style={styles.searchFilterButton} accessibilityLabel="Open filters">
          <FilterIcon />
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.mapLoading}><ActivityIndicator color={green} /></View>
      ) : error ? (
        <View style={styles.mapError}><Text style={styles.mapErrorText}>{error}</Text><Pressable onPress={() => { setLoading(true); setError(""); void getCommunityFoods().then(setFoods).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load food locations.")).finally(() => setLoading(false)); }}><Text style={styles.retryText}>Try again</Text></Pressable></View>
      ) : (
        <>
          {clusters.length === 0 && !search ? (
            <View style={styles.mapEmpty}><Text style={styles.mapEmptyTitle}>No food locations yet</Text><Text style={styles.mapEmptyText}>Active shop listings will appear on the map.</Text></View>
          ) : null}
          {selectedCluster ? (
            <View style={styles.pinPopover}>
              <Text style={styles.pinPopoverTitle}>Pin {selectedPinNumber} information</Text>
              <Text style={styles.pinPopoverLine}>Near you</Text>
              <Text style={styles.pinPopoverLine}>12 min delivery</Text>
              <Text style={styles.pinPopoverLine}>Vegetarian food</Text>
              <Text style={styles.pinPopoverLine}>About 30 min countdown</Text>
              <View style={styles.pinPopoverActions}>
                <Pressable onPress={() => onOpenShop(selectedCluster.id)} style={styles.viewButton}><Text style={styles.viewButtonText}>View</Text></Pressable>
                <Pressable onPress={() => void reserveSelectedFood()} style={styles.bookButton}><Text style={styles.bookButtonText}>Book now</Text></Pressable>
              </View>
            </View>
          ) : null}
          {filterMenu ? (
            <View style={[styles.filterPopup, { top: insets.top + 78 }]}>
              <Text style={styles.filterPopupHeading}>Food/Restaurants</Text>
              <Pressable onPress={() => setFoodOrRestaurant((value) => value === "Food" ? "Restaurants" : "Food")} style={styles.selectField}>
                <Text style={styles.selectText}>{foodOrRestaurant}</Text><Ionicons name="chevron-down" size={18} color={ink} />
              </Pressable>
              {[
                ["Parking options", "parking"],
                ["Type of food", "foodTypes"],
                ["Time slots", "timeSlots"],
              ].map(([label, target]) => (
                <Pressable key={target} onPress={() => { setScreen(target as Screen); setFilterMenu(false); }} style={styles.filterMenuRow}>
                  <Text style={styles.filterMenuText}>{label}</Text><Ionicons name="chevron-forward" size={16} color={muted} />
                </Pressable>
              ))}
            </View>
          ) : null}
          {listOpen ? (
            <View style={styles.shopListPopup}>
              <Text style={styles.filterPopupHeading}>Nearby food</Text>
              <ScrollView style={styles.shopListScroll} nestedScrollEnabled>
                {clusters.map((cluster) => (
                  <Pressable key={cluster.id} onPress={() => { setSelectedShopId(cluster.id); setListOpen(false); }} style={styles.shopListRow}>
                    <Text numberOfLines={1} style={styles.shopListName}>{cluster.name}</Text>
                    <Text style={styles.shopListCount}>{cluster.foods.length} meals</Text>
                  </Pressable>
                ))}
                {!clusters.length ? <Text style={styles.shopListEmpty}>No active listings</Text> : null}
              </ScrollView>
              <Pressable onPress={onOpenHotspots} style={styles.hotspotsButton}>
                <Text style={styles.hotspotsButtonText}>Rescue Hotspots</Text>
                <Ionicons name="chevron-forward" size={16} color={green} />
              </Pressable>
            </View>
          ) : null}
        </>
      )}

      {controlsExpanded ? (
        <View style={[styles.mapControls, { bottom: insets.bottom + 82 }]}>
          <Pressable onPress={() => setUnit((value) => value === "KM+" ? "MI+" : "KM+")} style={styles.mapControl}>
            <Text style={styles.unitText}>{unit}</Text>
          </Pressable>
          <Pressable
            onPress={() => { if (mapRef.current?.animateToRegion) mapRef.current.animateToRegion(initialRegion, 500); }}
            style={styles.mapControl}
            accessibilityLabel="Show my location"
          >
            <Ionicons name="locate-outline" size={24} color={ink} />
          </Pressable>
          <Pressable
            onPress={() => {
              setListOpen((open) => !open);
              setFilterMenu(false);
              setSelectedShopId(null);
            }}
            style={styles.mapControl}
            accessibilityLabel="Show nearby list"
          >
            <Ionicons name="list-outline" size={25} color={ink} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            setControlsExpanded(true);
            setListOpen(false);
            setSelectedShopId(null);
          }}
          style={[styles.mapControl, styles.collapsedMapControl, { bottom: insets.bottom + 82 }]}
          accessibilityLabel="Expand map controls"
        >
          <Ionicons name="list-outline" size={25} color={ink} />
        </Pressable>
      )}
      <BottomNavBar activeTab={activeTab} onTabChange={onTabChange} floating bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  mapScreen: { flex: 1, overflow: "hidden", backgroundColor: "#eaf0e7" },
  mapBackdrop: { ...StyleSheet.absoluteFill, width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#e9eee7" },
  fullScreenMapBackdrop: { top: 0, bottom: 0 },
  parkA: { position: "absolute", left: "-13%", top: "11%", width: "32%", height: "19%", borderRadius: 60, backgroundColor: "#d2e6cf", transform: [{ rotate: "-23deg" }] },
  parkB: { position: "absolute", right: "-13%", top: "39%", width: "37%", height: "23%", borderRadius: 70, backgroundColor: "#d5e8d1", transform: [{ rotate: "24deg" }] },
  parkC: { position: "absolute", left: "-10%", bottom: "8%", width: "30%", height: "19%", borderRadius: 70, backgroundColor: "#d0e5cd", transform: [{ rotate: "17deg" }] },
  river: { position: "absolute", right: "12%", top: "-15%", width: "12%", height: "126%", borderRadius: 80, backgroundColor: "#abd9e4", transform: [{ rotate: "-12deg" }] },
  building: { position: "absolute", borderRadius: 8, backgroundColor: "#e1e5df", opacity: 0.78 },
  road: { position: "absolute", height: 13, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.87)" },
  tree: { position: "absolute", width: 14, height: 14, borderRadius: 8, backgroundColor: "#b8d7b6", borderWidth: 3, borderColor: "#cbe2c8" },
  searchBar: { position: "absolute", top: 20, left: 17, right: 17, zIndex: 4, flexDirection: "row", alignItems: "center", gap: 8 },
  searchField: { height: 42, flex: 1, borderRadius: 24, backgroundColor: "#fff", borderWidth: 1, borderColor: "#edf0ed", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, shadowColor: "#435748", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchInput: { flex: 1, fontSize: 13, color: ink, paddingVertical: 0 },
  searchFilterButton: { width: 62, height: 42, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#435748", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  filterIcon: { width: 22, height: 21, alignItems: "center", justifyContent: "center", gap: 4 },
  filterIconLine: { height: 1.6, borderRadius: 2, backgroundColor: ink },
  filterIconLong: { width: 20 },
  filterIconShort: { width: 12 },
  filterIconMedium: { width: 16 },
  hotspotsButton: { minHeight: 42, borderTopWidth: 1, borderTopColor: line, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  hotspotsButtonText: { color: green, fontSize: 12, fontWeight: "800" },
  markerContainer: { alignItems: "center", justifyContent: "center" },
  clusterPin: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#273a2c", shadowOpacity: 0.18, shadowRadius: 5, elevation: 4, borderWidth: 1.5, borderColor: "#d5dfd8" },
  clusterPinSelected: { borderColor: green, borderWidth: 2, backgroundColor: "#f4faf5" },
  clusterLabelSelected: { color: green, fontWeight: "700" },
  clusterLabel: { color: ink, fontSize: 11, fontWeight: "500" },
  clusterTip: { width: 10, height: 10, backgroundColor: "#fff", transform: [{ rotate: "45deg" }], marginTop: -5 },
  clusterTipSelected: { backgroundColor: "#f4faf5", borderColor: green },
  mapLoading: { position: "absolute", top: "46%", alignSelf: "center", padding: 16, borderRadius: 30, backgroundColor: "#fff" },
  mapError: { position: "absolute", top: "38%", alignSelf: "center", width: "78%", padding: 17, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", gap: 8 },
  mapErrorText: { color: ink, fontSize: 13, textAlign: "center" },
  retryText: { color: green, fontSize: 13, fontWeight: "700" },
  mapEmpty: { position: "absolute", top: "44%", alignSelf: "center", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center" },
  mapEmptyTitle: { color: ink, fontSize: 14, fontWeight: "800" },
  mapEmptyText: { color: muted, fontSize: 12, marginTop: 4 },
  pinPopover: { position: "absolute", zIndex: 5, top: 108, left: 20, right: 20, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: line, backgroundColor: "#fff", shadowColor: "#213b2d", shadowOpacity: 0.16, shadowRadius: 10, elevation: 6 },
  pinPopoverTitle: { color: ink, fontSize: 11, fontWeight: "800", marginBottom: 7 },
  pinPopoverLine: { color: muted, fontSize: 10, marginBottom: 6 },
  pinPopoverActions: { flexDirection: "row", gap: 5, marginTop: 4 },
  viewButton: { height: 28, flex: 1, borderWidth: 1, borderColor: line, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  viewButtonText: { color: ink, fontSize: 10, fontWeight: "600" },
  bookButton: { height: 28, flex: 1, backgroundColor: green, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  bookButtonText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  filterPopup: { position: "absolute", top: 88, right: 17, zIndex: 6, width: 154, paddingHorizontal: 11, paddingTop: 10, paddingBottom: 6, borderRadius: 16, borderWidth: 1, borderColor: "#e4e9e4", backgroundColor: "#fff", shadowColor: "#253b2d", shadowOpacity: 0.12, shadowRadius: 9, elevation: 7 },
  filterPopupHeading: { color: ink, fontSize: 13, fontWeight: "700", marginBottom: 9 },
  selectField: { height: 36, borderRadius: 12, borderWidth: 1, borderColor: "#d9dfe2", backgroundColor: "#f8f9fa", alignItems: "center", justifyContent: "space-between", flexDirection: "row", paddingHorizontal: 12, marginBottom: 5 },
  selectText: { color: ink, fontSize: 13 },
  filterMenuRow: { minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  filterMenuText: { color: "#65766b", fontSize: 13 },
  shopListPopup: { position: "absolute", top: "20%", right: 15, width: 240, maxHeight: "47%", zIndex: 6, padding: 15, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: line, shadowColor: "#253b2d", shadowOpacity: 0.12, shadowRadius: 8, elevation: 6 },
  shopListScroll: { maxHeight: 260 },
  shopListRow: { minHeight: 43, borderTopWidth: 1, borderColor: "#eef1ee", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  shopListName: { flex: 1, color: ink, fontSize: 12, fontWeight: "600" },
  shopListCount: { color: muted, fontSize: 11 },
  shopListEmpty: { color: muted, fontSize: 12, paddingVertical: 8 },
  mapControls: { position: "absolute", right: 17, bottom: 112, gap: 8, zIndex: 3 },
  collapsedMapControl: { position: "absolute", right: 17, zIndex: 3 },
  mapControl: { height: 46, width: 46, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#243729", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  unitText: { color: ink, fontSize: 12, fontWeight: "600" },
  filterPage: { flex: 1, backgroundColor: "#fff" },
  timePage: { flex: 1, backgroundColor: "#fff" },
  filterHeader: { height: 62, marginHorizontal: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  foodTypeHeader: { height: 44 },
  parkingHeader: { height: 52 },
  roundButton: { width: 40, height: 40, borderRadius: 22, borderWidth: 1.3, borderColor: line, alignItems: "center", justifyContent: "center" },
  filterHeaderTitle: { color: ink, fontSize: 16, fontWeight: "800" },
  filterBody: { paddingHorizontal: 17, paddingTop: 13, paddingBottom: 100 },
  foodTypeBody: { paddingHorizontal: 17, paddingTop: 20, paddingBottom: 100 },
  question: { color: ink, fontSize: 17, fontWeight: "800", marginBottom: 22 },
  foodTypeQuestion: { color: ink, fontSize: 17, fontWeight: "800", marginBottom: 11 },
  parkingBody: { paddingHorizontal: 17, paddingTop: 10, paddingBottom: 100 },
  parkingHeading: { color: ink, fontSize: 16, fontWeight: "800", marginBottom: 15 },
  parkingCard: { height: 70, borderRadius: 18, borderWidth: 1.1, borderColor: line, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 14, gap: 14 },
  parkingIcon: { width: 46, height: 42, alignItems: "center", justifyContent: "center" },
  parkingIconBadge: { width: 22, height: 20, borderRadius: 12, backgroundColor: pale, alignItems: "center", justifyContent: "center" },
  parkingIconText: { color: green, fontSize: 18, fontWeight: "800", lineHeight: 20 },
  parkingArrowIcon: { width: 35, height: 18 },
  parkingDiagonalIcon: { width: 33, height: 21 },
  parkingCopy: { flex: 1 },
  saverTip: { backgroundColor: pale, borderRadius: 19, paddingHorizontal: 12, paddingVertical: 12 },
  saverTitle: { color: ink, fontSize: 14, fontWeight: "800" },
  saverText: { color: muted, fontSize: 12, lineHeight: 16, marginTop: 4 },
  parkingToggle: { width: 44, height: 24, borderRadius: 12, justifyContent: "center", paddingHorizontal: 3 },
  parkingToggleOn: { backgroundColor: green },
  parkingToggleOff: { backgroundColor: "#fff", borderWidth: 1.2, borderColor: line },
  parkingToggleThumb: { width: 18, height: 18, borderRadius: 9 },
  parkingToggleThumbOn: { alignSelf: "flex-end", backgroundColor: "#fff" },
  parkingToggleThumbOff: { alignSelf: "flex-start", backgroundColor: green },
  optionCard: { minHeight: 101, paddingHorizontal: 17, paddingVertical: 15, borderWidth: 1.3, borderColor: line, borderRadius: 25, flexDirection: "row", alignItems: "center", marginBottom: 15 },
  optionCardSelected: { backgroundColor: pale, borderColor: pale },
  optionIcon: { width: 54, alignItems: "center", justifyContent: "center", marginRight: 13 },
  foodTypeCard: { height: 77, paddingHorizontal: 16, paddingLeft: 12, borderWidth: 1.2, borderColor: line, borderRadius: 25, flexDirection: "row", alignItems: "center", marginBottom: 13 },
  foodTypeCardSelected: { backgroundColor: "#e8f3e9", borderColor: "#e8f3e9" },
  foodTypeIcon: { width: 50, height: 54, alignItems: "center", justifyContent: "center", marginRight: 13 },
  foodTypeSelectedIcon: { width: 43.5, height: 44 },
  foodTypeSteamIcon: { width: 43, height: 46.5 },
  foodTypeSnowflakeIcon: { width: 46.5, height: 44.5 },
  foodTypeRadio: { width: 20, height: 20, borderWidth: 1.2, borderColor: "#a9aeab", borderRadius: 11, alignItems: "center", justifyContent: "center", marginLeft: 4 },
  foodTypeRadioSelected: { borderWidth: 0, backgroundColor: green },
  foodTypeRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  foodTypeCheckSquare: { height: 20, width: 20, borderRadius: 5, borderWidth: 1.5, borderColor: "#aab5ac", alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1, paddingRight: 8 },
  optionTitle: { color: ink, fontSize: 15, fontWeight: "800" },
  optionDetail: { color: muted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  radio: { width: 25, height: 25, borderWidth: 1.5, borderColor: "#a9aeab", borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 4 },
  radioSelected: { width: 38, height: 38, borderWidth: 0, backgroundColor: green },
  radioDot: { width: 14, height: 14, borderRadius: 8, backgroundColor: "#fff" },
  cutleryRow: { flexDirection: "row", alignItems: "center", marginTop: 11, gap: 11 },
  checkSquare: { height: 25, width: 25, borderRadius: 5, borderWidth: 1.5, borderColor: "#aab5ac", alignItems: "center", justifyContent: "center" },
  checkSquareSelected: { borderColor: green, backgroundColor: green },
  cutleryText: { color: ink, fontSize: 14, fontWeight: "700" },
  applyButton: { position: "absolute", bottom: 12, left: 18, right: 18, height: 62, borderRadius: 34, backgroundColor: green, alignItems: "center", justifyContent: "center" },
  foodTypesApplyButton: { left: 19, right: 19, height: 47, borderRadius: 27 },
  parkingApplyButton: { left: 20, right: 20, height: 50, borderRadius: 28 },
  applyButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  parkingApplyButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  timeBody: { paddingHorizontal: 17, paddingTop: 12, paddingBottom: 24 },
  timelineCard: { padding: 17, borderRadius: 24, borderWidth: 1.3, borderColor: line, backgroundColor: "#f8f9f8" },
  timelineTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timelineTitle: { color: ink, fontSize: 16, fontWeight: "800" },
  peakBadge: { backgroundColor: green, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 7 },
  peakText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  timelineTrack: { height: 26, marginTop: 23, justifyContent: "center" },
  timelineFill: { height: 8, backgroundColor: "#15563f", borderRadius: 5 },
  timelineThumb: { position: "absolute", top: -2, width: 40, height: 40, marginLeft: -20, borderRadius: 22, borderWidth: 3, borderColor: green, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  timelineThumbDot: { width: 17, height: 17, borderRadius: 9, backgroundColor: "#111" },
  timeLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  timeLabel: { color: muted, fontSize: 12 },
  timeLabelSelected: { color: ink, fontSize: 14, fontWeight: "800" },
  previewMap: { height: 325, marginTop: 10, borderRadius: 26, overflow: "hidden", borderWidth: 1.2, borderColor: line, alignItems: "center", justifyContent: "center" },
  previewTitle: { color: ink, fontSize: 16, fontWeight: "800" },
  previewPin: { position: "absolute", width: 32, height: 38, alignItems: "center", transform: [{ translateX: -16 }, { translateY: -19 }] },
  previewPinBody: { width: 28, height: 28, borderRadius: 16, backgroundColor: "#fff", elevation: 3 },
  previewPinTip: { position: "absolute", bottom: 3, width: 10, height: 10, transform: [{ rotate: "45deg" }] },
  notifyCard: { minHeight: 104, marginTop: 18, padding: 14, borderRadius: 24, borderWidth: 1.2, borderColor: line, flexDirection: "row", alignItems: "center", gap: 10 },
  notifyCopy: { flex: 1 },
  notifyTitle: { color: ink, fontSize: 14, fontWeight: "800", lineHeight: 19 },
  notifyDescription: { color: muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  notifyButton: { minWidth: 102, height: 38, borderRadius: 22, backgroundColor: green, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  notifyButtonText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
