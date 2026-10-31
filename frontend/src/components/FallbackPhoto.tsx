import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from "react-native";

type Props = {
  uri?: string;
  fallback: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
};

export function FallbackPhoto({ uri, fallback, style }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      source={uri && !failed ? { uri } : fallback}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
