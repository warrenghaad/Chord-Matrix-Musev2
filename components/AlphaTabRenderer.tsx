import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ChordVoice, formatChord } from "@/lib/music-engine";
import { getChordVoicing } from "@/lib/chord-voicings";
import FretboardDiagram from "@/components/FretboardDiagram";

const ALPHATAB_VERSION = "1.8.2";
const ALPHATAB_BASE = `https://cdn.jsdelivr.net/npm/@coderline/alphatab@${ALPHATAB_VERSION}/dist`;

let alphaTabLoadPromise: Promise<any> | null = null;

function loadAlphaTab(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.alphaTab) return Promise.resolve(w.alphaTab);
  if (alphaTabLoadPromise) return alphaTabLoadPromise;

  alphaTabLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-alphatab="${ALPHATAB_VERSION}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).alphaTab));
      existing.addEventListener("error", () => reject(new Error("alphaTab failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = `${ALPHATAB_BASE}/alphaTab.min.js`;
    script.async = true;
    script.dataset.alphatab = ALPHATAB_VERSION;
    script.onload = () => resolve((window as any).alphaTab);
    script.onerror = () => reject(new Error("alphaTab failed to load"));
    document.head.appendChild(script);
  });
  return alphaTabLoadPromise;
}

interface AlphaTabRendererProps {
  chords: ChordVoice[];
  title?: string;
  keyName?: string;
  tempo?: number;
}

