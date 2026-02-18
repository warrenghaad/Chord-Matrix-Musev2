import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withDelay,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ChordVoice, formatChord } from "@/lib/music-engine";

const ROLE_COLORS: Record<string, string> = {
  setup: "#6366F1",
  rising: "#F59E0B",
  climax: "#EF4444",
  resolution: "#10B981",
  color: "#EC4899",
};

const ROLE_LABELS: Record<string, string> = {
  setup: "Setup",
  rising: "Rising",
  climax: "Climax",
  resolution: "Resolution",
  color: "Color",
};

interface ChordCardProps {
  chord: ChordVoice;
  index: number;
  isLast: boolean;
}

function ChordCardInner({ chord, index, isLast }: ChordCardProps) {
  const { palette } = Colors;
  const roleColor = ROLE_COLORS[chord.narrativeRole];
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(index * 120, withSpring(1, { damping: 12, stiffness: 100 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const tensionWidth = (chord.tensionLevel / 10) * 100;

  return (
    <View style={styles.cardWrapper}>
      <Animated.View style={[styles.card, animStyle]}>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + "22" }]}>
          <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
          <Text style={[styles.roleText, { color: roleColor }]}>
            {ROLE_LABELS[chord.narrativeRole]}
          </Text>
        </View>

        <Text style={[styles.chordName, { color: palette.textPrimary }]}>
          {formatChord(chord)}
        </Text>

        <Text style={[styles.functionLabel, { color: palette.textSecondary }]}>
          {chord.function}
        </Text>

        <View style={styles.tensionBar}>
          <View style={[styles.tensionTrack, { backgroundColor: palette.slateLight + "44" }]}>
            <View
              style={[
                styles.tensionFill,
                {
                  width: `${tensionWidth}%`,
                  backgroundColor: chord.tensionLevel > 6 ? "#EF4444" : chord.tensionLevel > 3 ? palette.amber : "#10B981",
                },
              ]}
            />
          </View>
          <Text style={[styles.tensionLabel, { color: palette.textMuted }]}>
            {chord.tensionLevel}/10
          </Text>
        </View>

        {chord.extension && (
          <View style={[styles.extensionTag, { backgroundColor: palette.amberDim }]}>
            <Text style={[styles.extensionText, { color: palette.amber }]}>
              ext: {chord.extension}
            </Text>
          </View>
        )}
      </Animated.View>

      {!isLast && (
        <View style={styles.arrowContainer}>
          <Feather name="chevron-right" size={20} color={palette.textMuted} />
        </View>
      )}
    </View>
  );
}

export default React.memo(ChordCardInner);

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.palette.cardBg,
    borderRadius: 16,
    padding: 16,
    width: 150,
    borderWidth: 1,
    borderColor: Colors.palette.cardBorder,
    gap: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleText: {
    fontSize: 10,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chordName: {
    fontSize: 28,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -0.5,
  },
  functionLabel: {
    fontSize: 13,
    fontFamily: "SpaceMono_400Regular",
  },
  tensionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tensionTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  tensionFill: {
    height: "100%",
    borderRadius: 2,
  },
  tensionLabel: {
    fontSize: 10,
    fontFamily: "SpaceMono_400Regular",
  },
  extensionTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  extensionText: {
    fontSize: 11,
    fontFamily: "JetBrainsMono_400Regular",
  },
  arrowContainer: {
    paddingHorizontal: 4,
  },
});
