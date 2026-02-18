import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { KEYS } from "@/lib/music-engine";

interface KeySelectorProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function KeySelector({ selected, onSelect }: KeySelectorProps) {
  const { palette } = Colors;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {KEYS.map((k) => {
        const isActive = k === selected;
        return (
          <Pressable
            key={k}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(k);
            }}
            style={[
              styles.keyButton,
              {
                backgroundColor: isActive ? palette.amber : palette.cardBg,
                borderColor: isActive ? palette.amber : palette.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.keyText,
                {
                  color: isActive ? palette.midnight : palette.textPrimary,
                },
              ]}
            >
              {k}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  keyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  keyText: {
    fontSize: 15,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
