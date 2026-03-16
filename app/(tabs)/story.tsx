import React, { useState, useCallback } from "react";
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
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import KeySelector from "@/components/KeySelector";
import {
  Emotion,
  EMOTIONS,
  StoryArc,
  StoryChapter,
  STORY_ARC_TEMPLATES,
  STORY_ROLE_META,
  generateStoryProgression,
  generateCustomStoryProgression,
  formatChord,
} from "@/lib/music-engine";

const STORAGE_KEY = "@chordflow_saved";

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  water: "droplet",
  flag: "flag",
  eye: "eye",
  cloud: "cloud",
  zap: "zap",
  heart: "heart",
  sunset: "sunset",
  moon: "moon",
  sun: "sun",
  coffee: "coffee",
};

type Mode = "templates" | "custom";

export default function StoryScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = Colors;
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [mode, setMode] = useState<Mode>("templates");
  const [selectedKey, setSelectedKey] = useState("C");
  const [selectedArc, setSelectedArc] = useState<StoryArc | null>(null);
  const [customEmotions, setCustomEmotions] = useState<Emotion[]>([]);
  const [chapters, setChapters] = useState<StoryChapter[] | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const generateScale = useSharedValue(1);
  const generateAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: generateScale.value }],
  }));

  const handleSelectTemplate = useCallback(
    (arc: StoryArc) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedArc(selectedArc?.id === arc.id ? null : arc);
      setChapters(null);
      setExpandedChapter(null);
    },
    [selectedArc]
  );

  const handleAddEmotion = useCallback(
    (emotion: Emotion) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (customEmotions.length >= 8) return;
      setCustomEmotions([...customEmotions, emotion]);
      setChapters(null);
      setExpandedChapter(null);
    },
    [customEmotions]
  );

  const handleRemoveEmotion = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCustomEmotions(customEmotions.filter((_, i) => i !== index));
      setChapters(null);
      setExpandedChapter(null);
    },
    [customEmotions]
  );

  const handleMoveEmotion = useCallback(
    (index: number, direction: "up" | "down") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newOrder = [...customEmotions];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= newOrder.length) return;
      [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
      setCustomEmotions(newOrder);
      setChapters(null);
    },
    [customEmotions]
  );

  const handleGenerate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    generateScale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1.05, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );

    if (mode === "templates" && selectedArc) {
      const result = generateStoryProgression(selectedArc, selectedKey);
      setChapters(result);
      setExpandedChapter(0);
    } else if (mode === "custom" && customEmotions.length >= 2) {
      const result = generateCustomStoryProgression(customEmotions, selectedKey);
      setChapters(result);
      setExpandedChapter(0);
    }
  }, [mode, selectedArc, customEmotions, selectedKey]);

  const handleSaveAll = useCallback(async () => {
    if (!chapters) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = existing ? JSON.parse(existing) : [];
      const toSave = chapters
        .filter((ch) => ch.progression)
        .map((ch) => ({ ...ch.progression!, saved: true }));
      saved.unshift(...toSave);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, [chapters]);

  const canGenerate =
    (mode === "templates" && selectedArc !== null) ||
    (mode === "custom" && customEmotions.length >= 2);

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
            Story Progression
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Sequence emotions into a narrative chord arc
          </Text>
        </View>

        <View style={styles.modeToggle}>
          <Pressable
            onPress={() => {
              setMode("templates");
              setChapters(null);
              setExpandedChapter(null);
            }}
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  mode === "templates" ? palette.amber : palette.cardBg,
                borderColor:
                  mode === "templates" ? palette.amber : palette.cardBorder,
              },
            ]}
          >
            <Feather
              name="book-open"
              size={14}
              color={mode === "templates" ? palette.midnight : palette.textMuted}
            />
            <Text
              style={[
                styles.modeText,
                {
                  color:
                    mode === "templates" ? palette.midnight : palette.textPrimary,
                },
              ]}
            >
              Presets
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMode("custom");
              setChapters(null);
              setExpandedChapter(null);
            }}
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  mode === "custom" ? palette.amber : palette.cardBg,
                borderColor:
                  mode === "custom" ? palette.amber : palette.cardBorder,
              },
            ]}
          >
            <Feather
              name="edit-3"
              size={14}
              color={mode === "custom" ? palette.midnight : palette.textMuted}
            />
            <Text
              style={[
                styles.modeText,
                {
                  color:
                    mode === "custom" ? palette.midnight : palette.textPrimary,
                },
              ]}
            >
              Custom
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="music" size={16} color={palette.amber} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Key Center
            </Text>
          </View>
          <KeySelector selected={selectedKey} onSelect={setSelectedKey} />
        </View>

        {mode === "templates" && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="layers" size={16} color={palette.amber} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Story Templates
              </Text>
            </View>
            <Text style={[styles.sectionSub, { color: palette.textMuted }]}>
              Each template sequences emotions into a narrative arc
            </Text>
            <View style={styles.templateList}>
              {STORY_ARC_TEMPLATES.map((arc) => (
                <TemplateCard
                  key={arc.id}
                  arc={arc}
                  isSelected={selectedArc?.id === arc.id}
                  onPress={() => handleSelectTemplate(arc)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {mode === "custom" && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="list" size={16} color={palette.amber} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Emotion Sequence
              </Text>
              <Text style={[styles.countBadge, { color: palette.textMuted }]}>
                {customEmotions.length}/8
              </Text>
            </View>
            <Text style={[styles.sectionSub, { color: palette.textMuted }]}>
              Tap emotions to add them in story order (min 2, max 8)
            </Text>

            {customEmotions.length > 0 && (
              <View style={styles.sequenceList}>
                {customEmotions.map((emotion, i) => {
                  const data = EMOTIONS.find((e) => e.id === emotion)!;
                  return (
                    <Animated.View
                      key={`${emotion}-${i}`}
                      entering={FadeInDown.delay(i * 50).duration(200)}
                      style={[
                        styles.sequenceItem,
                        {
                          backgroundColor: data.color + "12",
                          borderColor: data.color + "33",
                        },
                      ]}
                    >
                      <View style={styles.sequenceIndex}>
                        <Text style={[styles.sequenceIndexText, { color: data.color }]}>
                          {i + 1}
                        </Text>
                      </View>
                      <Feather
                        name={ICON_MAP[data.icon] || "circle"}
                        size={14}
                        color={data.color}
                      />
                      <Text style={[styles.sequenceLabel, { color: data.color }]}>
                        {data.label}
                      </Text>
                      <View style={styles.sequenceActions}>
                        <Pressable
                          onPress={() => handleMoveEmotion(i, "up")}
                          hitSlop={8}
                          disabled={i === 0}
                          style={{ opacity: i === 0 ? 0.3 : 1 }}
                        >
                          <Feather name="chevron-up" size={16} color={palette.textMuted} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleMoveEmotion(i, "down")}
                          hitSlop={8}
                          disabled={i === customEmotions.length - 1}
                          style={{ opacity: i === customEmotions.length - 1 ? 0.3 : 1 }}
                        >
                          <Feather name="chevron-down" size={16} color={palette.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => handleRemoveEmotion(i)} hitSlop={8}>
                          <Feather name="x" size={16} color={palette.error} />
                        </Pressable>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            )}

            <View style={styles.emotionPicker}>
              {EMOTIONS.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleAddEmotion(item.id)}
                  disabled={customEmotions.length >= 8}
                  style={[
                    styles.emotionChip,
                    {
                      backgroundColor: item.color + "15",
                      borderColor: item.color + "33",
                      opacity: customEmotions.length >= 8 ? 0.4 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={ICON_MAP[item.icon] || "circle"}
                    size={12}
                    color={item.color}
                  />
                  <Text style={[styles.emotionChipText, { color: item.color }]}>
                    {item.label}
                  </Text>
                  <Feather name="plus" size={10} color={item.color} />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View style={generateAnimStyle}>
          <Pressable
            onPress={handleGenerate}
            disabled={!canGenerate}
            style={[
              styles.generateButton,
              {
                backgroundColor: canGenerate ? palette.amber : palette.slateLight,
                opacity: canGenerate ? 1 : 0.5,
              },
            ]}
          >
            <Feather
              name="play"
              size={20}
              color={canGenerate ? palette.midnight : palette.textMuted}
            />
            <Text
              style={[
                styles.generateText,
                { color: canGenerate ? palette.midnight : palette.textMuted },
              ]}
            >
              Generate Story
            </Text>
          </Pressable>
        </Animated.View>

        {chapters && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={[styles.resultTitle, { color: palette.textPrimary }]}>
                  {mode === "templates" && selectedArc
                    ? selectedArc.name
                    : "Custom Story"}
                </Text>
                <Text style={[styles.resultMeta, { color: palette.textMuted }]}>
                  {chapters.length} chapters in {selectedKey}
                </Text>
              </View>
              <Pressable onPress={handleSaveAll} hitSlop={12}>
                <Feather name="save" size={20} color={palette.amber} />
              </Pressable>
            </View>

            <StoryTimeline chapters={chapters} />

            {chapters.map((chapter, i) => (
              <ChapterCard
                key={`ch-${i}`}
                chapter={chapter}
                index={i}
                total={chapters.length}
                isExpanded={expandedChapter === i}
                onToggle={() =>
                  setExpandedChapter(expandedChapter === i ? null : i)
                }
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function TemplateCard({
  arc,
  isSelected,
  onPress,
}: {
  arc: StoryArc;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { palette } = Colors;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.templateCard,
        {
          backgroundColor: isSelected ? palette.amber + "12" : palette.cardBg,
          borderColor: isSelected ? palette.amber : palette.cardBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.templateName,
          { color: isSelected ? palette.amber : palette.textPrimary },
        ]}
      >
        {arc.name}
      </Text>
      <Text style={[styles.templateDesc, { color: palette.textSecondary }]}>
        {arc.description}
      </Text>
      <View style={styles.templateEmotions}>
        {arc.emotionOrder.map((emo, i) => {
          const data = EMOTIONS.find((e) => e.id === emo)!;
          return (
            <React.Fragment key={`${emo}-${i}`}>
              <View
                style={[styles.templateEmoDot, { backgroundColor: data.color }]}
              />
              {i < arc.emotionOrder.length - 1 && (
                <View style={[styles.templateEmoLine, { backgroundColor: palette.textMuted + "44" }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.templateEmotionLabels}>
        {arc.emotionOrder.map((emo, i) => {
          const data = EMOTIONS.find((e) => e.id === emo)!;
          return (
            <Text
              key={`label-${emo}-${i}`}
              style={[styles.templateEmoLabel, { color: data.color }]}
              numberOfLines={1}
            >
              {data.label.slice(0, 4)}
            </Text>
          );
        })}
      </View>
    </Pressable>
  );
}

function StoryTimeline({ chapters }: { chapters: StoryChapter[] }) {
  const { palette } = Colors;

  const maxTension = Math.max(
    ...chapters.map((ch) =>
      ch.progression
        ? Math.max(...ch.progression.chords.map((c) => c.tensionLevel))
        : 0
    )
  );

  return (
    <View style={[styles.timeline, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
      <View style={styles.timelineHeader}>
        <Feather name="activity" size={14} color={palette.amber} />
        <Text style={[styles.timelineTitle, { color: palette.amber }]}>
          Tension Arc
        </Text>
      </View>
      <View style={styles.timelineGraph}>
        {chapters.map((ch, i) => {
          const avgTension = ch.progression
            ? ch.progression.chords.reduce((s, c) => s + c.tensionLevel, 0) /
              ch.progression.chords.length
            : 0;
          const height = maxTension > 0 ? (avgTension / maxTension) * 60 + 8 : 8;
          const emotionData = EMOTIONS.find((e) => e.id === ch.emotion)!;
          const roleMeta = STORY_ROLE_META[ch.storyRole];

          return (
            <View key={i} style={styles.timelineBar}>
              <View
                style={[
                  styles.timelineBarFill,
                  {
                    height,
                    backgroundColor: emotionData.color,
                    borderRadius: 4,
                  },
                ]}
              />
              <Text style={[styles.timelineBarLabel, { color: palette.textMuted }]}>
                {roleMeta.label.slice(0, 3)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ChapterCard({
  chapter,
  index,
  total,
  isExpanded,
  onToggle,
}: {
  chapter: StoryChapter;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { palette } = Colors;
  const emotionData = EMOTIONS.find((e) => e.id === chapter.emotion)!;
  const roleMeta = STORY_ROLE_META[chapter.storyRole];
  const prog = chapter.progression;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(250)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        style={[
          styles.chapterCard,
          {
            backgroundColor: palette.cardBg,
            borderColor: isExpanded ? emotionData.color + "66" : palette.cardBorder,
          },
        ]}
      >
        <View style={styles.chapterHeader}>
          <View style={styles.chapterIndexCol}>
            <View style={[styles.chapterDot, { backgroundColor: emotionData.color }]} />
            {index < total - 1 && (
              <View style={[styles.chapterLine, { backgroundColor: palette.textMuted + "33" }]} />
            )}
          </View>
          <View style={styles.chapterContent}>
            <View style={styles.chapterTitleRow}>
              <Text style={[styles.chapterTitle, { color: palette.textPrimary }]}>
                {chapter.chapterTitle}
              </Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={palette.textMuted}
              />
            </View>

            <View style={styles.chapterBadges}>
              <View style={[styles.roleBadge, { backgroundColor: roleMeta.color + "18" }]}>
                <Feather
                  name={roleMeta.icon as keyof typeof Feather.glyphMap}
                  size={10}
                  color={roleMeta.color}
                />
                <Text style={[styles.roleBadgeText, { color: roleMeta.color }]}>
                  {roleMeta.label}
                </Text>
              </View>
              <View style={[styles.emotionBadge, { backgroundColor: emotionData.color + "18" }]}>
                <Feather
                  name={ICON_MAP[emotionData.icon] || "circle"}
                  size={10}
                  color={emotionData.color}
                />
                <Text style={[styles.emotionBadgeText, { color: emotionData.color }]}>
                  {emotionData.label}
                </Text>
              </View>
            </View>

            <Text style={[styles.chapterNarrative, { color: palette.textSecondary }]}>
              {chapter.narrativeDescription}
            </Text>

            {prog && (
              <Text style={[styles.chapterChords, { color: palette.textPrimary }]}>
                {prog.chords.map(formatChord).join("  \u2192  ")}
              </Text>
            )}

            {isExpanded && prog && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.chapterExpanded}>
                {prog.chords.map((chord, ci) => {
                  const roles: Record<string, string> = {
                    setup: "establishes the mood",
                    rising: "builds tension",
                    climax: "reaches the peak",
                    resolution: "brings it home",
                    color: "adds emotional shade",
                  };

                  return (
                    <View
                      key={ci}
                      style={[
                        styles.expandedChord,
                        { backgroundColor: palette.deepNavy },
                      ]}
                    >
                      <View style={styles.expandedChordHeader}>
                        <Text
                          style={[
                            styles.expandedChordName,
                            { color: palette.textPrimary },
                          ]}
                        >
                          {formatChord(chord)}
                        </Text>
                        <Text
                          style={[
                            styles.expandedChordFunc,
                            { color: palette.textMuted },
                          ]}
                        >
                          {chord.function}
                        </Text>
                      </View>
                      <View style={styles.expandedTensionRow}>
                        <View
                          style={[
                            styles.expandedTensionTrack,
                            { backgroundColor: palette.slateLight + "44" },
                          ]}
                        >
                          <View
                            style={[
                              styles.expandedTensionFill,
                              {
                                width: `${(chord.tensionLevel / 10) * 100}%`,
                                backgroundColor:
                                  chord.tensionLevel > 6
                                    ? "#EF4444"
                                    : chord.tensionLevel > 3
                                    ? palette.amber
                                    : "#10B981",
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.expandedTensionText,
                            { color: palette.textMuted },
                          ]}
                        >
                          T:{chord.tensionLevel}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.expandedChordRole,
                          { color: palette.textSecondary },
                        ]}
                      >
                        {roles[chord.narrativeRole]}
                      </Text>
                    </View>
                  );
                })}
              </Animated.View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
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
    fontSize: 26,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "SpaceMono_400Regular",
  },
  modeToggle: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 14,
    fontFamily: "SpaceMono_700Bold",
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "SpaceMono_700Bold",
    flex: 1,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
  },
  countBadge: {
    fontSize: 12,
    fontFamily: "JetBrainsMono_700Bold",
  },
  templateList: {
    gap: 10,
  },
  templateCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  templateName: {
    fontSize: 15,
    fontFamily: "SpaceMono_700Bold",
  },
  templateDesc: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
  },
  templateEmotions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    paddingTop: 4,
  },
  templateEmoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  templateEmoLine: {
    height: 2,
    flex: 1,
  },
  templateEmotionLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  templateEmoLabel: {
    fontSize: 9,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sequenceList: {
    gap: 6,
  },
  sequenceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  sequenceIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sequenceIndexText: {
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
  },
  sequenceLabel: {
    fontSize: 13,
    fontFamily: "SpaceMono_700Bold",
    flex: 1,
  },
  sequenceActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  emotionPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 4,
  },
  emotionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  emotionChipText: {
    fontSize: 11,
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
    gap: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  timeline: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timelineTitle: {
    fontSize: 12,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timelineGraph: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 80,
    gap: 4,
  },
  timelineBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  timelineBarFill: {
    width: "80%",
    minHeight: 8,
  },
  timelineBarLabel: {
    fontSize: 8,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
  },
  chapterCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  chapterHeader: {
    flexDirection: "row",
    gap: 12,
  },
  chapterIndexCol: {
    alignItems: "center",
    width: 16,
  },
  chapterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chapterLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  chapterContent: {
    flex: 1,
    gap: 6,
  },
  chapterTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterTitle: {
    fontSize: 15,
    fontFamily: "SpaceMono_700Bold",
    flex: 1,
  },
  chapterBadges: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  emotionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  emotionBadgeText: {
    fontSize: 10,
    fontFamily: "SpaceMono_700Bold",
  },
  chapterNarrative: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
  },
  chapterChords: {
    fontSize: 15,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -0.3,
    paddingTop: 2,
  },
  chapterExpanded: {
    gap: 8,
    paddingTop: 8,
  },
  expandedChord: {
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  expandedChordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedChordName: {
    fontSize: 16,
    fontFamily: "JetBrainsMono_700Bold",
  },
  expandedChordFunc: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
  },
  expandedTensionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  expandedTensionTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  expandedTensionFill: {
    height: "100%",
    borderRadius: 2,
  },
  expandedTensionText: {
    fontSize: 10,
    fontFamily: "SpaceMono_700Bold",
  },
  expandedChordRole: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
    fontStyle: "italic",
  },
});
