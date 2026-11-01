import React, { forwardRef } from "react";
import MapView, {
  Marker,
  Circle,
  Callout,
  PROVIDER_DEFAULT,
  type MapViewProps,
  type Region,
  type MapMarkerProps,
  type MapCircleProps,
} from "react-native-maps";

export { Marker, Circle, Callout, PROVIDER_DEFAULT };
export type { MapViewProps, Region, MapMarkerProps, MapCircleProps };

export const RealMapView = forwardRef<MapView, MapViewProps>((props, ref) => {
  return <MapView ref={ref} {...props} />;
});

RealMapView.displayName = "RealMapView";
export default RealMapView;
