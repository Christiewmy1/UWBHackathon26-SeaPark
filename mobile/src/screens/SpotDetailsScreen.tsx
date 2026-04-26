import React, { useState, useEffect } from "react";
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
import type { ParkingLot, ParkingReport, ParkingRating } from "../types";
import {
  getParkingLot,
  getLotRatings,
  subscribeToLotReports,
  submitReport,
} from "../services/firebase";

type Props = {
  lotId: string;
  onBack: () => void;
};

export default function SpotDetailsScreen({ lotId, onBack }: Props) {
  const [lot, setLot] = useState<ParkingLot | null>(null);
  const [ratings, setRatings] = useState<ParkingRating[]>([]);
  const [recentReports, setRecentReports] = useState<ParkingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeReports: (() => void) | null = null;

    const loadData = async () => {
      try {
        const [lotData, ratingsData] = await Promise.all([
          getParkingLot(lotId),
          getLotRatings(lotId),
        ]);

        if (lotData) setLot(lotData);
        setRatings(ratingsData);

        unsubscribeReports = subscribeToLotReports(lotId, (reports) => {
          setRecentReports(reports);
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeReports) unsubscribeReports();
    };
  }, [lotId]);

  const handleReport = async (reportType: "parked" | "leaving" | "full") => {
    if (!lot) return;
    await submitReport(lot.id, "anonymous", reportType, lot.latitude, lot.longitude);
  };

  const handleNavigate = () => {
    if (!lot) return;
    const url =
      Platform.OS === "ios"
        ? `maps:?daddr=${lot.latitude},${lot.longitude}`
        : `geo:${lot.latitude},${lot.longitude}?q=${lot.latitude},${lot.longitude}`;
    Linking.openURL(url);
  };

  if (loading || !lot) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lot.name}</Text>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={[styles.priceValue, lot.isFree && styles.freePrice]}>
            {lot.isFree ? "$0.00 (Free)" : `$${lot.pricePerHour ?? 0}/hr`}
          </Text>
          {lot.timeLimit && (
            <Text style={styles.timeLimit}>{lot.timeLimit}</Text>
          )}
        </View>

        {/* Scores Card */}
        <View style={styles.scoresCard}>
          <Text style={styles.sectionTitle}>Scores</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Safe-Score</Text>
              <Text style={styles.scoreValue}>
                {(lot.safeScore ?? 0).toFixed(1)}/10
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Clean-Score</Text>
              <Text style={styles.scoreValue}>
                {(lot.cleanScore ?? 0).toFixed(1)}/10
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Space-Score</Text>
              <Text style={styles.scoreValue}>
                {(lot.spaceScore ?? 0).toFixed(1)}/10
              </Text>
            </View>
          </View>
        </View>

        {/* Report Buttons */}
        <View style={styles.reportCard}>
          <Text style={styles.sectionTitle}>Report Status</Text>
          <View style={styles.reportButtons}>
            <TouchableOpacity
              style={[styles.reportButton, styles.reportButtonGreen]}
              onPress={() => handleReport("parked")}
            >
              <Text style={styles.reportButtonText}>Just Parked</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportButton, styles.reportButtonAmber]}
              onPress={() => handleReport("leaving")}
            >
              <Text style={styles.reportButtonText}>Leaving Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportButton, styles.reportButtonRed]}
              onPress={() => handleReport("full")}
            >
              <Text style={styles.reportButtonText}>Full</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Feedback */}
        <View style={styles.feedbackCard}>
          <Text style={styles.sectionTitle}>Recent Feedback</Text>
          {ratings.length === 0 ? (
            <Text style={styles.noFeedback}>No feedback yet</Text>
          ) : (
            ratings.slice(0, 5).map((rating) => (
              <View key={rating.id} style={styles.feedbackItem}>
                {rating.comment ? (
                  <Text style={styles.feedbackComment}>{rating.comment}</Text>
                ) : null}
                <View style={styles.feedbackScores}>
                  <Text style={styles.feedbackScore}>
                    Safe: {rating.safeScore} | Clean: {rating.cleanScore} | Space:{" "}
                    {rating.spaceScore}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Address */}
        {lot.address && (
          <View style={styles.addressCard}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.addressText}>{lot.address}</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigate Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
          <Text style={styles.navigateButtonText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.inverse,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.inverse,
  },
  priceCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize["3xl"],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  freePrice: {
    color: COLORS.primary,
  },
  timeLimit: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  scoresCard: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  reportCard: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  reportButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
    alignItems: "center",
  },
  reportButtonGreen: {
    backgroundColor: COLORS.availability.high,
  },
  reportButtonAmber: {
    backgroundColor: COLORS.availability.limited,
  },
  reportButtonRed: {
    backgroundColor: COLORS.availability.full,
  },
  reportButtonText: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  feedbackCard: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  noFeedback: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.light,
    fontStyle: "italic",
  },
  feedbackItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.divider,
  },
  feedbackComment: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  feedbackScores: {
    marginTop: SPACING.xs,
  },
  feedbackScore: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  addressCard: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.ui.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.divider,
  },
  navigateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
  },
  navigateButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
