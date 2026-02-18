import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import FlowChart from "@/components/FlowChart";

export default function FlowScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = Colors;
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
            Flow of Continuance
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Narration, voice, and picture in harmonic motion
          </Text>
        </View>

        <View style={[styles.introBox, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
          <View style={styles.introRow}>
            <Feather name="mic" size={16} color={palette.amber} />
            <View style={styles.introTextBlock}>
              <Text style={[styles.introLabel, { color: palette.amber }]}>Narration</Text>
              <Text style={[styles.introDesc, { color: palette.textSecondary }]}>
                The story your chords tell. Each harmonic function is a sentence in a larger narrative.
              </Text>
            </View>
          </View>
          <View style={styles.introDivider} />
          <View style={styles.introRow}>
            <Feather name="music" size={16} color="#EC4899" />
            <View style={styles.introTextBlock}>
              <Text style={[styles.introLabel, { color: "#EC4899" }]}>Voice</Text>
              <Text style={[styles.introDesc, { color: palette.textSecondary }]}>
                How each chord sounds and feels. Extensions and voicings are the timbre of the narrator.
              </Text>
            </View>
          </View>
          <View style={styles.introDivider} />
          <View style={styles.introRow}>
            <Feather name="image" size={16} color="#6366F1" />
            <View style={styles.introTextBlock}>
              <Text style={[styles.introLabel, { color: "#6366F1" }]}>Picture</Text>
              <Text style={[styles.introDesc, { color: palette.textSecondary }]}>
                The visual scene each chord paints. Tension is close-up; resolution is wide shot.
              </Text>
            </View>
          </View>
        </View>

        <FlowChart />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
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
  introBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  introRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  introTextBlock: {
    flex: 1,
    gap: 3,
  },
  introLabel: {
    fontSize: 13,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  introDesc: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 18,
  },
  introDivider: {
    height: 1,
    backgroundColor: Colors.palette.cardBorder,
  },
});
