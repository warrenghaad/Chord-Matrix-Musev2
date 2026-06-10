import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import {
  Emotion,
  Progression,
  generateProgression,
  formatChord,
} from "@/lib/music-engine";
import { useChatStore } from "@/lib/chat-store";
import EmotionGrid from "@/components/EmotionGrid";
import KeySelector from "@/components/KeySelector";
import ChordCard from "@/components/ChordCard";
import FretboardDiagram from "@/components/FretboardDiagram";
import AlphaTabRenderer from "@/components/AlphaTabRenderer";

const STORAGE_KEY = "@chordflow_saved";

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = Colors;
  const { recordEvent, setBridge } = useChatStore();

  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [selectedKey, setSelectedKey] = useState("C");

  const handleSelectEmotion = useCallback(
    (emotion: Emotion) => {
      setSelectedEmotion(emotion);
      recordEvent({ type: "emotionSelected", emotion });
    },
    [recordEvent],
  );

  const handleSelectKey = useCallback(
    (key: string) => {
      setSelectedKey(key);
      recordEvent({ type: "keySelected", key });
    },
    [recordEvent],
  );
  const [currentProgression, setCurrentProgression] =
    useState<Progression | null>(null);
  const [generating, setGenerating] = useState(false);

  const buttonScale = useSharedValue(1);
  const buttonRotate = useSharedValue(0);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { rotate: `${buttonRotate.value}deg` },
    ],
  }));

  const handleGenerate = useCallback(() => {
    if (!selectedEmotion) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1.05, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );
    buttonRotate.value = withSequence(
      withTiming(15, { duration: 60 }),
      withTiming(-15, { duration: 60 }),
      withSpring(0, { damping: 8 })
    );

    setGenerating(true);
    setTimeout(() => {
      const prog = generateProgression(selectedEmotion, selectedKey);
      setCurrentProgression(prog);
      setGenerating(false);
      recordEvent({
        type: "progressionGenerated",
        emotion: selectedEmotion,
        key: selectedKey,
      });
      prog.chords.forEach((c) => {
        if (c.extension) recordEvent({ type: "extensionExplored", extension: c.extension });
      });
    }, 150);
  }, [selectedEmotion, selectedKey, recordEvent]);

  const handleSave = useCallback(async () => {
    if (!currentProgression) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const saved: Progression[] = existing ? JSON.parse(existing) : [];
      saved.unshift({ ...currentProgression, saved: true });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setCurrentProgression({ ...currentProgression, saved: true });
      recordEvent({ type: "progressionSaved" });
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, [currentProgression, recordEvent]);

  const handleAskAboutProgression = useCallback(() => {
    if (!currentProgression) return;
    Haptics.selectionAsync();
    const chordList = currentProgression.chords
      .map((c) => `${formatChord(c)} (${c.narrativeRole})`)
      .join(" - ");
    setBridge({
      label: `${currentProgression.emotion} progression in ${currentProgression.key}`,
      detail: `The player generated a "${currentProgression.emotion}" progression in the key of ${currentProgression.key}: ${chordList}.`,
      seedQuestion: "What makes this progression work, and how could I make it more interesting?",
      emotion: currentProgression.emotion,
      key: currentProgression.key,
    });
    router.push("/chat");
  }, [currentProgression, setBridge, router]);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: palette.midnight }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16 + webTopInset,
            paddingBottom: 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            ChordFlow
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Emotion-driven chord progressions
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="music" size={16} color={palette.amber} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Key Center
            </Text>
          </View>
          <KeySelector selected={selectedKey} onSelect={handleSelectKey} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={16} color={palette.amber} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Emotion
            </Text>
          </View>
          <EmotionGrid
            selected={selectedEmotion}
            onSelect={handleSelectEmotion}
          />
        </View>

        <Animated.View style={buttonAnimStyle}>
          <Pressable
            onPress={handleGenerate}
            disabled={!selectedEmotion}
            style={[
              styles.generateButton,
              {
                backgroundColor: selectedEmotion
                  ? palette.amber
                  : palette.slateLight,
                opacity: selectedEmotion ? 1 : 0.5,
              },
            ]}
          >
            <Feather
              name="shuffle"
              size={20}
              color={selectedEmotion ? palette.midnight : palette.textMuted}
            />
            <Text
              style={[
                styles.generateText,
                {
                  color: selectedEmotion
                    ? palette.midnight
                    : palette.textMuted,
                },
              ]}
            >
              {generating ? "Generating..." : "Randomize Progression"}
            </Text>
          </Pressable>
        </Animated.View>

        {currentProgression && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <View>
                <Text
                  style={[styles.resultTitle, { color: palette.textPrimary }]}
                >
                  Your Progression
                </Text>
                <Text
                  style={[styles.resultMeta, { color: palette.textMuted }]}
                >
                  {selectedEmotion} / Key of {currentProgression.key}
                </Text>
              </View>
              <View style={styles.resultActions}>
                <Pressable
                  onPress={handleAskAboutProgression}
                  hitSlop={12}
                  style={[styles.askButton, { borderColor: palette.amber + "66" }]}
                >
                  <Feather name="message-circle" size={15} color={palette.amber} />
                  <Text style={[styles.askButtonText, { color: palette.amber }]}>Ask</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={currentProgression.saved}
                  hitSlop={12}
                >
                  <Feather
                    name={currentProgression.saved ? "check" : "bookmark"}
                    size={22}
                    color={
                      currentProgression.saved
                        ? palette.success
                        : palette.amber
                    }
                  />
                </Pressable>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chordsRow}
            >
              {currentProgression.chords.map((chord, i) => (
                <ChordCard
                  key={`${currentProgression.id}-${i}`}
                  chord={chord}
                  index={i}
                  isLast={i === currentProgression.chords.length - 1}
                />
              ))}
            </ScrollView>

            <View style={[styles.narrativeBox, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
              <View style={styles.narrativeHeader}>
                <Feather name="book-open" size={14} color={palette.amber} />
                <Text style={[styles.narrativeTitle, { color: palette.amber }]}>
                  Narrative Arc
                </Text>
              </View>
              <Text style={[styles.narrativeText, { color: palette.textSecondary }]}>
                {currentProgression.chords
                  .map((c, i) => {
                    const roles: Record<string, string> = {
                      setup: "establishes the mood",
                      rising: "builds tension",
                      climax: "reaches the peak",
                      resolution: "brings it home",
                      color: "adds emotional shade",
                    };
                    return `${formatChord(c)} ${roles[c.narrativeRole]}`;
                  })
                  .join(", then ")}
                .
              </Text>
            </View>

            <View style={[styles.extensionBox, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
              <View style={styles.narrativeHeader}>
                <Feather name="sliders" size={14} color="#EC4899" />
                <Text style={[styles.narrativeTitle, { color: "#EC4899" }]}>
                  Solo Extensions Guide
                </Text>
              </View>
              {currentProgression.chords
                .filter((c) => c.extension)
                .map((c, i) => (
                  <View key={i} style={styles.extensionRow}>
                    <Text
                      style={[
                        styles.extensionChordName,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {formatChord(c)}
                    </Text>
                    <Text
                      style={[
                        styles.extensionHint,
                        { color: palette.textMuted },
                      ]}
                    >
                      {getExtensionHint(c.extension!)}
                    </Text>
                  </View>
                ))}
            </View>

            <AlphaTabRenderer
              chords={currentProgression.chords}
              title={`${currentProgression.emotion}`}
              keyName={currentProgression.key}
              tempo={100}
            />

            <View style={[styles.fretboardSection, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
              <View style={styles.narrativeHeader}>
                <Feather name="grid" size={14} color="#10B981" />
                <Text style={[styles.narrativeTitle, { color: "#10B981" }]}>
                  Chord Diagrams
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fretboardRow}
              >
                {currentProgression.chords.map((c, i) => (
                  <View key={i} style={styles.fretboardItem}>
                    <Text style={[styles.fretboardChordLabel, { color: palette.textPrimary }]}>
                      {formatChord(c)}
                    </Text>
                    <FretboardDiagram
                      root={c.root}
                      quality={c.quality}
                      extension={c.extension}
                      chordName={formatChord(c)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function getExtensionHint(ext: string): string {
  const hints: Record<string, string> = {
    "7": "Dominant pull. Target b7 in your lines.",
    maj7: "Lush and open. Let the major 7th ring.",
    min7: "Smooth minor. Walk through the b7.",
    "9": "Color the 9th over the root. Wide voicing.",
    maj9: "Dreamy. Float the 9th over maj7.",
    min9: "Deep and searching. b3 to 9 is your interval.",
    "11": "Suspended quality. Lean into the 4th.",
    "13": "Rich and full. The 13th adds brightness.",
    add9: "Simple color. Just the 9th, no 7th needed.",
    "6": "Sweet and vintage. Classic jazz color.",
    min6: "Dorian flavor. The natural 6 over minor.",
    "7b5": "Locrian tension. Tritone from the root.",
    "7#5": "Augmented dominant. Whole-tone scale moment.",
    "7b9": "Dark dominant. Minor 9th interval creates drama.",
    "7#9": "The Hendrix chord. Blues-rock grit.",
    "7#11": "Lydian dominant. Bright and otherworldly.",
    dim7: "Symmetric. Every note is a minor 3rd apart.",
    m7b5: "Half-diminished. Gateway to minor ii-V.",
    alt: "Altered scale. All tensions raised or lowered.",
    sus: "No 3rd. Pure suspension and ambiguity.",
    "6/9": "Warm and complete. Great for endings.",
  };
  return hints[ext] || "Explore this color in your solo.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "SpaceMono_400Regular",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "SpaceMono_700Bold",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateText: {
    fontSize: 16,
    fontFamily: "SpaceMono_700Bold",
  },
  resultSection: {
    gap: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  askButtonText: {
    fontSize: 13,
    fontFamily: "SpaceMono_700Bold",
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: "SpaceMono_700Bold",
  },
  resultMeta: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    marginTop: 2,
  },
  chordsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  narrativeBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  narrativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  narrativeTitle: {
    fontSize: 12,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  narrativeText: {
    fontSize: 13,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 20,
  },
  extensionBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  extensionRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  extensionChordName: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_700Bold",
    width: 80,
  },
  extensionHint: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
    flex: 1,
  },
  fretboardSection: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  fretboardRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
  },
  fretboardItem: {
    alignItems: "center",
    gap: 6,
  },
  fretboardChordLabel: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
