import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes } from "../theme";

type Props = {
  initialRadius?: 1 | 2 | 3;
  initialFreeAlerts?: boolean;
  initialQuietHours?: boolean;
  address?: string;
  onBack: () => void;
  onSave?: (data: {
    radius: 1 | 2 | 3;
    freeAlerts: boolean;
    quietHours: boolean;
  }) => Promise<void> | void;
};

export default function NotificationRadiusScreen({
  initialRadius = 3,
  initialFreeAlerts = true,
  initialQuietHours = false,
  address = "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng",
  onBack,
  onSave,
}: Props) {
  const [radius, setRadius] = useState<1 | 2 | 3>(initialRadius);
  const [freeAlerts, setFreeAlerts] = useState(initialFreeAlerts);
  const [quietHours, setQuietHours] = useState(initialQuietHours);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave?.({
        radius,
        freeAlerts,
        quietHours,
      });
      setSavedSuccess(true);
    } catch {
      // Keep on screen if error
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Top Header - Seamless without bottom border */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.roundButton} hitSlop={8}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <Text style={s.headerTitle}>Notification Radius</Text>
        <Pressable style={s.roundButton} hitSlop={8}>
          <Text style={s.moreIcon}>···</Text>
        </Pressable>
      </View>

      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Unified Card: Map + Slider (Exact as Mockup) */}
          <View style={s.unifiedCard}>
            {/* Map Area */}
            <View style={s.mapBackground}>
              {/* Streets background grid */}
              <View style={[s.streetH, { top: 72 }]} />
              <View style={[s.streetH, { top: 160 }]} />
              <View style={[s.streetV, { left: 52 }]} />
              <View style={[s.streetV, { left: 155 }]} />
              <View style={[s.streetV, { left: 245 }]} />

              {/* Area labels */}
              <Text style={[s.mapLabel, { top: 38, left: 16 }]}>Ngũ Hành Sơn</Text>
              <Text style={[s.mapLabel, { top: 135, left: 16 }]}>Lê Văn Hiến</Text>
              <Text
                style={[
                  s.mapLabel,
                  { top: 150, right: 62, transform: [{ rotate: "90deg" }] },
                ]}
              >
                Võ Nguyên Giáp
              </Text>
              <Text style={[s.mapLabel, { top: 160, right: 18 }]}>Biển Đông</Text>

              {/* Floating Address Pill (Top-Left) */}
              <View style={s.addressPill}>
                <Ionicons name="location-outline" size={13} color={colors.ink} />
                <Text style={s.addressPillText}>{address}</Text>
              </View>

              {/* Concentric Circles centered on pin */}
              <View style={s.centerPinWrap}>
                {/* 3 km Outer Circle */}
                <View
                  style={[
                    s.circle3km,
                    radius === 3 ? s.circleActiveSolid : s.circleInactiveDashed,
                    radius >= 3 && s.circleActiveFill,
                  ]}
                >
                  {/* 2 km Middle Circle */}
                  <View
                    style={[
                      s.circle2km,
                      radius === 2 ? s.circleActiveSolid : s.circleInactiveDashed,
                      radius >= 2 && s.circleActiveFill,
                    ]}
                  >
                    {/* 1 km Inner Circle */}
                    <View
                      style={[
                        s.circle1km,
                        radius === 1 ? s.circleActiveSolid : s.circleInactiveDashed,
                        radius >= 1 && s.circleActiveFill,
                      ]}
                    >
                      {/* Center Pin */}
                      <Ionicons
                        name="location"
                        size={32}
                        color={colors.deepGreen}
                      />
                      <View style={s.pinBaseDot} />
                    </View>

                    {/* 1 km label */}
                    <View style={s.pill1km}>
                      <Text style={s.circlePillText}>1 km</Text>
                    </View>

                    {/* 2 km label */}
                    <View style={s.pill2km}>
                      <Text style={s.circlePillText}>2 km</Text>
                    </View>
                  </View>

                  {/* 3 km label */}
                  <View style={s.pill3km}>
                    <Text style={s.circlePillText}>3 km</Text>
                  </View>
                </View>
              </View>

              {/* 1 km scale bracket */}
              <View style={s.scaleContainer}>
                <Text style={s.scaleText}>1 km</Text>
                <View style={s.scaleBracket} />
              </View>

              {/* Locate me button */}
              <Pressable style={s.locateButton}>
                <Ionicons name="locate-outline" size={19} color={colors.ink} />
              </Pressable>
            </View>

            {/* Slider Section inside same Card */}
            <View style={s.sliderSection}>
              <View style={s.sliderHeader}>
                <Text style={s.sliderTitle}>Radius</Text>
                <Text style={s.sliderValue}>{radius} km</Text>
              </View>

              {/* Interactive Slider Track */}
              <View style={s.trackContainer}>
                {/* Inactive background track */}
                <View style={s.trackBarBg} />
                {/* Active track bar */}
                <View
                  style={[
                    s.trackBarActive,
                    {
                      width:
                        radius === 1 ? "12%" : radius === 2 ? "50%" : "100%",
                    },
                  ]}
                />

                {/* Thumb Knob at position */}
                <View
                  style={[
                    s.thumbKnob,
                    radius === 1 && s.thumbLeft,
                    radius === 2 && s.thumbCenter,
                    radius === 3 && s.thumbRight,
                  ]}
                />

                {/* Invisible tap areas for 1, 2, 3 km */}
                <Pressable
                  onPress={() => {
                    setRadius(1);
                    setSavedSuccess(false);
                  }}
                  style={s.stepTapLeft}
                />
                <Pressable
                  onPress={() => {
                    setRadius(2);
                    setSavedSuccess(false);
                  }}
                  style={s.stepTapCenter}
                />
                <Pressable
                  onPress={() => {
                    setRadius(3);
                    setSavedSuccess(false);
                  }}
                  style={s.stepTapRight}
                />
              </View>

              {/* Step markers below track */}
              <View style={s.stepsRow}>
                <Pressable
                  onPress={() => {
                    setRadius(1);
                    setSavedSuccess(false);
                  }}
                >
                  <Text
                    style={[
                      s.stepLabel,
                      radius === 1 && s.stepLabelActive,
                    ]}
                  >
                    1 km
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setRadius(2);
                    setSavedSuccess(false);
                  }}
                >
                  <Text
                    style={[
                      s.stepLabel,
                      radius === 2 && s.stepLabelActive,
                    ]}
                  >
                    2 km
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setRadius(3);
                    setSavedSuccess(false);
                  }}
                >
                  <Text
                    style={[
                      s.stepLabel,
                      radius === 3 && s.stepLabelActive,
                    ]}
                  >
                    3 km
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Alert Options Card (2 toggle switches) */}
          <View style={s.alertsCard}>
            {/* Row 1: Free $0 alerts */}
            <Pressable
              onPress={() => {
                setFreeAlerts(!freeAlerts);
                setSavedSuccess(false);
              }}
              style={s.alertRow}
            >
              <View style={s.bulletCircle}>
                <View style={s.bulletDot} />
              </View>
              <Text style={s.alertRowLabel}>Free $0 alerts</Text>

              {/* Custom Switch */}
              <View
                style={[
                  s.switchTrack,
                  freeAlerts ? s.switchTrackOn : s.switchTrackOff,
                ]}
              >
                <View
                  style={[
                    s.switchThumb,
                    freeAlerts ? s.switchThumbOn : s.switchThumbOff,
                  ]}
                />
              </View>
            </Pressable>

            <View style={s.rowDivider} />

            {/* Row 2: Quiet hours (22:00–06:00) */}
            <Pressable
              onPress={() => {
                setQuietHours(!quietHours);
                setSavedSuccess(false);
              }}
              style={s.alertRow}
            >
              <View style={s.bulletCircle}>
                <View style={s.bulletDot} />
              </View>
              <Text style={s.alertRowLabel}>Quiet hours (22:00–06:00)</Text>

              {/* Custom Switch */}
              <View
                style={[
                  s.switchTrack,
                  quietHours ? s.switchTrackOn : s.switchTrackOff,
                ]}
              >
                <View
                  style={[
                    s.switchThumb,
                    quietHours ? s.switchThumbOn : s.switchThumbOff,
                  ]}
                />
              </View>
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottom Section: Changes saved Card & Save CTA */}
        <View style={s.bottomSection}>
          {savedSuccess && (
            <View style={s.successCard}>
              <View style={s.successCheckCircle}>
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              </View>
              <View style={s.successTextCol}>
                <Text style={s.successTitle}>Changes saved</Text>
                <Text style={s.successSubtitle}>Your radius has been updated.</Text>
              </View>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={s.saveButton}
          >
            <Text style={s.saveButtonText}>
              {saving ? "Saving…" : "Save"}
            </Text>
          </Pressable>

          {/* Home indicator bar */}
          <View style={s.homeIndicator} />
        </View>
      </View>
    </View>
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
    borderColor: "#e8ede8",
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  unifiedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e1ede4",
    overflow: "hidden",
  },
  mapBackground: {
    height: 260,
    position: "relative",
    backgroundColor: "#eaf3ea",
  },
  streetH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#ffffff",
  },
  streetV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: "#ffffff",
  },
  mapLabel: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7d70",
  },
  addressPill: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
  },
  centerPinWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  circle3km: {
    width: 236,
    height: 236,
    borderRadius: 118,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circle2km: {
    width: 154,
    height: 154,
    borderRadius: 77,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circle1km: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActiveSolid: {
    borderWidth: 1.5,
    borderColor: "#4a8a65",
  },
  circleInactiveDashed: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#7ea98c",
  },
  circleActiveFill: {
    backgroundColor: "rgba(63, 128, 90, 0.14)",
  },
  pinBaseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.deepGreen,
    marginTop: -3,
  },
  pill1km: {
    position: "absolute",
    top: 24,
    right: 36,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#e1e9e2",
  },
  pill2km: {
    position: "absolute",
    top: -11,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#e1e9e2",
  },
  pill3km: {
    position: "absolute",
    bottom: -11,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#e1e9e2",
  },
  circlePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink,
  },
  scaleContainer: {
    position: "absolute",
    bottom: 12,
    left: 14,
    alignItems: "flex-start",
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 2,
  },
  scaleBracket: {
    width: 44,
    height: 4,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.ink,
  },
  locateButton: {
    position: "absolute",
    bottom: 12,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  sliderSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  trackContainer: {
    height: 32,
    justifyContent: "center",
    position: "relative",
    marginVertical: 4,
  },
  trackBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2ece4",
    width: "100%",
  },
  trackBarActive: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.deepGreen,
  },
  thumbKnob: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d5dfd7",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbLeft: {
    left: 0,
  },
  thumbCenter: {
    left: "50%",
    marginLeft: -11,
  },
  thumbRight: {
    right: 0,
  },
  stepTapLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "33%",
  },
  stepTapCenter: {
    position: "absolute",
    left: "33%",
    top: 0,
    bottom: 0,
    width: "34%",
  },
  stepTapRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "33%",
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  stepLabelActive: {
    color: colors.ink,
    fontWeight: "800",
  },
  alertsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1ede4",
    marginTop: 14,
    overflow: "hidden",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bulletCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#788a7e",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#526256",
  },
  alertRowLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  switchTrackOn: {
    backgroundColor: colors.deepGreen,
  },
  switchTrackOff: {
    backgroundColor: "#e8ede8",
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbOn: {
    alignSelf: "flex-end",
  },
  switchThumbOff: {
    alignSelf: "flex-start",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#f0f4f1",
  },
  bottomSection: {
    width: "100%",
    paddingTop: 8,
  },
  successCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1ede4",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
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
  saveButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.deepGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#19221c",
    alignSelf: "center",
    marginTop: 14,
  },
});
