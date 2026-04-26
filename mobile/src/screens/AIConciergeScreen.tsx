import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from "../constants";
import { queryHuskyAI } from "../services/api";

type Message = {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
};

type Props = {
  onBack: () => void;
  onSelectLot: (lot: any) => void;
};

// Local fallback when the backend is unreachable
function localAIResponse(query: string): string {
  const q = query.toLowerCase();
  const isSunday = new Date().getDay() === 0;
  const freeNote = isSunday ? "Today IS free parking (Sunday)! " : "";

  if (q.includes("free") || q.includes("sunday") || q.includes("holiday")) {
    return (
      `${freeNote}Metered parking is FREE in Seattle on Sundays and 8 holidays: ` +
      "New Year's Day, MLK Day, Presidents Day, Memorial Day, July 4, Labor Day, Thanksgiving, Christmas."
    );
  }
  if (q.includes("pike place")) {
    return (
      "Near Pike Place: Western Ave and 1st Ave have metered spots at $2.50/hr. " +
      "Pike Place Market Garage on Western Ave is covered at ~$4/hr. Arrive before 10 AM for street spots."
    );
  }
  if (q.includes("kraken") || q.includes("arena") || q.includes("event")) {
    return (
      "For Climate Pledge Arena events: SoDo lots on 1st Ave S ($20–30). " +
      "Arrive 45+ min early — they fill fast! Link Light Rail to Seattle Center is stress-free."
    );
  }
  if (q.includes("mariners") || q.includes("baseball") || q.includes("t-mobile")) {
    return (
      "For T-Mobile Park: 1st Ave S and Occidental Ave S game-day lots ($25–40). " +
      "Airport Way S has cheaper options a 10-min walk away. Arrive 1 hour before first pitch."
    );
  }
  if (q.includes("capitol hill")) {
    return (
      "Capitol Hill: 15th Ave E and John St usually have spots. " +
      "Broadway Marketplace Garage (600 Broadway E) runs ~$2–3/hr. Avoid RPZ-marked residential blocks."
    );
  }
  if (q.includes("cheap") || q.includes("budget") || q.includes("free")) {
    return (
      "Budget tips: (1) Sundays are free everywhere metered. " +
      "(2) SoDo or Georgetown street parking — often free evenings. " +
      "(3) Park on the edge of Capitol Hill and walk 5–10 min to save $8–15."
    );
  }
  return (
    `${freeNote}Metered parking in Seattle runs $2.50–3.50/hr in core areas. ` +
    "Free on Sundays and 8 holidays. " +
    "Ask me about Pike Place, Capitol Hill, downtown, Kraken/Mariners games, or cheap parking tips!"
  );
}

export default function AIConciergeScreen({ onBack }: Props) {
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hi! I'm Husky AI, your Seattle parking assistant. Ask me anything — free spots, event parking, Capitol Hill, Pike Place, and more!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    let responseText = "";

    try {
      // Try the backend first
      const res = await queryHuskyAI(userMsg.content);
      responseText = res.response;
    } catch {
      // Backend not reachable — answer locally
      responseText = localAIResponse(userMsg.content);
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.type === "user" ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          item.type === "user" ? styles.userText : styles.aiText,
        ]}
      >
        {item.content}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.flex}>
            <Text style={styles.headerTitle}>Husky AI</Text>
            <Text style={styles.headerSub}>Seattle Parking Expert</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick chips */}
        <View style={styles.chips}>
          {[
            "Free near Pike Place?",
            "Kraken game parking",
            "Is today free?",
          ].map((chip) => (
            <TouchableOpacity
              key={chip}
              style={styles.chip}
              onPress={() => sendMessage(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about Seattle parking..."
            placeholderTextColor={COLORS.text.light}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendBtnText}>{loading ? "…" : "→"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  backButton: { marginRight: SPACING.md },
  backText: { color: COLORS.text.inverse, fontSize: TYPOGRAPHY.fontSize.md },
  headerTitle: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerSub: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    opacity: 0.8,
  },
  messageList: { flex: 1 },
  messageContent: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  bubble: {
    maxWidth: "80%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: COLORS.primary },
  aiBubble: { alignSelf: "flex-start", backgroundColor: COLORS.ui.card, ...SHADOWS.sm },
  bubbleText: { fontSize: TYPOGRAPHY.fontSize.md, lineHeight: 22 },
  userText: { color: COLORS.text.inverse },
  aiText: { color: COLORS.text.primary },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.light,
    marginTop: SPACING.xs,
  },
  chips: {
    flexDirection: "row",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.ui.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.divider,
  },
  chip: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    padding: SPACING.md,
    backgroundColor: COLORS.ui.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.divider,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.text.light },
  sendBtnText: { fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.text.inverse },
});
