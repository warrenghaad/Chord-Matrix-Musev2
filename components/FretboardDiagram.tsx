import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { getChordVoicing, ChordVoicing } from "@/lib/chord-voicings";

const FRET_COUNT = 4;
const STRING_COUNT = 6;
const DIAGRAM_WIDTH = 130;
const DIAGRAM_HEIGHT = 120;
const NUT_HEIGHT = 4;
const TOP_MARGIN = 18;
const SIDE_MARGIN = 16;
const FRETBOARD_WIDTH = DIAGRAM_WIDTH - SIDE_MARGIN * 2;
const FRETBOARD_HEIGHT = DIAGRAM_HEIGHT - TOP_MARGIN;
const STRING_SPACING = FRETBOARD_WIDTH / (STRING_COUNT - 1);
const FRET_SPACING = FRETBOARD_HEIGHT / FRET_COUNT;
const DOT_SIZE = 14;

interface FretboardDiagramProps {
  root: string;
  quality: string;
  extension: string | null;
  chordName: string;
}

export default function FretboardDiagram({
  root,
  quality,
  extension,
  chordName,
}: FretboardDiagramProps) {
  const { palette } = Colors;
  const voicing = getChordVoicing(root, quality, extension);

  if (!voicing) {
    return (
      <View style={[styles.container, { backgroundColor: palette.deepNavy }]}>
        <Text style={[styles.noDataText, { color: palette.textMuted }]}>
          No diagram
        </Text>
      </View>
    );
  }

  const showNut = voicing.startFret === 1;

  return (
    <View style={[styles.container, { backgroundColor: palette.deepNavy }]}>
      <View style={styles.diagram}>
        {voicing.frets.map((fret, i) => {
          const x = SIDE_MARGIN + i * STRING_SPACING;
          if (fret === -1) {
            return (
              <Text
                key={`top-${i}`}
                style={[
                  styles.topMarker,
                  {
                    left: x - 5,
                    top: 2,
                    color: palette.error,
                  },
                ]}
              >
                X
              </Text>
            );
          }
          if (fret === 0) {
            return (
              <View
                key={`top-${i}`}
                style={[
                  styles.openCircle,
                  {
                    left: x - 5,
                    top: 3,
                    borderColor: palette.textSecondary,
                  },
                ]}
              />
            );
          }
          return null;
        })}

        {showNut && (
          <View
            style={[
              styles.nut,
              {
                top: TOP_MARGIN,
                left: SIDE_MARGIN,
                width: FRETBOARD_WIDTH,
                backgroundColor: palette.textPrimary,
              },
            ]}
          />
        )}

        {!showNut && (
          <Text
            style={[
              styles.fretNumber,
              {
                top: TOP_MARGIN + FRET_SPACING / 2 - 7,
                left: 0,
                color: palette.textMuted,
              },
            ]}
          >
            {voicing.startFret}
          </Text>
        )}

        {Array.from({ length: STRING_COUNT }).map((_, i) => (
          <View
            key={`string-${i}`}
            style={[
              styles.string,
              {
                left: SIDE_MARGIN + i * STRING_SPACING,
                top: TOP_MARGIN,
                height: FRETBOARD_HEIGHT,
                backgroundColor: i < 3 ? palette.textMuted : palette.slateLight,
              },
            ]}
          />
        ))}

        {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
          <View
            key={`fret-${i}`}
            style={[
              styles.fretWire,
              {
                top: TOP_MARGIN + i * FRET_SPACING,
                left: SIDE_MARGIN,
                width: FRETBOARD_WIDTH,
                backgroundColor: i === 0 ? "transparent" : palette.slateLight,
              },
            ]}
          />
        ))}

        {voicing.barFret !== undefined &&
          voicing.barString && (() => {
            const barRelFret = voicing.barFret - voicing.startFret + 1;
            const y = TOP_MARGIN + (barRelFret - 0.5) * FRET_SPACING;
            const x1 = SIDE_MARGIN + voicing.barString[0] * STRING_SPACING;
            const x2 = SIDE_MARGIN + voicing.barString[1] * STRING_SPACING;
            return (
              <View
                key="barre"
                style={[
                  styles.barre,
                  {
                    left: x1 - DOT_SIZE / 2,
                    top: y - DOT_SIZE / 2 + 1,
                    width: x2 - x1 + DOT_SIZE,
                    height: DOT_SIZE,
                    backgroundColor: palette.amber,
                  },
                ]}
              />
            );
          })()}

        {voicing.frets.map((fret, i) => {
          if (fret <= 0) return null;
          const relFret = fret - voicing.startFret + 1;
          const x = SIDE_MARGIN + i * STRING_SPACING;
          const y = TOP_MARGIN + (relFret - 0.5) * FRET_SPACING;

          const isBarre =
            voicing.barFret !== undefined &&
            voicing.barString &&
            fret === voicing.barFret &&
            i >= voicing.barString[0] &&
            i <= voicing.barString[1];

          if (isBarre) return null;

          return (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  left: x - DOT_SIZE / 2,
                  top: y - DOT_SIZE / 2 + 1,
                  backgroundColor: palette.amber,
                },
              ]}
            >
              <Text style={[styles.fingerText, { color: palette.midnight }]}>
                {voicing.fingers[i] > 0 ? voicing.fingers[i] : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
    paddingVertical: 20,
  },
  diagram: {
    width: DIAGRAM_WIDTH,
    height: DIAGRAM_HEIGHT + TOP_MARGIN,
    position: "relative",
  },
  topMarker: {
    position: "absolute",
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
    width: 12,
    textAlign: "center",
  },
  openCircle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  nut: {
    position: "absolute",
    height: NUT_HEIGHT,
    borderRadius: 1,
  },
  fretNumber: {
    position: "absolute",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    width: 14,
    textAlign: "center",
  },
  string: {
    position: "absolute",
    width: 1.5,
  },
  fretWire: {
    position: "absolute",
    height: 1,
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  fingerText: {
    fontSize: 9,
    fontFamily: "JetBrainsMono_700Bold",
  },
  barre: {
    position: "absolute",
    borderRadius: DOT_SIZE / 2,
  },
});
