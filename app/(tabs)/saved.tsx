import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { Progression } from "@/lib/music-engine";
import SavedProgressions from "@/components/SavedProgressions";

const STORAGE_KEY = "@chordflow_saved";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = Colors;
  const [saved, setSaved] = useState<Progression[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const loadSaved = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setSaved(JSON.parse(data));
      } else {
        setSaved([]);
      }
    } catch (e) {
      console.error("Load failed:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  }, [loadSaved]);

  const handleRemove = useCallback(
    async (id: string) => {
      const updated = saved.filter((p) => p.id !== id);
      setSaved(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [saved]
  );

  const handleLoad = useCallback((progression: Progression) => {
  }, []);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.amber}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            Saved
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Your favorite progressions
          </Text>
        </View>

        <SavedProgressions
          progressions={saved}
          onRemove={handleRemove}
          onLoad={handleLoad}
        />
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
});
