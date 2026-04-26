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
import type { ParkingLot } from "../types";
import { queryHuskyAI } from "../services/api";

type Message = {
  id: string;
  type: "user" | "ai";
  content: string;
  suggestedLocations?: ParkingLot[];
  timestamp: Date;
};

type Props = {
  onBack: () => void;
  onSelectLot: (lotId: string) => void;
};

export default function AIConciergeScreen({ onBack, onSelectLot }: Props) {
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hi! I'm Husky AI, your Seattle parking assistant. Ask me anything about parking in Seattle!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await queryHuskyAI(userMessage.content);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.response,
        suggestedLocations: response.suggestedLocations ?? [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I couldn't reach the AI service. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.type === "user" ? styles.userMessageText : styles.aiMessageText,
        ]}
      >
        {item.content}
      </Text>

      {item.suggestedLocations && item.suggestedLocations.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested Locations</Text>
          {item.suggestedLocations.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.suggestionItem}
              onPress={() => onSelectLot(lot.id)}
            >
              <Text style={styles.suggestionName}>{lot.name}</Text>
              <Text style={styles.suggestionPrice}>
                {lot.isFree ? "Free" : `$${lot.pricePerHour}/hr`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Husky AI</Text>
            <Text style={styles.headerSubtitle}>Seattle Parking Expert</Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        {/* Quick Suggestions */}
        <View style={styles.suggestionsBar}>
          <TouchableOpacity
            style={styles.quickSuggestion}
            onPress={() =>
              handleQuickSuggestion("Where can I park for free near Pike Place?")
            }
          >
            <Text style={styles.quickSuggestionText}>Free near Pike Place</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickSuggestion}
            onPress={() =>
              handleQuickSuggestion("Safe parking in Capitol Hill?")
            }
          >
            <Text style={styles.quickSuggestionText}>Capitol Hill safety</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickSuggestion}
            onPress={() => handleQuickSuggestion("Kraken game parking")}
          >
            <Text style={styles.quickSuggestionText}>Event parking</Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about parking in Seattle..."
            placeholderTextColor={COLORS.text.light}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>{loading ? "..." : "→"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.inverse,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.inverse,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.inverse,
    opacity: 0.8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: SPACING.lg,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.ui.card,
    ...SHADOWS.sm,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.fontSize.md * TYPOGRAPHY.lineHeight.normal,
  },
  userMessageText: {
    color: COLORS.text.inverse,
  },
  aiMessageText: {
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.light,
    marginTop: SPACING.xs,
  },
  suggestionsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.divider,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ui.divider,
  },
  suggestionName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
    flex: 1,
  },
  suggestionPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  suggestionsBar: {
    flexDirection: "row",
    padding: SPACING.sm,
    backgroundColor: COLORS.ui.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.ui.divider,
  },
  quickSuggestion: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  quickSuggestionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  inputContainer: {
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
  sendButton: {
    width: 44,
    height: 44,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.text.light,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text.inverse,
  },
});
