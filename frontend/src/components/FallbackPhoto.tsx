import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from "react-native";

type Props = {
  uri?: string | null;
  fallback: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
};

function getSafeUri(uri?: string | null): string | null {
  if (!uri || typeof uri !== "string") return null;
  const trimmed = uri.trim();
  if (!trimmed || trimmed.includes("{{") || trimmed.includes("}}")) return null;
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:", "data:", "file:"].includes(parsed.protocol)) {
      return null;
    }
    return encodeURI(decodeURI(parsed.toString()));
  } catch {
    return null;
  }
}

export function FallbackPhoto({ uri, fallback, style }: Props) {
  const [failed, setFailed] = useState(false);
  const safeUri = getSafeUri(uri);

  return (
    <Image
      source={safeUri && !failed ? { uri: safeUri } : fallback}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