function buildAlphaTex(chords: ChordVoice[], title: string, tempo: number): string {
  const beats = chords
    .map((chord) => {
      const name = formatChord(chord);
      const voicing = getChordVoicing(chord.root, chord.quality, chord.extension);
      let noteGroup: string;
      if (voicing) {
        const parts: string[] = [];
        for (let i = 0; i < 6; i++) {
          const fret = voicing.frets[i];
          const stringNumber = 6 - i;
          if (fret === -1 || fret === undefined) {
            parts.push(`x.${stringNumber}`);
          } else {
            parts.push(`${fret}.${stringNumber}`);
          }
        }
        noteGroup = `(${parts.join(" ")})`;
      } else {
        noteGroup = "r";
      }
      const safeName = name.replace(/"/g, "'");
      return `${noteGroup} {ch "${safeName}"}`;
    })
    .join(" | ");

  const safeTitle = title.replace(/"/g, "'");
  return `\\title "${safeTitle}"
\\tempo ${tempo}
.
\\track "Guitar"
\\tuning E4 B3 G3 D3 A2 E2
\\instrument 25
:1 ${beats} |`;
}

function AlphaTabWeb({ chords, title = "Progression", keyName, tempo = 100 }: AlphaTabRendererProps) {
  const { palette } = Colors;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const tex = useMemo(
    () => buildAlphaTex(chords, keyName ? `${title} — ${keyName}` : title, tempo),
    [chords, title, keyName, tempo]
  );

  useEffect(() => {
    let cancelled = false;
    let api: any = null;

    (async () => {
      try {
        const at = await loadAlphaTab();
        if (cancelled || !containerRef.current) return;

        const settings: any = {
          core: {
            fontDirectory: `${ALPHATAB_BASE}/font/`,
          },
          display: {
            scale: 1.0,
            stretchForce: 0.85,
          },
          player: {
            enablePlayer: true,
            enableUserInteraction: true,
            soundFont: `${ALPHATAB_BASE}/soundfont/sonivox.sf2`,
          },
        };

        api = new at.AlphaTabApi(containerRef.current, settings);
        apiRef.current = api;

        api.error.on((err: any) => {
          console.warn("[alphaTab error]", err);
        });

        api.renderFinished.on(() => {
          if (!cancelled) setStatus("ready");
        });

        api.playerReady.on(() => {
          if (!cancelled) setPlayerReady(true);
        });

        api.playerStateChanged.on((args: any) => {
          if (!cancelled) setIsPlaying(args.state === 1);
        });

        api.tex(tex);
      } catch (e: any) {
        console.warn("[alphaTab init failed]", e);
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(e?.message || "failed to load notation");
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        if (apiRef.current) {
          apiRef.current.destroy();
          apiRef.current = null;
        }
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (apiRef.current && status === "ready") {
      try {
        apiRef.current.tex(tex);
      } catch (e) {
        console.warn("[alphaTab re-render failed]", e);
      }
    }
  }, [tex, status]);

  const togglePlay = () => {
    if (!apiRef.current || !playerReady) return;
    try {
      apiRef.current.playPause();
    } catch (e) {
      console.warn("[alphaTab play failed]", e);
    }
  };

  const stop = () => {
    if (!apiRef.current || !playerReady) return;
    try {
      apiRef.current.stop();
      setIsPlaying(false);
    } catch (e) {
      console.warn("[alphaTab stop failed]", e);
    }
  };

  if (status === "error") {
    return (
      <View style={[styles.container, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
        <View style={styles.errorBox}>
          <Feather name="alert-triangle" size={14} color={palette.textMuted} />
          <Text style={[styles.errorText, { color: palette.textMuted }]}>
            Notation unavailable: {errorMsg}
          </Text>
        </View>
        <View style={styles.fallbackRow}>
          {chords.map((c, i) => (
            <FretboardDiagram
              key={i}
              root={c.root}
              quality={c.quality}
              extension={c.extension}
              chordName={formatChord(c)}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <Feather name="music" size={13} color={palette.amber} />
          <Text style={[styles.toolbarLabel, { color: palette.textSecondary }]}>
            Notation & Tab
          </Text>
        </View>
        <View style={styles.toolbarRight}>
          <Pressable
            onPress={togglePlay}
            disabled={!playerReady}
            style={[
              styles.toolbarBtn,
              {
                backgroundColor: playerReady ? palette.amber + "22" : palette.slate,
                borderColor: playerReady ? palette.amber + "55" : palette.cardBorder,
                opacity: playerReady ? 1 : 0.5,
              },
            ]}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={13}
              color={playerReady ? palette.amber : palette.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={stop}
            disabled={!playerReady}
            style={[
              styles.toolbarBtn,
              {
                backgroundColor: palette.slate,
                borderColor: palette.cardBorder,
                opacity: playerReady ? 1 : 0.5,
              },
            ]}
          >
            <Feather name="square" size={13} color={palette.textMuted} />
          </Pressable>
        </View>
      </View>

      {status === "loading" && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={palette.amber} />
          <Text style={[styles.loadingText, { color: palette.textMuted }]}>
            Loading notation engine…
          </Text>
        </View>
      )}

      {React.createElement("div", {
        ref: containerRef,
        style: {
          width: "100%",
          minHeight: 180,
          background: "#0F1729",
          borderRadius: 8,
          padding: 8,
          overflow: "auto",
        },
      })}
    </View>
  );
}

function AlphaTabNative({ chords }: AlphaTabRendererProps) {
  const { palette } = Colors;
  return (
    <View style={[styles.container, { backgroundColor: palette.deepNavy, borderColor: palette.cardBorder }]}>
      <View style={styles.nativeNotice}>
        <Feather name="info" size={12} color={palette.textMuted} />
        <Text style={[styles.nativeNoticeText, { color: palette.textMuted }]}>
          Live notation available on web. Showing chord diagrams.
        </Text>
      </View>
      <View style={styles.fallbackRow}>
        {chords.map((c, i) => (
          <FretboardDiagram
            key={i}
            root={c.root}
            quality={c.quality}
            extension={c.extension}
            chordName={formatChord(c)}
          />
        ))}
      </View>
    </View>
  );
}

export default function AlphaTabRenderer(props: AlphaTabRendererProps) {
  if (Platform.OS === "web") return <AlphaTabWeb {...props} />;
  return <AlphaTabNative {...props} />;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toolbarLabel: {
    fontSize: 11,
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toolbarRight: {
    flexDirection: "row",
    gap: 6,
  },
  toolbarBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "SpaceMono_400Regular",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  errorText: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
    flex: 1,
  },
  nativeNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nativeNoticeText: {
    fontSize: 11,
    fontFamily: "SpaceMono_400Regular",
    flex: 1,
  },
  fallbackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
