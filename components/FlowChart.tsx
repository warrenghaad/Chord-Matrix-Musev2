import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { FLOW_CHART_NODES, CONTINUANCE_ARCS, FlowNode } from "@/lib/music-engine";

const ROLE_COLORS: Record<string, string> = {
  tonic: "#10B981",
  subdominant: "#F59E0B",
  dominant: "#EF4444",
  chromatic: "#8B5CF6",
  passing: "#64748B",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function FlowNodeCard({
  node,
  isSelected,
  onPress,
  index,
}: {
  node: FlowNode;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const roleColor = ROLE_COLORS[node.role];
  const { palette } = Colors;

  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(300)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={[
          styles.nodeCard,
          {
            borderColor: isSelected ? roleColor : palette.cardBorder,
            backgroundColor: isSelected ? roleColor + "12" : palette.cardBg,
          },
        ]}
      >
        <View style={styles.nodeHeader}>
          <View style={[styles.nodeRoleDot, { backgroundColor: roleColor }]} />
          <Text style={[styles.nodeLabel, { color: palette.textPrimary }]}>
            {node.label}
          </Text>
          <View style={[styles.tensionPill, { backgroundColor: palette.slateLight + "44" }]}>
            <Text style={[styles.tensionPillText, { color: palette.textMuted }]}>
              T:{node.tensionLevel}
            </Text>
          </View>
        </View>
        <Text style={[styles.nodeDesc, { color: palette.textSecondary }]}>
          {node.description}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function NodeDetail({ node }: { node: FlowNode }) {
  const roleColor = ROLE_COLORS[node.role];
  const { palette } = Colors;
  const connectedNodes = FLOW_CHART_NODES.filter((n) =>
    node.connections.includes(n.id)
  );

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={[styles.detailContainer, { borderColor: roleColor + "33" }]}
    >
      <View style={[styles.detailSection]}>
        <View style={styles.detailIconRow}>
          <Feather name="mic" size={14} color={palette.amber} />
          <Text style={[styles.detailSectionTitle, { color: palette.amber }]}>
            Narration
          </Text>
        </View>
        <Text style={[styles.detailText, { color: palette.textSecondary }]}>
          {node.narrativeFunction}
        </Text>
      </View>

      <View style={styles.detailDivider} />

      <View style={styles.detailSection}>
        <View style={styles.detailIconRow}>
          <Feather name="music" size={14} color="#EC4899" />
          <Text style={[styles.detailSectionTitle, { color: "#EC4899" }]}>
            Voice Character
          </Text>
        </View>
        <Text style={[styles.detailText, { color: palette.textSecondary }]}>
          {node.voiceCharacter}
        </Text>
      </View>

      <View style={styles.detailDivider} />

      <View style={styles.detailSection}>
        <View style={styles.detailIconRow}>
          <Feather name="git-branch" size={14} color="#6366F1" />
          <Text style={[styles.detailSectionTitle, { color: "#6366F1" }]}>
            Flows To
          </Text>
        </View>
        <View style={styles.connectionsList}>
          {connectedNodes.map((cn) => (
            <View
              key={cn.id}
              style={[
                styles.connectionChip,
                { backgroundColor: ROLE_COLORS[cn.role] + "18" },
              ]}
            >
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: ROLE_COLORS[cn.role] },
                ]}
              />
              <Text
                style={[
                  styles.connectionText,
                  { color: ROLE_COLORS[cn.role] },
                ]}
              >
                {cn.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function ArcCard({
  arc,
  index,
}: {
  arc: (typeof CONTINUANCE_ARCS)[0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { palette } = Colors;

  const pathNodes = arc.path.map(
    (id) => FLOW_CHART_NODES.find((n) => n.id === id)!
  );

  return (
    <Animated.View entering={FadeIn.delay(index * 100).duration(300)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
        style={[styles.arcCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
      >
        <View style={styles.arcHeader}>
          <Text style={[styles.arcName, { color: palette.textPrimary }]}>
            {arc.name}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={palette.textMuted}
          />
        </View>
        <Text style={[styles.arcDesc, { color: palette.textSecondary }]}>
          {arc.description}
        </Text>

        <View style={styles.arcPath}>
          {pathNodes.map((node, i) => (
            <React.Fragment key={i}>
              <View
                style={[
                  styles.arcPathNode,
                  { backgroundColor: ROLE_COLORS[node.role] + "22" },
                ]}
              >
                <View
                  style={[
                    styles.arcPathDot,
                    { backgroundColor: ROLE_COLORS[node.role] },
                  ]}
                />
                <Text
                  style={[
                    styles.arcPathLabel,
                    { color: ROLE_COLORS[node.role] },
                  ]}
                >
                  {node.label.split(" ")[0]}
                </Text>
              </View>
              {i < pathNodes.length - 1 && (
                <Feather
                  name="arrow-right"
                  size={12}
                  color={palette.textMuted}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {expanded && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.arcExpanded}>
            <View style={styles.arcExpandedSection}>
              <View style={styles.detailIconRow}>
                <Feather name="mic" size={13} color={palette.amber} />
                <Text style={[styles.arcExpandedTitle, { color: palette.amber }]}>
                  Voice
                </Text>
              </View>
              <Text style={[styles.arcExpandedText, { color: palette.textSecondary }]}>
                {arc.voiceNotes}
              </Text>
            </View>
            <View style={styles.arcExpandedSection}>
              <View style={styles.detailIconRow}>
                <Feather name="image" size={13} color="#EC4899" />
                <Text style={[styles.arcExpandedTitle, { color: "#EC4899" }]}>
                  Picture
                </Text>
              </View>
              <Text style={[styles.arcExpandedText, { color: palette.textSecondary }]}>
                {arc.pictureNotes}
              </Text>
            </View>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function FlowChart() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { palette } = Colors;

  const selected = FLOW_CHART_NODES.find((n) => n.id === selectedNode);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Feather name="git-merge" size={18} color={palette.amber} />
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Chord Functions
        </Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: palette.textMuted }]}>
        Tap any function to see its narrative role, voice character, and connections
      </Text>

      <View style={styles.legendRow}>
        {(["tonic", "subdominant", "dominant", "chromatic"] as const).map((role) => (
          <View key={role} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ROLE_COLORS[role] }]} />
            <Text style={[styles.legendLabel, { color: palette.textMuted }]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.nodesGrid}>
        {FLOW_CHART_NODES.map((node, i) => (
          <FlowNodeCard
            key={node.id}
            node={node}
            index={i}
            isSelected={selectedNode === node.id}
            onPress={() =>
              setSelectedNode(selectedNode === node.id ? null : node.id)
            }
          />
        ))}
      </View>

      {selected && <NodeDetail node={selected} />}

      <View style={[styles.sectionHeader, { marginTop: 32 }]}>
        <Feather name="trending-up" size={18} color={palette.amber} />
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Arcs of Continuance
        </Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: palette.textMuted }]}>
        How chords flow to create narrative, voice, and visual stories
      </Text>

      <View style={styles.arcsList}>
        {CONTINUANCE_ARCS.map((arc, i) => (
          <ArcCard key={arc.name} arc={arc} index={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "SpaceMono_700Bold",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
  },
  nodesGrid: {
    gap: 8,
  },
  nodeCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  nodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nodeRoleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeLabel: {
    fontSize: 15,
    fontFamily: "JetBrainsMono_700Bold",
    flex: 1,
  },
  tensionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tensionPillText: {
    fontSize: 10,
    fontFamily: "SpaceMono_700Bold",
  },
  nodeDesc: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
    marginLeft: 18,
  },
  detailContainer: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.palette.deepNavy,
    borderWidth: 1,
    gap: 14,
  },
  detailSection: {
    gap: 6,
  },
  detailIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 19,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.palette.cardBorder,
  },
  connectionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  connectionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectionText: {
    fontSize: 11,
    fontFamily: "SpaceMono_700Bold",
  },
  arcsList: {
    gap: 10,
  },
  arcCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  arcHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arcName: {
    fontSize: 15,
    fontFamily: "SpaceMono_700Bold",
  },
  arcDesc: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 17,
  },
  arcPath: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  arcPathNode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  arcPathDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  arcPathLabel: {
    fontSize: 11,
    fontFamily: "SpaceMono_700Bold",
  },
  arcExpanded: {
    gap: 12,
    paddingTop: 4,
  },
  arcExpandedSection: {
    gap: 4,
  },
  arcExpandedTitle: {
    fontSize: 11,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arcExpandedText: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
    lineHeight: 18,
  },
});
