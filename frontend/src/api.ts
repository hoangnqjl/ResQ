import { NativeModules, Platform } from "react-native";

function resolveDefaultHost(): string {
  if (Platform.OS === "web") return "localhost";
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^:/]+)(?::\d+)?/);
    if (match && match[1] && match[1] !== "localhost" && match[1] !== "127.0.0.1") {
      return match[1];
    }
  }
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${resolveDefaultHost()}:4000`;

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}
