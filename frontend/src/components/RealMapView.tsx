import React, { forwardRef } from "react";
import { View, ImageBackground, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { heatmapMapPhoto } from "../data/designPhotos";

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

export const PROVIDER_DEFAULT = undefined;

export const Marker: React.FC<MapMarkerProps> = ({ children, onPress }) => (
  <View onTouchEnd={onPress}>{children}</View>
);

export const Circle: React.FC<MapCircleProps> = () => null;

export const Callout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <View>{children}</View>
);

export const RealMapView = forwardRef<any, MapViewProps>(({ style, children }, _ref) => {
  return (
    <ImageBackground
      source={heatmapMapPhoto}
      style={[StyleSheet.absoluteFill, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
});

RealMapView.displayName = "RealMapView";
export default RealMapView;
