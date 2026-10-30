import { Platform } from "react-native";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "http://localhost:4000" : "http://10.0.2.2:4000");

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}
