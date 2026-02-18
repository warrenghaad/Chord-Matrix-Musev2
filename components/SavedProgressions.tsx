import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Progression, formatChord, EMOTIONS } from "@/lib/music-engine";

interface SavedProgressionsProps {
  progressions: Progression[];
  onRemove: (id: string) => void;
  onLoad: (progression: Progression) => void;
}

function SavedItem({
  item,
  onRemove,
  onLoad,
}: {
  item: Progression;
  onRemove: () => void;
  onLoad: () => void;
}) {
  const { palette } = Colors;
  const emotion = EMOTIONS.find((e) => e.id === item.emotion);

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onLoad();
        }}
        style={[styles.savedItem, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
      >
        <View style={styles.savedHeader}>
          <View style={styles.savedMeta}>
            <View style={[styles.emotionDot, { backgroundColor: emotion?.color || palette.amber }]} />
            <Text style={[styles.savedEmotion, { color: emotion?.color || palette.textPrimary }]}>
              {emotion?.label || item.emotion}
            </Text>
            <Text style={[styles.savedKey, { color: palette.textMuted }]}>
              Key of {item.key}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onRemove();
            }}
            hitSlop={12}
          >
            <Feather name="trash-2" size={16} color={palette.textMuted} />
          </Pressable>
        </View>
        <Text style={[styles.savedChords, { color: palette.textPrimary }]}>
          {item.chords.map(formatChord).join("  →  ")}
        </Text>
        <Text style={[styles.savedTime, { color: palette.textMuted }]}>
          {new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function SavedProgressions({ progressions, onRemove, onLoad }: SavedProgressionsProps) {
  const { palette } = Colors;

  if (progressions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="bookmark" size={32} color={palette.textMuted} />
        <Text style={[styles.emptyText, { color: palette.textMuted }]}>
          No saved progressions yet
        </Text>
        <Text style={[styles.emptySubtext, { color: palette.textMuted }]}>
          Generate and save progressions you like
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {progressions.map((item) => (
        <SavedItem
          key={item.id}
          item={item}
          onRemove={() => onRemove(item.id)}
          onLoad={() => onLoad(item)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  savedItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  savedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  savedEmotion: {
    fontSize: 13,
    fontFamily: "SpaceMono_700Bold",
  },
  savedKey: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
  },
  savedChords: {
    fontSize: 16,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -0.3,
  },
  savedTime: {
    fontSize: 10,
    fontFamily: "SpaceMono_400Regular",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "SpaceMono_700Bold",
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
  },
});
