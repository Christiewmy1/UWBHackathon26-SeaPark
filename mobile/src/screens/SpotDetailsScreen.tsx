import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Linking,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from "../constants";

type Props = {
  lot: any;
  onBack: () => void;
  onReport: (lotId: string, type: "available" | "full") => void;
};

export default function SpotDetailsScreen({ lot, onBack, onReport }: Props) {
  const [myReport, setMyReport] = useState<"available" | "full" | null>(null);

  const availabilityPct =
    lot.totalStalls > 0
      ? Math.round((lot.estimatedAvailable / lot.totalStalls) * 100)
      : null;

  const availabilityColor =
    availabilityPct == null
      ? COLORS.text.secondary
      : availabilityPct > 40
      ? COLORS.availability.high
      : availabilityPct > 10
      ? COLORS.availability.limited
      : COLORS.availability.full;

  const confidencePct = Math.round((lot.confidence ?? 0.65) * 100);
  const reportCount = lot.reportCount ?? 0;

  const confidenceLabel =
    confidencePct >= 85 ? "High" : confidencePct >= 65 ? "Medium" : "Low";
  const confidenceColor =
    confidencePct >= 85
      ? COLORS.availability.high
      : confidencePct >= 65
      ? COLORS.availability.limited
      : COLORS.availability.full;

  const handleReport = (type: "available" | "full") => {
    if (myReport) return;
    setMyReport(type);
    onReport(lot.lotId, type);
  };

  const handleNavigate = () => {
    const url =
      Platform.OS === "ios"
        ? `maps:?daddr=${lot.lat},${lot.lng}`
        : `geo:${lot.lat},${lot.lng}?q=${lot.lat},${lot.lng}`;
    Linking.openURL(url);
  };

  const categoryLabel: Record<string, string> = {
    free: "Free Lot",
    metered: "Metered Street",
    garage: "Covered Garage",
    lot: "Surface Lot",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>
            {lot.name}
          </Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>
              {categoryLabel[lot.category] ?? lot.category}
            </Text>
          </View>
        </View>

        {/* Price card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Rate</Text>
          {lot.meterFreeToday ? (
            <Text style={[styles.priceValue, { color: COLORS.availability.high }]}>FREE</Text>
          ) : lot.pricePerHour ? (
            <Text style={styles.priceValue}>${lot.pricePerHour.toFixed(2)}/hr</Text>
          ) : (
            <Text style={[styles.priceValue, { color: COLORS.availability.high }]}>FREE</Text>
          )}
          {lot.meterFreeToday && (
            <Text style={styles.freeNote}>Metered parking is free today (Sunday/holiday)</Text>
          )}
        </View>

        {/* Availability card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Availability</Text>
          {availabilityPct != null ? (
            <>
              <Text style={[styles.availValue, { color: availabilityColor }]}>
                ~{lot.estimatedAvailable} of {lot.totalStalls} open
              </Text>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${availabilityPct}%` as any, backgroundColor: availabilityColor },
                  ]}
                />
              </View>
              <Text style={styles.freshnessLabel}>{lot.freshnessLabel}</Text>
            </>
          ) : (
            <Text style={styles.availValue}>Unknown</Text>
          )}
        </View>

        {/* Crowdsourced Confidence card */}
        <View style={styles.card}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.cardLabel}>Crowdsourced Confidence</Text>
            <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "22" }]}>
              <Text style={[styles.confidenceBadgeText, { color: confidenceColor }]}>
                {confidenceLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.confidenceSubtitle}>
            User input sharpens predictions when official data lags
          </Text>

          {/* Confidence bar */}
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                { width: `${confidencePct}%` as any, backgroundColor: confidenceColor },
              ]}
            />
          </View>
          <Text style={[styles.confidencePct, { color: confidenceColor }]}>
            {confidencePct}% confidence
          </Text>

          {reportCount > 0 && (
            <Text style={styles.reportCount}>
              Based on {reportCount} community report{reportCount === 1 ? "" : "s"} in the last hour
            </Text>
          )}

          {/* Report buttons */}
          {myReport ? (
            <View style={styles.thankYou}>
              <Text style={styles.thankYouText}>
                {myReport === "available"
                  ? "Thanks! Spot confirmed available."
                  : "Thanks! Marked as full."}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.reportPrompt}>What did you find?</Text>
              <View style={styles.reportButtons}>
                <TouchableOpacity
                  style={[styles.reportBtn, styles.reportBtnAvailable]}
                  onPress={() => handleReport("available")}
                >
                  <Text style={styles.reportBtnIcon}>P</Text>
                  <Text style={styles.reportBtnText}>Found a Spot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reportBtn, styles.reportBtnFull]}
                  onPress={() => handleReport("full")}
                >
                  <Text style={styles.reportBtnIcon}>X</Text>
                  <Text style={styles.reportBtnText}>It's Full</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: confidenceColor }]}>
              {confidencePct}%
            </Text>
            <Text style={styles.statLabel}>Confidence</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{lot.totalStalls || "?"}</Text>
            <Text style={styles.statLabel}>Total Spaces</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {lot.timePattern === "quiet"
                ? "Quiet"
                : lot.timePattern === "busy"
                ? "Busy"
                : "Moderate"}
            </Text>
            <Text style={styles.statLabel}>Right Now</Text>
          </View>
        </View>

        {/* Seattle parking rules */}
        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>Seattle Parking Rules</Text>
          <Text style={styles.infoText}>
            Metered parking is FREE on Sundays and 8 Seattle holidays. Always check posted
            signs for time limits and permit-zone restrictions.
          </Text>
        </View>
      </ScrollView>

      {/* Navigate button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
          <Text style={styles.navButtonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING["4xl"] },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING["2xl"],
  },
  backButton: { marginBottom: SPACING.sm },
  backText: { color: COLORS.text.inverse, fontSize: TYPOGRAPHY.fontSize.md },
  title: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  card: {
    margin: SPACING.lg,
    marginBottom: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  cardLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize["3xl"],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  freeNote: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.availability.high,
  },
  availValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  barBackground: {
    height: 8,
    backgroundColor: COLORS.ui.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.xs,
  },
  barFill: { height: "100%", borderRadius: BORDER_RADIUS.full },
  freshnessLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text.secondary },

  // Confidence section
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  confidenceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  confidenceBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  confidenceSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.light,
    marginBottom: SPACING.md,
    fontStyle: "italic",
  },
  confidencePct: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  reportCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  reportPrompt: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reportButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  reportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  reportBtnAvailable: { backgroundColor: "#D1FAE5" },
  reportBtnFull: { backgroundColor: "#FEE2E2" },
  reportBtnIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  reportBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  thankYou: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#D1FAE5",
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  thankYouText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: "#065F46",
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  statsRow: {
    flexDirection: "row",
    margin: SPACING.lg,
    marginBottom: 0,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    overflow: "hidden",
  },
  statItem: { flex: 1, paddingVertical: SPACING.lg, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: COLORS.ui.divider },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  infoCard: { marginTop: SPACING.lg, backgroundColor: "#EFF6FF" },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: "#1D4ED8",
    marginBottom: SPACING.xs,
  },
  infoText: { fontSize: TYPOGRAPHY.fontSize.sm, color: "#1E40AF", lineHeight: 20 },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.divider,
  },
  navButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
  },
  navButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
