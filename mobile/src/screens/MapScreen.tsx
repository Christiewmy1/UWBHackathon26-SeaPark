import React, { memo, useState } from "react";
import {
  View, TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, ScrollView, StatusBar, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { MAP_CONFIG, COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from "../constants";

const PriceMarker = memo(({ lot }: { lot: any }) => {
  const pct = lot.totalStalls > 0
    ? Math.round((lot.estimatedAvailable / lot.totalStalls) * 100)
    : null;

  const ringColor = lot.isEventSurge ? "#DC2626"
    : lot.category === "free" || lot.meterFreeToday ? COLORS.availability.high
    : pct == null ? COLORS.text.secondary
    : pct > 40 ? COLORS.availability.high
    : pct > 10 ? COLORS.availability.limited
    : COLORS.availability.full;

  const priceText = lot.meterFreeToday || lot.category === "free" || !lot.pricePerHour
    ? "FREE"
    : `$${lot.pricePerHour}`;

  const ratingText = pct != null ? `${pct}%` : "—";

  return (
    <View style={[mk.bubble, { borderColor: ringColor }]}>
      <View style={[mk.dot, { backgroundColor: ringColor }]} />
      <Text style={mk.price} numberOfLines={1}>{priceText}</Text>
      <Text style={[mk.rating, { color: ringColor }]}>{ratingText}</Text>
    </View>
  );
});

const { height: SCREEN_H } = Dimensions.get("window");
const IS_SMALL = SCREEN_H < 700;

type Props = {
  lots: any[];
  sortedByAvailability: any[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  onSelectLot: (lot: any) => void;
  onOpenAI: () => void;
};

export default function MapScreen({ lots, sortedByAvailability, loading, error, refresh, onSelectLot, onOpenAI }: Props) {
  const insets = useSafeAreaInsets();
  const [sortMode, setSortMode] = useState<"map" | "list">("map");

  const isFreeDay = lots.some((l) => l.meterFreeToday && l.category === "metered");
  const eventLots = lots.filter((l) => l.isEventSurge);
  const eventName = eventLots[0]?.eventName ?? null;
  const availableLots = lots.filter((l) => l.estimatedAvailable > 0).length;

  const availabilityPct = (lot: any) =>
    lot.totalStalls > 0 ? Math.round((lot.estimatedAvailable / lot.totalStalls) * 100) : null;

  const pctColor = (pct: number | null) =>
    pct == null ? COLORS.text.secondary
    : pct > 40 ? COLORS.availability.high
    : pct > 10 ? COLORS.availability.limited
    : COLORS.availability.full;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.ui.card} />

      {/* Top header bar */}
      <View style={[styles.header, { paddingTop: insets.top + (IS_SMALL ? SPACING.xs : SPACING.sm) }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>SeaPark</Text>
          <Text style={styles.headerSub}>Seattle Parking</Text>
        </View>

        {/* Available lots badge — top right */}
        {!loading && lots.length > 0 && (
          <View style={styles.availBadge}>
            <Text style={styles.availBadgeNum}>{availableLots}</Text>
            <Text style={styles.availBadgeLabel}>available</Text>
          </View>
        )}
      </View>

      {/* Banners */}
      {isFreeDay && !loading && (
        <View style={styles.freeBanner}>
          <Text style={styles.bannerText}>Metered parking is FREE today!</Text>
        </View>
      )}
      {eventName && !loading && (
        <View style={[styles.freeBanner, styles.eventBanner]}>
          <Text style={styles.bannerText}>{eventName} today — nearby lots filling fast</Text>
        </View>
      )}

      {/* Map / List toggle */}
      {!loading && lots.length > 0 && (
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortBtn, sortMode === "map" && styles.sortBtnActive]}
            onPress={() => setSortMode("map")}
          >
            <Text style={[styles.sortBtnText, sortMode === "map" && styles.sortBtnTextActive]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortMode === "list" && styles.sortBtnActive]}
            onPress={() => setSortMode("list")}
          >
            <Text style={[styles.sortBtnText, sortMode === "list" && styles.sortBtnTextActive]}>Most Available</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main content */}
      <View style={styles.content}>
        {sortMode === "map" ? (
          <MapView style={StyleSheet.absoluteFillObject} initialRegion={MAP_CONFIG.defaultRegion}>
            {lots.map((lot: any) => (
              <Marker
                key={lot.lotId}
                coordinate={{ latitude: lot.lat, longitude: lot.lng }}
                title={lot.name}
                description={
                  lot.isEventSurge
                    ? `Event surge — ${lot.estimatedAvailable} spots left`
                    : lot.meterFreeToday
                    ? "Free today!"
                    : lot.pricePerHour
                    ? `$${lot.pricePerHour}/hr · ${lot.estimatedAvailable} open`
                    : `Free · ${lot.estimatedAvailable} open`
                }
                onCalloutPress={() => onSelectLot(lot)}
                tracksViewChanges={false}
              >
                <PriceMarker lot={lot} />
              </Marker>
            ))}
          </MapView>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {sortedByAvailability.map((lot: any) => {
              const pct = availabilityPct(lot);
              const barColor = pctColor(pct);
              return (
                <TouchableOpacity key={lot.lotId} style={styles.card} onPress={() => onSelectLot(lot)}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName} numberOfLines={1}>{lot.name}</Text>
                    <View style={styles.chips}>
                      {lot.isEventSurge && <View style={styles.eventChip}><Text style={styles.eventChipText}>Event</Text></View>}
                      {lot.meterFreeToday && <View style={styles.freeChip}><Text style={styles.freeChipText}>Free</Text></View>}
                    </View>
                  </View>
                  <Text style={styles.cardSub}>
                    {lot.estimatedAvailable} of {lot.totalStalls} open
                    {lot.pricePerHour ? `  ·  $${lot.pricePerHour}/hr` : "  ·  Free"}
                  </Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct ?? 0}%` as any, backgroundColor: barColor }]} />
                  </View>
                  {lot.isEventSurge && (
                    <Text style={styles.eventTip} numberOfLines={2}>{lot.eventTip}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 90 }} />
          </ScrollView>
        )}

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading Seattle parking...</Text>
          </View>
        )}

        {/* Error banner */}
        {error && !loading && (
          <TouchableOpacity style={styles.errorBanner} onPress={refresh}>
            <Text style={styles.errorText}>{error} — Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AI button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + (IS_SMALL ? SPACING.sm : SPACING.md) }]}>
        <TouchableOpacity style={styles.aiButton} onPress={onOpenAI}>
          <Text style={styles.aiButtonText}>Ask Husky AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ui.card },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: IS_SMALL ? SPACING.xs : SPACING.sm,
    backgroundColor: COLORS.ui.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.border,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: IS_SMALL ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },

  availBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primary + "18",
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minWidth: 64,
  },
  availBadgeNum: {
    fontSize: IS_SMALL ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize["2xl"],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    lineHeight: IS_SMALL ? 24 : 28,
  },
  availBadgeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  freeBanner: {
    backgroundColor: COLORS.availability.high,
    paddingVertical: IS_SMALL ? 4 : SPACING.xs,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },
  eventBanner: { backgroundColor: "#DC2626" },
  bannerText: {
    color: "#fff",
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  sortRow: {
    flexDirection: "row",
    backgroundColor: COLORS.ui.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.border,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: IS_SMALL ? SPACING.xs : SPACING.sm,
    alignItems: "center",
  },
  sortBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  sortBtnText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text.secondary },
  sortBtnTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.semibold },

  content: { flex: 1 },

  list: { flex: 1, backgroundColor: COLORS.backgroundLight },
  listContent: { paddingTop: SPACING.sm, paddingHorizontal: SPACING.md },

  card: {
    backgroundColor: COLORS.ui.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: IS_SMALL ? SPACING.sm : SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  cardName: {
    flex: 1,
    fontSize: IS_SMALL ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  chips: { flexDirection: "row", gap: 4 },
  eventChip: {
    backgroundColor: "#FEE2E2", borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  eventChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: "#DC2626", fontWeight: TYPOGRAPHY.fontWeight.semibold },
  freeChip: {
    backgroundColor: "#D1FAE5", borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  freeChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: "#065F46", fontWeight: TYPOGRAPHY.fontWeight.semibold },
  cardSub: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.text.secondary, marginBottom: SPACING.xs },
  barBg: { height: 5, backgroundColor: COLORS.ui.border, borderRadius: BORDER_RADIUS.full, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: BORDER_RADIUS.full },
  eventTip: { marginTop: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, color: "#DC2626", fontStyle: "italic" },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.88)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.text.secondary },

  errorBanner: {
    position: "absolute",
    top: SPACING.md,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: "#92400E",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: { color: "#FEF3C7", fontSize: TYPOGRAPHY.fontSize.xs, textAlign: "center" },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: IS_SMALL ? SPACING.sm : SPACING.md,
    backgroundColor: COLORS.ui.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.border,
  },
  aiButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: IS_SMALL ? SPACING.sm : SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

const mk = StyleSheet.create({
  bubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    backgroundColor: COLORS.ui.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 1,
  },
  price: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.text.primary,
    lineHeight: 12,
  },
  rating: {
    fontSize: 9,
    fontWeight: "600",
    lineHeight: 11,
  },
});
