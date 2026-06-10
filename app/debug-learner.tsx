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
import Colors from "@/constants/colors";
import { useChatStore } from "@/lib/chat-store";
import { summarizeLearnerModel } from "@/lib/learner-model";

export default function DebugLearnerScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = Colors;
  const { learnerModel } = useChatStore();
  const [showRaw, setShowRaw] = React.useState(false);

  const bottomInset = insets.bottom + (Platform.OS === "web" ? 20 : 12);
  const summary = summarizeLearnerModel(learnerModel);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.midnight }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
    >
      <Text style={[styles.note, { color: palette.textMuted }]}>
        Developer view. This is the on-device learner model that personalizes
        Claude's responses. Nothing here leaves your device except the compact
        summary sent with each chat request.
      </Text>

      <Text style={[styles.sectionLabel, { color: palette.amber }]}>
        SUMMARY SENT TO CLAUDE
      </Text>
      <View style={[styles.block, { backgroundColor: palette.slate, borderColor: palette.cardBorder }]}>
        <Text style={[styles.mono, { color: palette.textSecondary }]}>{summary}</Text>
      </View>

      <Pressable
        onPress={() => setShowRaw((v) => !v)}
        style={[styles.toggle, { borderColor: palette.cardBorder }]}
      >
        <Feather name={showRaw ? "chevron-down" : "chevron-right"} size={14} color={palette.amber} />
        <Text style={[styles.toggleText, { color: palette.textPrimary }]}>
          Raw model JSON (schema v{learnerModel.schemaVersion})
        </Text>
      </Pressable>

      {showRaw && (
        <View style={[styles.block, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
          <Text style={[styles.mono, { color: palette.textSecondary }]}>
            {JSON.stringify(learnerModel, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  note: { fontSize: 12, fontFamily: "SpaceMono_400Regular", lineHeight: 18 },
  sectionLabel: { fontSize: 11, fontFamily: "SpaceMono_700Bold", letterSpacing: 1, marginTop: 4 },
  block: { borderRadius: 12, borderWidth: 1, padding: 14 },
  mono: { fontSize: 12, fontFamily: "SpaceMono_400Regular", lineHeight: 19 },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  toggleText: { fontSize: 13, fontFamily: "SpaceMono_700Bold" },
});
