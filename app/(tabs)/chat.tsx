import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { CHAT_MODES, type ChatMode } from "@/lib/chat-modes-client";
import { useChatStore, type ChatMessage, type BridgeContext } from "@/lib/chat-store";
import { streamChat } from "@/lib/chat-client";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = Colors;
  const {
    recordEvent,
    learnerSummary,
    consumeBridge,
    consumeReopen,
    saveDiscovery,
  } = useChatStore();

  const [mode, setMode] = useState<ChatMode>("explain");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [bridge, setBridge] = useState<BridgeContext | null>(null);
  const [savedThisSession, setSavedThisSession] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const tabBarSpace = Platform.OS === "web" ? 84 : 0;

  // Pick up a reopened discovery or a context bridge when the tab gains focus.
  useFocusEffect(
    useCallback(() => {
      const reopen = consumeReopen();
      if (reopen) {
        setMode(reopen.mode);
        setMessages(reopen.messages);
        setBridge(
          reopen.contextDetail
            ? { label: reopen.trigger, detail: reopen.contextDetail }
            : null,
        );
        setSavedThisSession(true);
        recordEvent({ type: "discoveryReturned" });
        return;
      }
      const b = consumeBridge();
      if (b) {
        setBridge(b);
        if (b.seedQuestion && messages.length === 0) setInput(b.seedQuestion);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    setSavedThisSession(false);
    scrollToEnd();

    recordEvent({ type: "chatMessageSent" });
    recordEvent({ type: "modeUsed", mode });
    recordEvent({ type: "conceptAsked", concept: trimmed });

    const contextParts = [learnerSummary()];
    if (bridge?.detail) contextParts.push(`What they're looking at now:\n${bridge.detail}`);
    const context = contextParts.join("\n\n");

    try {
      await streamChat({
        mode,
        messages: history,
        context,
        onDelta: (delta) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = { ...last, content: last.content + delta };
            }
            return next;
          });
          scrollToEnd();
        },
      });
    } catch (e) {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant" && last.content.length === 0) {
          next[next.length - 1] = {
            ...last,
            content: "Couldn't reach Claude. Check your connection and try again.",
          };
        }
        return next;
      });
    } finally {
      setStreaming(false);
      scrollToEnd();
    }
  }, [input, streaming, messages, mode, bridge, learnerSummary, recordEvent, scrollToEnd]);

  const handleSaveDiscovery = useCallback(() => {
    if (messages.length < 2) return;
    const firstUser = messages.find((m) => m.role === "user");
    const firstAssistant = messages.find((m) => m.role === "assistant" && m.content);
    const question = firstUser?.content ?? "Exploration";
    const summary = (firstAssistant?.content ?? "").slice(0, 160);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveDiscovery({
      mode,
      title: question.slice(0, 60),
      trigger: bridge?.label ?? "Free exploration",
      question,
      summary,
      messages,
      contextDetail: bridge?.detail ?? "",
    });
    setSavedThisSession(true);
  }, [messages, mode, bridge, saveDiscovery]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setBridge(null);
    setInput("");
    setSavedThisSession(false);
  }, []);

  const canSave = messages.length >= 2 && !streaming;
  const showDiscoverPrompt =
    (mode === "discover" || mode === "focused") && canSave && !savedThisSession;

  return (
    <View style={[styles.container, { backgroundColor: palette.midnight }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 + webTopInset }]}>
        <View style={styles.headerLeft}>
          <Pressable onLongPress={() => router.push("/debug-learner")} delayLongPress={600}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Chat</Text>
          </Pressable>
          <Text style={[styles.headerSub, { color: palette.textMuted }]}>
            {CHAT_MODES.find((m) => m.id === mode)?.blurb}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {messages.length > 0 && (
            <Pressable onPress={handleNewChat} hitSlop={10} style={styles.iconBtn}>
              <Feather name="plus-circle" size={20} color={palette.textSecondary} />
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push("/discoveries")}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Feather name="compass" size={20} color={palette.amber} />
          </Pressable>
        </View>
      </View>

      {/* Mode picker */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeRow}
        >
          {CHAT_MODES.map((m) => {
            const active = m.id === mode;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMode(m.id);
                }}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: active ? palette.amber : palette.slate,
                    borderColor: active ? palette.amber : palette.cardBorder,
                  },
                ]}
              >
                <Feather
                  name={m.icon as any}
                  size={13}
                  color={active ? palette.midnight : palette.textSecondary}
                />
                <Text
                  style={[
                    styles.modeChipText,
                    { color: active ? palette.midnight : palette.textSecondary },
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {bridge && (
            <View style={[styles.contextChip, { backgroundColor: palette.amberDim, borderColor: palette.amber + "55" }]}>
              <Feather name="link" size={12} color={palette.amber} />
              <Text style={[styles.contextChipText, { color: palette.amberLight }]} numberOfLines={2}>
                {bridge.label}
              </Text>
            </View>
          )}

          {messages.length === 0 && <EmptyState mode={mode} />}

          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}

          {showDiscoverPrompt && (
            <Pressable
              onPress={handleSaveDiscovery}
              style={[styles.savePrompt, { borderColor: palette.amber + "55", backgroundColor: palette.slate }]}
            >
              <Feather name="bookmark" size={14} color={palette.amber} />
              <Text style={[styles.savePromptText, { color: palette.textSecondary }]}>
                Save this rabbit hole to Discoveries
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Composer */}
        <View
          style={[
            styles.composer,
            {
              borderTopColor: palette.cardBorder,
              backgroundColor: palette.deepNavy,
              paddingBottom: insets.bottom + 10 + tabBarSpace,
            },
          ]}
        >
          {canSave && !savedThisSession && !showDiscoverPrompt && (
            <Pressable onPress={handleSaveDiscovery} hitSlop={8} style={styles.saveInline}>
              <Feather name="bookmark" size={18} color={palette.textMuted} />
            </Pressable>
          )}
          <TextInput
            style={[styles.input, { color: palette.textPrimary, backgroundColor: palette.slate }]}
            placeholder={mode === "offline" ? "Offline Assist is a Phase 2 preview…" : "Ask anything about harmony…"}
            placeholderTextColor={palette.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!streaming}
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || streaming}
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() && !streaming ? palette.amber : palette.slateLight,
                opacity: input.trim() && !streaming ? 1 : 0.6,
              },
            ]}
          >
            {streaming ? (
              <ActivityIndicator size="small" color={palette.midnight} />
            ) : (
              <Feather name="arrow-up" size={20} color={palette.midnight} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function EmptyState({ mode }: { mode: ChatMode }) {
  const { palette } = Colors;
  const meta = CHAT_MODES.find((m) => m.id === mode)!;
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.slate }]}>
        <Feather name={meta.icon as any} size={26} color={palette.amber} />
      </View>
      <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>{meta.label}</Text>
      <Text style={[styles.emptyBody, { color: palette.textMuted }]}>{meta.blurb}</Text>
    </View>
  );
}

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming: boolean }) {
  const { palette } = Colors;
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubbleRow, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: palette.amber, borderTopRightRadius: 4 }
            : { backgroundColor: palette.slate, borderTopLeftRadius: 4, borderWidth: 1, borderColor: palette.cardBorder },
        ]}
      >
        {message.content.length === 0 && isStreaming ? (
          <ActivityIndicator size="small" color={palette.textMuted} />
        ) : (
          <Text
            style={[
              styles.bubbleText,
              { color: isUser ? palette.midnight : palette.textPrimary },
            ]}
          >
            {message.content}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerLeft: { gap: 2 },
  headerTitle: { fontSize: 26, fontFamily: "JetBrainsMono_700Bold", letterSpacing: -0.8 },
  headerSub: { fontSize: 11, fontFamily: "SpaceMono_400Regular" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBtn: { padding: 2 },
  modeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeChipText: { fontSize: 12, fontFamily: "SpaceMono_700Bold" },
  messagesContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 10 },
  contextChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  contextChipText: { fontSize: 12, fontFamily: "SpaceMono_400Regular", flex: 1 },
  empty: { alignItems: "center", gap: 10, paddingTop: 70 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "SpaceMono_700Bold" },
  emptyBody: { fontSize: 13, fontFamily: "SpaceMono_400Regular", textAlign: "center", paddingHorizontal: 40 },
  bubbleRow: { flexDirection: "row" },
  bubble: { maxWidth: "86%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 14, fontFamily: "SpaceMono_400Regular", lineHeight: 21 },
  savePrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 4,
  },
  savePromptText: { fontSize: 12, fontFamily: "SpaceMono_700Bold" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  saveInline: { paddingBottom: 10 },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    fontFamily: "SpaceMono_400Regular",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
