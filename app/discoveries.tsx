import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { CHAT_MODES } from "@/lib/chat-modes-client";
import { useChatStore, type Discovery } from "@/lib/chat-store";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DiscoveriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = Colors;
  const { discoveries, deleteDiscovery, reopenDiscovery } = useChatStore();

  const bottomInset = insets.bottom + (Platform.OS === "web" ? 20 : 12);

  const handleReopen = (d: Discovery) => {
    reopenDiscovery(d);
    router.push("/chat");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.midnight }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
    >
      <Text style={[styles.intro, { color: palette.textMuted }]}>
        Rabbit holes you saved while exploring. Tap to pick the thread back up.
      </Text>

      {discoveries.length === 0 && (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: palette.slate }]}>
            <Feather name="compass" size={28} color={palette.amber} />
          </View>
          <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
            No discoveries yet
          </Text>
          <Text style={[styles.emptyBody, { color: palette.textMuted }]}>
            In the Chat tab, use Discover or Focused Discovery, then save the
            conversation to keep it here.
          </Text>
        </View>
      )}

      {discoveries.map((d) => {
        const meta = CHAT_MODES.find((m) => m.id === d.mode);
        return (
          <View
            key={d.id}
            style={[styles.card, { backgroundColor: palette.slate, borderColor: palette.cardBorder }]}
          >
            <Pressable onPress={() => handleReopen(d)} style={styles.cardMain}>
              <View style={styles.cardHeader}>
                <View style={[styles.modeTag, { backgroundColor: palette.amberDim }]}>
                  <Feather name={(meta?.icon ?? "compass") as any} size={11} color={palette.amber} />
                  <Text style={[styles.modeTagText, { color: palette.amberLight }]}>
                    {meta?.label ?? d.mode}
                  </Text>
                </View>
                <Text style={[styles.time, { color: palette.textMuted }]}>
                  {timeAgo(d.createdAt)}
                </Text>
              </View>
              <Text style={[styles.title, { color: palette.textPrimary }]} numberOfLines={2}>
                {d.title}
              </Text>
              {d.summary.length > 0 && (
                <Text style={[styles.summary, { color: palette.textSecondary }]} numberOfLines={3}>
                  {d.summary}
                </Text>
              )}
              {d.trigger && d.trigger !== "Free exploration" && (
                <View style={styles.triggerRow}>
                  <Feather name="link" size={11} color={palette.textMuted} />
                  <Text style={[styles.triggerText, { color: palette.textMuted }]} numberOfLines={1}>
                    {d.trigger}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => deleteDiscovery(d.id)}
              hitSlop={10}
              style={styles.deleteBtn}
            >
              <Feather name="trash-2" size={16} color={palette.textMuted} />
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  intro: { fontSize: 12, fontFamily: "SpaceMono_400Regular", lineHeight: 18, marginBottom: 2 },
  empty: { alignItems: "center", gap: 12, paddingTop: 80, paddingHorizontal: 30 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "SpaceMono_700Bold" },
  emptyBody: { fontSize: 13, fontFamily: "SpaceMono_400Regular", textAlign: "center", lineHeight: 20 },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardMain: { flex: 1, padding: 14, gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modeTagText: { fontSize: 10, fontFamily: "SpaceMono_700Bold" },
  time: { fontSize: 10, fontFamily: "SpaceMono_400Regular" },
  title: { fontSize: 15, fontFamily: "SpaceMono_700Bold", lineHeight: 21 },
  summary: { fontSize: 12, fontFamily: "SpaceMono_400Regular", lineHeight: 18 },
  triggerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  triggerText: { fontSize: 11, fontFamily: "SpaceMono_400Regular", flex: 1 },
  deleteBtn: { padding: 14, justifyContent: "flex-start" },
});
