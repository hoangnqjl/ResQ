import React, { createContext, forwardRef, useContext, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapViewProps = ViewProps & {
  initialRegion?: Region;
  region?: Region;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  pitchEnabled?: boolean;
  rotateEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export type MapMarkerProps = {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

export type MapCircleProps = {
  center: { latitude: number; longitude: number };
  radius: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
};

const DEFAULT_REGION: Region = {
  latitude: 15.9748,
  longitude: 108.25,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapContext = createContext<{ region: Region; width: number; height: number }>({
  region: DEFAULT_REGION,
  width: 414,
  height: 850,
});

export const PROVIDER_DEFAULT = undefined;

export const Marker: React.FC<MapMarkerProps> = ({ children, onPress, coordinate }) => {
  const { region, width, height } = useContext(MapContext);
  const longitudeSpan = Math.max(region.longitudeDelta, 0.001);
  const latitudeSpan = Math.max(region.latitudeDelta, 0.001);
  const x = ((coordinate.longitude - (region.longitude - longitudeSpan / 2)) / longitudeSpan) * width;
  const y = ((region.latitude + latitudeSpan / 2 - coordinate.latitude) / latitudeSpan) * height;
  if (x < -50 || x > width + 50 || y < -70 || y > height + 30) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.marker, { left: x, top: y }]}
    >
      {children}
    </Pressable>
  );
};

export const Circle: React.FC<MapCircleProps> = ({ center, radius, strokeColor = "#378b5e", strokeWidth = 2, fillColor = "rgba(55,139,94,0.14)" }) => {
  const { region, width, height } = useContext(MapContext);
  const latitudeRadius = radius / 111_320;
  const longitudeRadius = radius / (111_320 * Math.max(Math.cos((center.latitude * Math.PI) / 180), 0.15));
  const diameterX = (longitudeRadius * 2 / Math.max(region.longitudeDelta, 0.001)) * width;
  const diameterY = (latitudeRadius * 2 / Math.max(region.latitudeDelta, 0.001)) * height;
  const x = ((center.longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) * width;
  const y = ((region.latitude + region.latitudeDelta / 2 - center.latitude) / region.latitudeDelta) * height;

  return <View pointerEvents="none" style={[styles.circle, { left: x - diameterX / 2, top: y - diameterY / 2, width: diameterX, height: diameterY, borderColor: strokeColor, borderWidth: strokeWidth, backgroundColor: fillColor }]} />;
};

export const Callout: React.FC<{ children?: React.ReactNode }> = ({ children }) => <View>{children}</View>;

export const RealMapView = forwardRef<any, MapViewProps>(({ style, children, initialRegion, region, scrollEnabled = true, zoomEnabled = true, onLayout, ...viewProps }, ref) => {
  const host = useRef<any>(null);
  const mapRegion = region ?? initialRegion ?? DEFAULT_REGION;
  const resolvedRef = (node: any) => {
    host.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const embedUrl = useMemo(() => {
    const halfLat = Math.max(mapRegion.latitudeDelta / 2, 0.003);
    const halfLng = Math.max(mapRegion.longitudeDelta / 2, 0.003);
    const bbox = [mapRegion.longitude - halfLng, mapRegion.latitude - halfLat, mapRegion.longitude + halfLng, mapRegion.latitude + halfLat].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${mapRegion.latitude}%2C${mapRegion.longitude}`;
  }, [mapRegion]);

  return (
    <View
      {...viewProps}
      ref={resolvedRef}
      onLayout={(event) => {
        host.current?.setNativeProps?.({});
        onLayout?.(event);
      }}
      style={[StyleSheet.absoluteFill, styles.map, style]}
    >
      <iframe
        title="OpenStreetMap"
        src={embedUrl}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ border: 0, width: "100%", height: "100%", display: "block", pointerEvents: scrollEnabled || zoomEnabled ? "auto" : "none" }}
      />
      <View pointerEvents="none" style={styles.attribution}>
        <Text style={styles.attributionText}>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={{ color: "#40564a" }}>OpenStreetMap</a> contributors</Text>
      </View>
      <MapChildrenLayer>{children}</MapChildrenLayer>
    </View>
  );
});

function MapChildrenLayer({ children }: { children?: React.ReactNode }) {
  const [size, setSize] = React.useState({ width: 414, height: 850 });
  const region = useContext(MapContext).region;
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill} onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
      <MapContext.Provider value={{ region, ...size }}>{children}</MapContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { overflow: "hidden", backgroundColor: "#e9eee8" },
  marker: { position: "absolute", transform: [{ translateX: -28 }, { translateY: -38 }], zIndex: 2 },
  circle: { position: "absolute", borderRadius: 9999 },
  attribution: { position: "absolute", right: 6, bottom: 5, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.88)" },
  attributionText: { color: "#40564a", fontSize: 9 },
});

RealMapView.displayName = "RealMapView";
export default RealMapView;
