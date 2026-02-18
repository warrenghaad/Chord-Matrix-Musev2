import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Emotion, EMOTIONS } from "@/lib/music-engine";

interface EmotionGridProps {
  selected: Emotion | null;
  onSelect: (emotion: Emotion) => void;
}

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

function EmotionItem({
  item,
  isSelected,
  onPress,
}: {
  item: (typeof EMOTIONS)[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleValue = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.92, { damping: 10 }, () => {
      scaleValue.value = withSpring(1, { damping: 8 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[styles.itemWrapper, animStyle]}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.emotionItem,
          {
            borderColor: isSelected ? item.color : Colors.palette.cardBorder,
            backgroundColor: isSelected ? item.color + "18" : Colors.palette.cardBg,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.color + "22" }]}>
          <Feather
            name={ICON_MAP[item.icon] || "circle"}
            size={18}
            color={item.color}
          />
        </View>
        <Text
          style={[
            styles.emotionLabel,
            { color: isSelected ? item.color : Colors.palette.textPrimary },
          ]}
        >
          {item.label}
        </Text>
        <Text style={[styles.emotionDesc, { color: Colors.palette.textMuted }]}>
          {item.description}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function EmotionGrid({ selected, onSelect }: EmotionGridProps) {
  return (
    <View style={styles.grid}>
      {EMOTIONS.map((item) => (
        <EmotionItem
          key={item.id}
          item={item}
          isSelected={selected === item.id}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  itemWrapper: {
    width: "48%",
  },
  emotionItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emotionLabel: {
    fontSize: 14,
    fontFamily: "SpaceMono_700Bold",
  },
  emotionDesc: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 15,
  },
});
