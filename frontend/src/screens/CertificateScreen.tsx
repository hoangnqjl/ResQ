import { useState } from "react";
import {
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

type Props = {
  initialFile?: {
    name: string;
    size: string;
  };
  initialCertNo?: string;
  initialExpiryDate?: string;
  onBack: () => void;
  onSubmit: (data: {
    fileName: string;
    fileSize: string;
    certNo: string;
    expiryDate: string;
  }) => Promise<void> | void;
};

export default function CertificateScreen({
  initialFile = { name: "ATVSTP_cert.pdf", size: "1.2 MB" },
  initialCertNo = "ATVSTP-2026-0457",
  initialExpiryDate = "31 Dec 2027",
  onBack,
  onSubmit,
}: Props) {
  const [file, setFile] = useState<{ name: string; size: string } | null>(
    initialFile
  );
  const [certNo, setCertNo] = useState(initialCertNo);
  const [expiryDate, setExpiryDate] = useState(initialExpiryDate);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handlePickFile = () => {
    // Demo attach / pick file
    setFile({
      name: "ATVSTP_cert.pdf",
      size: "1.2 MB",
    });
    setSubmittedSuccess(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSubmittedSuccess(false);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        fileName: file?.name ?? "ATVSTP_cert.pdf",
        fileSize: file?.size ?? "1.2 MB",
        certNo: certNo.trim(),
        expiryDate: expiryDate.trim(),
      });
      setSubmittedSuccess(true);
    } catch {
      // Keep on screen if error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top Header - Seamless without bottom border */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        {/* Spelling exactly as in mockup */}
        <Text style={s.headerTitle}>Cetificate</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Upload Box / Dropzone */}
        <Pressable onPress={handlePickFile} style={s.uploadBox}>
          {/* Upload Tray Icon */}
          <View style={s.uploadIconWrap}>
            <Ionicons name="arrow-up" size={19} color={colors.ink} />
            <View style={s.uploadTrayLine} />
          </View>
          <Text style={s.uploadTitle}>Upload certificate</Text>
          <Text style={s.uploadSubtitle}>PDF or JPG, max 5 MB</Text>
        </Pressable>

        {/* Uploaded File Pill Card */}
        {file && (
          <View style={s.fileCard}>
            <Text style={s.fileName}>{file.name}</Text>
            <View style={s.fileMetaCol}>
              <Text style={s.fileSize}>{file.size}</Text>
              <Pressable onPress={handleRemoveFile} hitSlop={8}>
                <Ionicons name="trash-outline" size={17} color="#6b7280" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Certificate No. Input Field */}
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Certificate no.</Text>
          <TextInput
            style={s.input}
            value={certNo}
            onChangeText={(t) => {
              setCertNo(t);
              setSubmittedSuccess(false);
            }}
            placeholder="Certificate no."
            placeholderTextColor="#9aa79e"
          />
        </View>

        {/* Expiry Date Input Field */}
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Expiry date</Text>
          <TextInput
            style={s.input}
            value={expiryDate}
            onChangeText={(t) => {
              setExpiryDate(t);
              setSubmittedSuccess(false);
            }}
            placeholder="Expiry date (e.g. 31 Dec 2027)"
            placeholderTextColor="#9aa79e"
          />
        </View>

        <View style={s.spacer} />

        {/* Success Card (Shown upon submit) */}
        {submittedSuccess && (
          <View style={s.successCard}>
            <View style={s.successCheckCircle}>
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            </View>
            <View style={s.successTextCol}>
              <Text style={s.successTitle}>Certificate submitted</Text>
              <Text style={s.successSubtitle}>
                Your food safety certificate is under verification.
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Submit CTA */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={s.submitButton}
        >
          <Text style={s.submitButtonText}>
            {submitting ? "Submitting…" : "Submit"}
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
    fontSize: 24,
    color: colors.ink,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: "800",
    color: colors.ink,
  },
  moreIcon: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: "900",
    marginTop: -4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#c4d8cc",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  uploadTrayLine: {
    width: 20,
    height: 2,
    backgroundColor: colors.ink,
    marginTop: 2,
    borderRadius: 1,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 6,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  fileCard: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  fileMetaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileSize: {
    fontSize: 12,
    color: colors.muted,
  },
  fieldGroup: {
    marginTop: 18,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64756a",
    marginLeft: 2,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e1e9e2",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.ink,
  },
  spacer: {
    height: 36,
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
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  successSubtitle: {
    fontSize: 12,
    color: "#64756a",
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
