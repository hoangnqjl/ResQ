import React, { createContext, forwardRef, useContext, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { WebView } from "react-native-webview";

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
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  children?: React.ReactNode;
};

export type MapMarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

export type MapCircleProps = {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
};

export const PROVIDER_DEFAULT = "leaflet-osm";

const DEFAULT_REGION: Region = {
  latitude: 15.9748,
  longitude: 108.2500,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const MapContext = createContext<{ region: Region; width: number; height: number }>({
  region: DEFAULT_REGION,
  width: 414,
  height: 850,
});

export const Marker: React.FC<MapMarkerProps> = ({ children, onPress, coordinate }) => {
  const { region, width, height } = useContext(MapContext);
  if (!coordinate) return null;

  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;

  const x = ((coordinate.longitude - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - coordinate.latitude) / (maxLat - minLat)) * height;

  return (
    <View
      style={[
        styles.marker,
        {
          left: Math.max(16, Math.min(width - 50, x)),
          top: Math.max(20, Math.min(height - 60, y)),
        },
      ]}
      onTouchEnd={onPress}
    >
      {children}
    </View>
  );
};

export const Circle: React.FC<MapCircleProps> = ({
  center,
  radius,
  strokeColor = "#378b5e",
  strokeWidth = 2,
  fillColor = "rgba(55,139,94,0.14)",
}) => {
  const { region, width, height } = useContext(MapContext);
  if (!center) return null;

  const latitudeRadius = radius / 111320;
  const longitudeRadius = radius / (40075000 * Math.cos((center.latitude * Math.PI) / 180) / 360);

  const diameterX = (longitudeRadius * 2 / Math.max(region.longitudeDelta, 0.001)) * width;
  const diameterY = (latitudeRadius * 2 / Math.max(region.latitudeDelta, 0.001)) * height;
  const x = ((center.longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) * width;
  const y = ((region.latitude + region.latitudeDelta / 2 - center.latitude) / region.latitudeDelta) * height;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.circle,
        {
          left: x - diameterX / 2,
          top: y - diameterY / 2,
          width: diameterX,
          height: diameterY,
          borderColor: strokeColor,
          borderWidth: strokeWidth,
          backgroundColor: fillColor,
        },
      ]}
    />
  );
};

export const Callout: React.FC<{ children?: React.ReactNode }> = ({ children }) => <View>{children}</View>;

export const RealMapView = forwardRef<any, MapViewProps>(
  (
    {
      style,
      children,
      initialRegion,
      region,
      scrollEnabled = true,
      zoomEnabled = true,
      onLayout,
      ...viewProps
    },
    ref
  ) => {
    const webViewRef = useRef<any>(null);
    const mapRegion = region ?? initialRegion ?? DEFAULT_REGION;
    const [size, setSize] = useState({ width: 414, height: 850 });

    const htmlContent = useMemo(() => {
      const lat = mapRegion.latitude;
      const lng = mapRegion.longitude;
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #eef2eb; }
    .leaflet-control-attribution { font-size: 8px !important; background: rgba(255,255,255,0.7) !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
      dragging: ${scrollEnabled},
      touchZoom: ${zoomEnabled},
      scrollWheelZoom: ${zoomEnabled}
    }).setView([${lat}, ${lng}], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.circle([${lat}, ${lng}], {
      color: '#176b49',
      fillColor: '#2b9d6a',
      fillOpacity: 0.15,
      radius: 600
    }).addTo(map);

    L.circleMarker([${lat}, ${lng}], {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: '#176b49',
      fillOpacity: 1
    }).addTo(map);
  </script>
</body>
</html>`;
    }, [mapRegion.latitude, mapRegion.longitude, scrollEnabled, zoomEnabled]);

    return (
      <View
        {...viewProps}
        onLayout={(event) => {
          setSize({
            width: event.nativeEvent.layout.width || 414,
            height: event.nativeEvent.layout.height || 850,
          });
          onLayout?.(event);
        }}
        style={[styles.mapContainer, style]}
      >
        {/* @ts-ignore */}
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={StyleSheet.absoluteFill}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <MapContext.Provider value={{ region: mapRegion, ...size }}>
            {children}
          </MapContext.Provider>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  mapContainer: {
    overflow: "hidden",
    backgroundColor: "#eef2eb",
  },
  marker: {
    position: "absolute",
    zIndex: 10,
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
  },
});

RealMapView.displayName = "RealMapView";
export default RealMapView;
