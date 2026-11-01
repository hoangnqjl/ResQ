import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";
import { FallbackPhoto } from "../components/FallbackPhoto";
import { cornerKitchenPhoto } from "../data/designPhotos";

type ProfileData = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl?: string;
};

type Props = {
  initialData?: Partial<ProfileData>;
  onBack: () => void;
  onSave: (data: ProfileData) => Promise<void> | void;
};

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=200&q=80";

export default function EditProfileScreen({
  initialData,
  onBack,
  onSave,
}: Props) {
  const [fullName, setFullName] = useState(
    initialData?.fullName ?? "Nguyen Capybaras"
  );
  const [phone, setPhone] = useState(
    initialData?.phone ?? "(+84) 0123456789"
  );
  const [email, setEmail] = useState(
    initialData?.email ?? "quynh23@email.com"
  );
  const [address, setAddress] = useState(
    initialData?.address ?? "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    initialData?.avatarUrl ?? DEFAULT_AVATAR
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        avatarUrl,
      });
      setSavedSuccess(true);
    } catch {
      // Keep on screen if error
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhoto = () => {
    // Alternate or refresh photo placeholder
    setAvatarUrl(DEFAULT_AVATAR);
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Seamless Header (no bottom border) */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Edit profile</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar & Change photo */}
        <View style={s.avatarSection}>
          <FallbackPhoto uri={avatarUrl} fallback={cornerKitchenPhoto} style={s.avatarImage} />
          <Pressable onPress={handleChangePhoto} hitSlop={8}>
            <Text style={s.changePhotoText}>Change photo</Text>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View style={s.form}>
          {/* Full name */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Full name</Text>
            <TextInput
              style={s.input}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setSavedSuccess(false);
              }}
              placeholder="Full name"
              placeholderTextColor="#9aa79e"
            />
          </View>

          {/* Phone */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Phone</Text>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setSavedSuccess(false);
              }}
              placeholder="Phone number"
              placeholderTextColor="#9aa79e"
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setSavedSuccess(false);
              }}
              placeholder="Email address"
              placeholderTextColor="#9aa79e"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Address */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Address</Text>
            <TextInput
              style={s.input}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                setSavedSuccess(false);
              }}
              placeholder="Address"
              placeholderTextColor="#9aa79e"
            />
          </View>
        </View>

        <View style={s.bottomSpacer} />

        {/* Changes saved Card notification (shown on save) */}
        {savedSuccess && (
          <View style={s.successCard}>
            <View style={s.successCheckCircle}>
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            </View>
            <View style={s.successTextCol}>
              <Text style={s.successTitle}>Changes saved</Text>
              <Text style={s.successSubtitle}>Your profile has been updated.</Text>
            </View>
          </View>
        )}

        {/* Save CTA Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={s.saveButton}
        >
          <Text style={s.saveButtonText}>
            {saving ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 0,
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  backIcon: {
    fontSize: fontSizes.header,
    color: colors.ink,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: "800",
    color: colors.ink,
  },
  moreIcon: {
    fontSize: fontSizes.title,
    color: colors.ink,
    fontWeight: "900",
    marginTop: -4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#eaf3ea",
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: fontSizes.bodySmall,
    fontWeight: "700",
    color: colors.ink,
    textDecorationLine: "underline",
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: fontSizes.bodySmall,
    color: "#64756a",
    fontWeight: "500",
    marginLeft: 2,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  bottomSpacer: {
    height: 32,
  },
  successCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  successCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  successTextCol: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    fontSize: fontSizes.bodyMedium,
    fontWeight: "800",
    color: colors.ink,
  },
  successSubtitle: {
    fontSize: fontSizes.caption,
    color: "#64756a",
  },
  saveButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "800",
    color: "#ffffff",
  },
});
