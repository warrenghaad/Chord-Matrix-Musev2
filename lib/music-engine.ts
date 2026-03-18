export type Emotion =
  | "melancholic"
  | "triumphant"
  | "mysterious"
  | "dreamy"
  | "aggressive"
  | "tender"
  | "nostalgic"
  | "dark"
  | "euphoric"
  | "contemplative";

export type ChordQuality =
  | "maj"
  | "min"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "dom";

export type Extension =
  | "7"
  | "maj7"
  | "min7"
  | "9"
  | "maj9"
  | "min9"
  | "11"
  | "13"
  | "add9"
  | "6"
  | "min6"
  | "7b5"
  | "7#5"
  | "7b9"
  | "7#9"
  | "7#11"
  | "dim7"
  | "m7b5"
  | "alt"
  | "sus"
  | "6/9";

export interface ChordVoice {
  root: string;
  quality: ChordQuality;
  extension: Extension | null;
  function: string;
  tensionLevel: number;
  narrativeRole: "setup" | "rising" | "climax" | "resolution" | "color";
}

export interface Progression {
  id: string;
  emotion: Emotion;
  key: string;
  chords: ChordVoice[];
  timestamp: number;
  saved: boolean;
}

export interface FlowNode {
  id: string;
  label: string;
  role: "tonic" | "subdominant" | "dominant" | "chromatic" | "passing";
  description: string;
  narrativeFunction: string;
  voiceCharacter: string;
  connections: string[];
  tensionLevel: number;
}

export const KEYS = [
  "C", "Db", "D", "Eb", "E", "F",
  "F#", "G", "Ab", "A", "Bb", "B",
];

export const EMOTIONS: { id: Emotion; label: string; icon: string; color: string; description: string }[] = [
  { id: "melancholic", label: "Melancholic", icon: "water", color: "#6366F1", description: "Bittersweet longing" },
  { id: "triumphant", label: "Triumphant", icon: "flag", color: "#F59E0B", description: "Victory and power" },
  { id: "mysterious", label: "Mysterious", icon: "eye", color: "#8B5CF6", description: "Uncertain and questioning" },
  { id: "dreamy", label: "Dreamy", icon: "cloud", color: "#EC4899", description: "Floating and ethereal" },
  { id: "aggressive", label: "Aggressive", icon: "zap", color: "#EF4444", description: "Raw energy" },
  { id: "tender", label: "Tender", icon: "heart", color: "#F472B6", description: "Gentle intimacy" },
  { id: "nostalgic", label: "Nostalgic", icon: "sunset", color: "#FB923C", description: "Warm memories" },
  { id: "dark", label: "Dark", icon: "moon", color: "#475569", description: "Ominous weight" },
  { id: "euphoric", label: "Euphoric", icon: "sun", color: "#10B981", description: "Pure elation" },
  { id: "contemplative", label: "Contemplative", icon: "coffee", color: "#0EA5E9", description: "Thoughtful depth" },
];

const SCALE_DEGREES: Record<string, string[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
};

interface ProgressionTemplate {
  degrees: number[];
  qualities: ChordQuality[];
  functions: string[];
  narrativeRoles: ChordVoice["narrativeRole"][];
  tensions: number[];
}

const EMOTION_PROGRESSIONS: Record<Emotion, ProgressionTemplate[]> = {
  melancholic: [
    { degrees: [1, 6, 4, 5], qualities: ["min", "maj", "maj", "min"], functions: ["i", "VI", "IV", "v"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [2, 4, 6, 3] },
    { degrees: [1, 3, 6, 4], qualities: ["min", "maj", "maj", "maj"], functions: ["i", "III", "VI", "IV"], narrativeRoles: ["setup", "color", "rising", "resolution"], tensions: [2, 3, 5, 4] },
    { degrees: [6, 4, 1, 5], qualities: ["min", "maj", "maj", "dom"], functions: ["vi", "IV", "I", "V"], narrativeRoles: ["setup", "rising", "resolution", "color"], tensions: [4, 5, 2, 6] },
    { degrees: [1, 7, 6, 5], qualities: ["min", "maj", "maj", "dom"], functions: ["i", "bVII", "VI", "V"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [2, 5, 4, 7] },
  ],
  triumphant: [
    { degrees: [1, 5, 6, 4], qualities: ["maj", "maj", "min", "maj"], functions: ["I", "V", "vi", "IV"], narrativeRoles: ["setup", "rising", "color", "resolution"], tensions: [1, 5, 3, 2] },
    { degrees: [1, 4, 5, 1], qualities: ["maj", "maj", "dom", "maj"], functions: ["I", "IV", "V", "I"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [1, 4, 7, 1] },
    { degrees: [4, 5, 1, 1], qualities: ["maj", "dom", "maj", "maj"], functions: ["IV", "V", "I", "I"], narrativeRoles: ["setup", "climax", "resolution", "resolution"], tensions: [4, 8, 1, 1] },
    { degrees: [1, 3, 4, 5], qualities: ["maj", "maj", "maj", "dom"], functions: ["I", "III", "IV", "V"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [1, 5, 4, 7] },
  ],
  mysterious: [
    { degrees: [1, 2, 4, 7], qualities: ["min", "dim", "min", "maj"], functions: ["i", "ii°", "iv", "bVII"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [3, 7, 5, 6] },
    { degrees: [1, 7, 6, 7], qualities: ["min", "maj", "maj", "dom"], functions: ["i", "bVII", "bVI", "bVII"], narrativeRoles: ["setup", "rising", "color", "climax"], tensions: [3, 5, 4, 6] },
    { degrees: [1, 5, 2, 4], qualities: ["min", "dom", "dim", "min"], functions: ["i", "V", "ii°", "iv"], narrativeRoles: ["setup", "climax", "color", "resolution"], tensions: [3, 8, 7, 5] },
    { degrees: [1, 4, 7, 3], qualities: ["sus4", "min", "maj", "maj"], functions: ["isus", "iv", "bVII", "III"], narrativeRoles: ["setup", "rising", "color", "resolution"], tensions: [4, 5, 5, 3] },
  ],
  dreamy: [
    { degrees: [1, 3, 5, 4], qualities: ["maj", "min", "min", "maj"], functions: ["I", "iii", "v", "IV"], narrativeRoles: ["setup", "color", "rising", "resolution"], tensions: [1, 3, 4, 2] },
    { degrees: [1, 6, 2, 5], qualities: ["maj", "min", "min", "maj"], functions: ["I", "vi", "ii", "V"], narrativeRoles: ["setup", "rising", "color", "resolution"], tensions: [1, 3, 4, 3] },
    { degrees: [4, 1, 5, 6], qualities: ["maj", "maj", "maj", "min"], functions: ["IV", "I", "V", "vi"], narrativeRoles: ["color", "setup", "rising", "resolution"], tensions: [2, 1, 3, 3] },
    { degrees: [2, 4, 6, 1], qualities: ["min", "maj", "min", "maj"], functions: ["ii", "IV", "vi", "I"], narrativeRoles: ["setup", "rising", "color", "resolution"], tensions: [3, 2, 3, 1] },
  ],
  aggressive: [
    { degrees: [1, 5, 7, 4], qualities: ["min", "dom", "maj", "min"], functions: ["i", "V", "bVII", "iv"], narrativeRoles: ["setup", "climax", "rising", "resolution"], tensions: [5, 9, 7, 6] },
    { degrees: [1, 7, 1, 5], qualities: ["dom", "dom", "dom", "dom"], functions: ["I7", "bVII7", "I7", "V7"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [6, 7, 8, 9] },
    { degrees: [1, 2, 7, 1], qualities: ["min", "min", "dom", "min"], functions: ["i", "ii", "bVII", "i"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [5, 6, 8, 5] },
    { degrees: [1, 4, 7, 5], qualities: ["min", "min", "maj", "dom"], functions: ["i", "iv", "bVII", "V"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [5, 6, 7, 9] },
  ],
  tender: [
    { degrees: [1, 3, 4, 1], qualities: ["maj", "min", "maj", "maj"], functions: ["I", "iii", "IV", "I"], narrativeRoles: ["setup", "color", "rising", "resolution"], tensions: [1, 2, 2, 1] },
    { degrees: [1, 6, 4, 5], qualities: ["maj", "min", "maj", "maj"], functions: ["I", "vi", "IV", "V"], narrativeRoles: ["setup", "rising", "color", "resolution"], tensions: [1, 3, 2, 3] },
    { degrees: [2, 5, 1, 6], qualities: ["min", "dom", "maj", "min"], functions: ["ii", "V", "I", "vi"], narrativeRoles: ["setup", "rising", "resolution", "color"], tensions: [2, 4, 1, 2] },
    { degrees: [1, 4, 6, 5], qualities: ["maj", "maj", "min", "maj"], functions: ["I", "IV", "vi", "V"], narrativeRoles: ["setup", "rising", "color", "resolution"], tensions: [1, 2, 3, 3] },
  ],
  nostalgic: [
    { degrees: [1, 5, 6, 4], qualities: ["maj", "maj", "min", "maj"], functions: ["I", "V", "vi", "IV"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [1, 4, 5, 3] },
    { degrees: [1, 4, 1, 5], qualities: ["maj", "maj", "maj", "dom"], functions: ["I", "IV", "I", "V"], narrativeRoles: ["setup", "color", "resolution", "rising"], tensions: [1, 3, 1, 5] },
    { degrees: [6, 4, 1, 5], qualities: ["min", "maj", "maj", "maj"], functions: ["vi", "IV", "I", "V"], narrativeRoles: ["setup", "rising", "resolution", "color"], tensions: [3, 3, 1, 4] },
    { degrees: [1, 6, 2, 5], qualities: ["maj", "min", "min", "dom"], functions: ["I", "vi", "ii", "V"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [1, 3, 4, 6] },
  ],
  dark: [
    { degrees: [1, 2, 5, 1], qualities: ["min", "dim", "dom", "min"], functions: ["i", "ii°", "V", "i"], narrativeRoles: ["setup", "color", "climax", "resolution"], tensions: [5, 8, 9, 5] },
    { degrees: [1, 6, 7, 1], qualities: ["min", "maj", "dim", "min"], functions: ["i", "bVI", "vii°", "i"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [5, 6, 9, 5] },
    { degrees: [1, 4, 6, 5], qualities: ["min", "min", "maj", "dom"], functions: ["i", "iv", "bVI", "V"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [5, 6, 6, 9] },
    { degrees: [1, 7, 6, 5], qualities: ["min", "maj", "maj", "dom"], functions: ["i", "bVII", "bVI", "V"], narrativeRoles: ["setup", "rising", "color", "climax"], tensions: [5, 6, 6, 9] },
  ],
  euphoric: [
    { degrees: [1, 5, 6, 4], qualities: ["maj", "maj", "min", "maj"], functions: ["I", "V", "vi", "IV"], narrativeRoles: ["setup", "climax", "color", "resolution"], tensions: [1, 5, 3, 2] },
    { degrees: [1, 4, 5, 4], qualities: ["maj", "maj", "dom", "maj"], functions: ["I", "IV", "V", "IV"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [1, 3, 6, 2] },
    { degrees: [4, 5, 6, 1], qualities: ["maj", "dom", "min", "maj"], functions: ["IV", "V", "vi", "I"], narrativeRoles: ["setup", "climax", "color", "resolution"], tensions: [3, 6, 3, 1] },
    { degrees: [1, 3, 4, 5], qualities: ["maj", "maj", "maj", "dom"], functions: ["I", "III", "IV", "V"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [1, 4, 3, 6] },
  ],
  contemplative: [
    { degrees: [2, 5, 1, 6], qualities: ["min", "dom", "maj", "min"], functions: ["ii", "V", "I", "vi"], narrativeRoles: ["setup", "rising", "resolution", "color"], tensions: [3, 5, 1, 3] },
    { degrees: [1, 4, 2, 5], qualities: ["maj", "maj", "min", "dom"], functions: ["I", "IV", "ii", "V"], narrativeRoles: ["setup", "color", "rising", "climax"], tensions: [1, 3, 4, 5] },
    { degrees: [1, 6, 3, 4], qualities: ["maj", "min", "min", "maj"], functions: ["I", "vi", "iii", "IV"], narrativeRoles: ["setup", "color", "rising", "resolution"], tensions: [1, 3, 3, 2] },
    { degrees: [6, 2, 5, 1], qualities: ["min", "min", "dom", "maj"], functions: ["vi", "ii", "V", "I"], narrativeRoles: ["setup", "rising", "climax", "resolution"], tensions: [3, 4, 6, 1] },
  ],
};

export interface ExtensionMeta {
  extension: Extension;
  emotionalPlace: string;
  resolutionGuidance: string;
  tensionModifier: number;
  narrativeEffect: string;
  colorFamily: "warm" | "cool" | "dark" | "bright" | "neutral";
}

export const EXTENSION_META: Record<Extension, ExtensionMeta> = {
  "7": {
    extension: "7",
    emotionalPlace: "Dominant pull. The question that demands an answer.",
    resolutionGuidance: "Resolve down a fifth to the tonic, or deceptively to vi. The b7 wants to fall to the 3rd of the target.",
    tensionModifier: 2,
    narrativeEffect: "Creates forward momentum. The story can't stay here.",
    colorFamily: "warm",
  },
  "maj7": {
    extension: "maj7",
    emotionalPlace: "Luminous stillness. Beauty without urgency.",
    resolutionGuidance: "Can sustain without resolving. If moving, step to IV or drift to vi for gentle motion. The maj7 floats.",
    tensionModifier: 0,
    narrativeEffect: "The narrator pauses to describe the light in the room.",
    colorFamily: "bright",
  },
  "min7": {
    extension: "min7",
    emotionalPlace: "Gentle sorrow. Reflective depth without despair.",
    resolutionGuidance: "Move to a dominant chord (V7) or step down to bVI. The minor 7th softens any arrival.",
    tensionModifier: 1,
    narrativeEffect: "The character looks inward. Memory surfaces.",
    colorFamily: "cool",
  },
  "9": {
    extension: "9",
    emotionalPlace: "Open space. The horizon widens.",
    resolutionGuidance: "Resolve like a 7th chord but with more color. The 9th adds air — let it breathe before moving.",
    tensionModifier: 2,
    narrativeEffect: "The picture pulls back. We see more of the world.",
    colorFamily: "warm",
  },
  "maj9": {
    extension: "maj9",
    emotionalPlace: "Dreaming with eyes open. Crystalline and suspended.",
    resolutionGuidance: "Float to another maj9 or step gently to IV. Avoid harsh resolution — this chord is its own destination.",
    tensionModifier: 0,
    narrativeEffect: "Time slows. Every detail becomes vivid.",
    colorFamily: "bright",
  },
  "min9": {
    extension: "min9",
    emotionalPlace: "Deep tenderness. Vulnerability held gently.",
    resolutionGuidance: "Move to IV or bVI for warmth, or to V7 for bittersweet departure. The 9th over minor is fragile — handle softly.",
    tensionModifier: 1,
    narrativeEffect: "The voice drops to a whisper. Something intimate is shared.",
    colorFamily: "cool",
  },
  "11": {
    extension: "11",
    emotionalPlace: "Suspended between worlds. Neither here nor there.",
    resolutionGuidance: "The 11th wants to fall to the 3rd — resolve inward, or sustain for ambiguity. Works as a plateau before descent.",
    tensionModifier: 2,
    narrativeEffect: "The story holds its breath. A decision hangs in the air.",
    colorFamily: "neutral",
  },
  "13": {
    extension: "13",
    emotionalPlace: "Richness and fullness. Every voice speaks at once.",
    resolutionGuidance: "Can resolve like a dominant 7th but with more ceremony. The 13th adds brightness to the arrival.",
    tensionModifier: 2,
    narrativeEffect: "The orchestra swells. All threads converge.",
    colorFamily: "warm",
  },
  "add9": {
    extension: "add9",
    emotionalPlace: "Innocence with a shimmer. Simple beauty, slight sparkle.",
    resolutionGuidance: "Resolves naturally anywhere a triad would. The 9th is decoration — it follows the root chord's gravity.",
    tensionModifier: 0,
    narrativeEffect: "Sunlight through a window. The ordinary becomes beautiful.",
    colorFamily: "bright",
  },
  "6": {
    extension: "6",
    emotionalPlace: "Warmth and nostalgia. A vintage sweetness.",
    resolutionGuidance: "Acts as a soft tonic. Can sustain as a resting point, or move to ii for a classic departure.",
    tensionModifier: 0,
    narrativeEffect: "A photograph from another time. Familiar and comforting.",
    colorFamily: "warm",
  },
  "min6": {
    extension: "min6",
    emotionalPlace: "Dorian color. Minor with an unexpected warmth.",
    resolutionGuidance: "The natural 6 over minor creates Dorian mode. Move to V7 or bVII. The warmth in the darkness wants to resolve upward.",
    tensionModifier: 1,
    narrativeEffect: "Hope found in an unexpected place. Light in shadow.",
    colorFamily: "cool",
  },
  "7b5": {
    extension: "7b5",
    emotionalPlace: "Locrian void. The ground shifts beneath you.",
    resolutionGuidance: "The tritone from the root creates maximum instability. Resolve down a half-step or up a fourth. Needs strong resolution.",
    tensionModifier: 4,
    narrativeEffect: "Reality fractures. What seemed solid is not.",
    colorFamily: "dark",
  },
  "7#5": {
    extension: "7#5",
    emotionalPlace: "Augmented tension. The world stretches beyond its frame.",
    resolutionGuidance: "Resolve up a half-step or down a fifth. The #5 pulls outward — answer it with inward motion.",
    tensionModifier: 3,
    narrativeEffect: "Something is wrong in a beautiful way. The uncanny valley.",
    colorFamily: "dark",
  },
  "7b9": {
    extension: "7b9",
    emotionalPlace: "Dark drama. The minor 9th interval is pure anguish.",
    resolutionGuidance: "Resolve strongly down a fifth to minor. This is the darkest dominant — it needs a definitive answer. Use harmonic minor resolution.",
    tensionModifier: 4,
    narrativeEffect: "The villain appears. The storm breaks. No escape.",
    colorFamily: "dark",
  },
  "7#9": {
    extension: "7#9",
    emotionalPlace: "The Hendrix chord. Blues-rock grit and defiance.",
    resolutionGuidance: "Can resolve down a fifth or sustain as a blues tonic. The clash of major and minor 3rd is the sound of resistance.",
    tensionModifier: 3,
    narrativeEffect: "The character fights back. Raw energy against the world.",
    colorFamily: "warm",
  },
  "7#11": {
    extension: "7#11",
    emotionalPlace: "Lydian dominant. Bright but otherworldly.",
    resolutionGuidance: "Resolve down a half-step for tritone substitution, or sustain for Lydian brightness. The #11 floats above reality.",
    tensionModifier: 2,
    narrativeEffect: "A door opens to somewhere impossible. Beautiful strangeness.",
    colorFamily: "bright",
  },
  "dim7": {
    extension: "dim7",
    emotionalPlace: "Symmetrical anxiety. Every note is equidistant. No home.",
    resolutionGuidance: "Resolve up or down a half-step to a major or minor chord. Any of the 4 notes can be a leading tone — choose your destination.",
    tensionModifier: 5,
    narrativeEffect: "Vertigo. The compass spins. Every direction looks the same.",
    colorFamily: "dark",
  },
  "m7b5": {
    extension: "m7b5",
    emotionalPlace: "Half-diminished. The gateway between worlds.",
    resolutionGuidance: "Resolve to V7b9 then to i for a complete minor ii-V-i. This chord is the question before the darker question.",
    tensionModifier: 3,
    narrativeEffect: "Standing at a threshold. The passage narrows ahead.",
    colorFamily: "dark",
  },
  "alt": {
    extension: "alt",
    emotionalPlace: "All tensions raised or lowered. Complete chromatic saturation.",
    resolutionGuidance: "Resolve down a fifth to major or minor. The altered scale provides maximum departure — the return must be decisive.",
    tensionModifier: 5,
    narrativeEffect: "Everything at once. Sensory overload. The climax of chaos.",
    colorFamily: "dark",
  },
  "sus": {
    extension: "sus",
    emotionalPlace: "No 3rd. Pure ambiguity. Neither major nor minor.",
    resolutionGuidance: "Resolve the 4th down to the 3rd (sus4 to major). Or sustain the suspension — let the ambiguity become the statement.",
    tensionModifier: 1,
    narrativeEffect: "The character stands at the crossroads. The choice hasn't been made.",
    colorFamily: "neutral",
  },
  "6/9": {
    extension: "6/9",
    emotionalPlace: "Complete and warm. The perfect ending chord.",
    resolutionGuidance: "This IS the resolution. A 6/9 chord needs nothing after it. Use as a final destination or a peaceful plateau.",
    tensionModifier: -1,
    narrativeEffect: "The story ends. The credits roll. Everything is where it should be.",
    colorFamily: "warm",
  },
};

export function getExtensionsForEmotion(emotion: Emotion): ExtensionMeta[] {
  const pool = EMOTION_EXTENSIONS[emotion];
  return pool.map((ext) => EXTENSION_META[ext]);
}

export function getAllExtensionMetas(): ExtensionMeta[] {
  return Object.values(EXTENSION_META);
}

const EMOTION_EXTENSIONS: Record<Emotion, Extension[]> = {
  melancholic: ["min7", "9", "add9", "min9", "6", "maj7"],
  triumphant: ["maj7", "9", "add9", "6/9", "sus", "13"],
  mysterious: ["7b5", "7#5", "dim7", "m7b5", "7b9", "7#11"],
  dreamy: ["maj9", "9", "add9", "6/9", "11", "maj7"],
  aggressive: ["7", "7#9", "7b9", "alt", "9", "sus"],
  tender: ["maj7", "add9", "6", "9", "maj9", "6/9"],
  nostalgic: ["maj7", "9", "add9", "6", "7", "13"],
  dark: ["m7b5", "dim7", "min7", "7b9", "7b5", "7#5"],
  euphoric: ["maj7", "9", "add9", "11", "sus", "6/9"],
  contemplative: ["min7", "maj7", "9", "11", "add9", "13"],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getExtensionForChord(emotion: Emotion, quality: ChordQuality): Extension | null {
  if (Math.random() < 0.15) return null;

  const pool = EMOTION_EXTENSIONS[emotion];
  const ext = pickRandom(pool);

  if (quality === "dim" && ["maj7", "9", "add9", "6/9", "maj9"].includes(ext)) {
    return "dim7";
  }
  if (quality === "aug" && ["min7", "min9"].includes(ext)) {
    return "7#5";
  }

  return ext;
}

export function formatChord(chord: ChordVoice): string {
  let name = chord.root;
  switch (chord.quality) {
    case "min": name += "m"; break;
    case "dim": name += "dim"; break;
    case "aug": name += "aug"; break;
    case "sus2": name += "sus2"; break;
    case "sus4": name += "sus4"; break;
    case "dom": break;
    case "maj": break;
  }
  if (chord.extension) {
    name += chord.extension;
  }
  return name;
}

export function generateProgression(emotion: Emotion, key: string): Progression {
  const templates = EMOTION_PROGRESSIONS[emotion];
  const template = pickRandom(templates);
  const scale = SCALE_DEGREES[key];

  const chords: ChordVoice[] = template.degrees.map((deg, i) => {
    const rootIndex = (deg - 1) % 7;
    const root = scale[rootIndex];
    const quality = template.qualities[i];
    const ext = getExtensionForChord(emotion, quality);

    return {
      root,
      quality,
      extension: ext,
      function: template.functions[i],
      tensionLevel: template.tensions[i],
      narrativeRole: template.narrativeRoles[i],
    };
  });

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    emotion,
    key,
    chords,
    timestamp: Date.now(),
    saved: false,
  };
}

export const FLOW_CHART_NODES: FlowNode[] = [
  {
    id: "tonic",
    label: "Tonic (I)",
    role: "tonic",
    description: "Home base. The center of gravity.",
    narrativeFunction: "The narrator's resting voice. The opening line, the return home.",
    voiceCharacter: "Stable, grounded. Use maj7 or add9 for warmth without tension.",
    connections: ["subdominant", "mediant", "dominant", "chromatic"],
    tensionLevel: 1,
  },
  {
    id: "supertonic",
    label: "Supertonic (ii)",
    role: "subdominant",
    description: "The gentle questioner. Pre-dominant motion.",
    narrativeFunction: "The first departure. A thought begins to form, leaning forward.",
    voiceCharacter: "Warm minor color. min7 or min9 for a reflective, searching quality.",
    connections: ["dominant", "subdominant", "tonic"],
    tensionLevel: 3,
  },
  {
    id: "mediant",
    label: "Mediant (iii)",
    role: "tonic",
    description: "The tonic's shadow. Related but distinct.",
    narrativeFunction: "A shift in perspective. Same story, different angle. The aside.",
    voiceCharacter: "Ambiguous minor. Use min7 to keep it floating, add9 for shimmer.",
    connections: ["subdominant", "submediant", "dominant"],
    tensionLevel: 2,
  },
  {
    id: "subdominant",
    label: "Subdominant (IV)",
    role: "subdominant",
    description: "The departure. Expansion away from home.",
    narrativeFunction: "The narrative opens up. New scenery. The picture widens.",
    voiceCharacter: "Bright and expansive. maj7 for beauty, add9 for nostalgia, sus for yearning.",
    connections: ["dominant", "tonic", "supertonic", "chromatic"],
    tensionLevel: 4,
  },
  {
    id: "dominant",
    label: "Dominant (V)",
    role: "dominant",
    description: "Maximum tension. The question demanding an answer.",
    narrativeFunction: "The climax. Everything builds to this moment. The voice strains.",
    voiceCharacter: "Tense, urgent. 7 for classic pull, 7b9 for dark drama, 7#9 for grit.",
    connections: ["tonic", "submediant", "chromatic"],
    tensionLevel: 8,
  },
  {
    id: "submediant",
    label: "Submediant (vi)",
    role: "tonic",
    description: "The deceptive rest. Tonic's melancholy twin.",
    narrativeFunction: "The twist. You expected home but found something bittersweet instead.",
    voiceCharacter: "Emotional minor. min7 for depth, min9 for tenderness, add9 for wistfulness.",
    connections: ["supertonic", "subdominant", "dominant", "tonic"],
    tensionLevel: 3,
  },
  {
    id: "leading",
    label: "Leading Tone (vii)",
    role: "dominant",
    description: "The edge of the cliff. Almost unbearable tension.",
    narrativeFunction: "The breaking point. The voice cracks. Resolution is demanded.",
    voiceCharacter: "Unstable, diminished. m7b5 for jazz, dim7 for classical drama.",
    connections: ["tonic", "dominant"],
    tensionLevel: 9,
  },
  {
    id: "chromatic",
    label: "Chromatic / Modal",
    role: "chromatic",
    description: "Outside the key. Borrowed colors and surprises.",
    narrativeFunction: "A flash of something unexpected. A new picture entirely. The plot twist.",
    voiceCharacter: "Exotic, altered. 7#11 for Lydian glow, alt for outside tension, b9 for darkness.",
    connections: ["tonic", "subdominant", "dominant"],
    tensionLevel: 7,
  },
];

export interface StoryChapter {
  emotion: Emotion;
  storyRole: "opening" | "development" | "tension" | "climax" | "falling" | "resolution" | "epilogue";
  chapterTitle: string;
  narrativeDescription: string;
  progression: Progression | null;
}

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  emotionOrder: Emotion[];
  storyRoles: StoryChapter["storyRole"][];
  chapterTitles: string[];
  narrativeDescriptions: string[];
}

export const STORY_ARC_TEMPLATES: StoryArc[] = [
  {
    id: "heros-journey",
    name: "Hero's Journey",
    description: "From humble beginnings through trials to triumphant victory.",
    emotionOrder: ["contemplative", "dreamy", "mysterious", "aggressive", "triumphant"],
    storyRoles: ["opening", "development", "tension", "climax", "resolution"],
    chapterTitles: ["The Call", "The Threshold", "The Unknown", "The Ordeal", "The Return"],
    narrativeDescriptions: [
      "A quiet moment of reflection before the journey begins.",
      "Crossing into a new world, leaving the familiar behind.",
      "Navigating uncertainty, encountering the strange and unfamiliar.",
      "The decisive battle. Everything is at stake.",
      "Victory achieved. The hero returns transformed.",
    ],
  },
  {
    id: "tragedy",
    name: "Tragedy",
    description: "Beauty dissolves into darkness. What was bright grows dim.",
    emotionOrder: ["tender", "nostalgic", "melancholic", "dark", "contemplative"],
    storyRoles: ["opening", "development", "tension", "climax", "resolution"],
    chapterTitles: ["Innocence", "Memory", "The Unraveling", "The Abyss", "Acceptance"],
    narrativeDescriptions: [
      "A gentle beginning full of warmth and hope.",
      "Looking back at what was, sensing it slipping away.",
      "The cracks deepen. What was whole begins to break.",
      "The lowest point. Surrounded by weight and shadow.",
      "A quiet understanding emerges from the wreckage.",
    ],
  },
  {
    id: "rise-and-fall",
    name: "Rise & Fall",
    description: "Ascending to euphoria, then crashing back to earth.",
    emotionOrder: ["melancholic", "mysterious", "euphoric", "aggressive", "melancholic"],
    storyRoles: ["opening", "development", "climax", "falling", "resolution"],
    chapterTitles: ["The Longing", "The Spark", "The Summit", "The Crash", "The Echo"],
    narrativeDescriptions: [
      "Starting from a place of yearning and desire.",
      "Something ignites — curiosity, possibility, a door opening.",
      "The peak. Pure elation. Everything aligns.",
      "The fall is sudden and violent. The world tears apart.",
      "Back where you started, but changed by the journey.",
    ],
  },
  {
    id: "romance",
    name: "Romance",
    description: "Meeting, falling, surrendering, remembering.",
    emotionOrder: ["dreamy", "tender", "euphoric", "nostalgic", "tender"],
    storyRoles: ["opening", "development", "climax", "falling", "resolution"],
    chapterTitles: ["First Sight", "Drawing Close", "The Crescendo", "Bittersweet", "Still Here"],
    narrativeDescriptions: [
      "The world softens. Something catches your eye.",
      "Walls come down. Vulnerability becomes beauty.",
      "Overwhelming joy. Two become one for a moment.",
      "Time passes. The glow settles into warm memory.",
      "What remains is gentle, steady, and real.",
    ],
  },
  {
    id: "redemption",
    name: "Redemption",
    description: "From the deepest dark, climbing toward light and triumph.",
    emotionOrder: ["dark", "aggressive", "contemplative", "melancholic", "triumphant"],
    storyRoles: ["opening", "tension", "development", "falling", "resolution"],
    chapterTitles: ["The Pit", "The Struggle", "The Reckoning", "The Wound", "The Dawn"],
    narrativeDescriptions: [
      "Trapped in shadow with no visible escape.",
      "Fighting against the darkness with raw, desperate energy.",
      "Pausing to understand what led here. Searching for meaning.",
      "Acknowledging the pain. Letting the wound breathe.",
      "Rising at last. Stronger for having been broken.",
    ],
  },
  {
    id: "fever-dream",
    name: "Fever Dream",
    description: "Reality bends. Nothing is quite what it seems.",
    emotionOrder: ["mysterious", "dreamy", "dark", "euphoric", "mysterious"],
    storyRoles: ["opening", "development", "tension", "climax", "resolution"],
    chapterTitles: ["The Distortion", "The Float", "The Nightmare", "The Vision", "The Question"],
    narrativeDescriptions: [
      "Something is off. The familiar becomes strange.",
      "Drifting through a landscape that shifts and shimmers.",
      "The dream turns. Shadows press in from every side.",
      "A blinding moment of clarity inside the chaos.",
      "Waking, but unsure of what was real.",
    ],
  },
  {
    id: "coming-of-age",
    name: "Coming of Age",
    description: "Growing from wonder through struggle into self-knowledge.",
    emotionOrder: ["dreamy", "euphoric", "aggressive", "melancholic", "contemplative"],
    storyRoles: ["opening", "development", "tension", "falling", "resolution"],
    chapterTitles: ["Wide Eyes", "The Rush", "The Test", "The Loss", "Understanding"],
    narrativeDescriptions: [
      "Everything is new and full of possibility.",
      "The thrill of discovering what you can do.",
      "The world pushes back. Not everything bends to will.",
      "Something important is lost. The weight is felt.",
      "Wisdom arrives quietly, earned through experience.",
    ],
  },
  {
    id: "descent-return",
    name: "Descent & Return",
    description: "Spiraling inward to find what was hidden, then emerging.",
    emotionOrder: ["contemplative", "nostalgic", "dark", "mysterious", "euphoric"],
    storyRoles: ["opening", "development", "climax", "falling", "resolution"],
    chapterTitles: ["The Stillness", "The Memory Gate", "The Depths", "The Discovery", "The Emergence"],
    narrativeDescriptions: [
      "A quiet turning inward. The surface grows distant.",
      "Revisiting what was left behind. Old doors open.",
      "The deepest point. Surrounded by the unknown self.",
      "Finding something unexpected in the dark.",
      "Breaking through to the surface, carrying treasure.",
    ],
  },
];

export const STORY_ROLE_META: Record<StoryChapter["storyRole"], { label: string; color: string; icon: string }> = {
  opening: { label: "Opening", color: "#0EA5E9", icon: "sunrise" },
  development: { label: "Development", color: "#10B981", icon: "trending-up" },
  tension: { label: "Tension", color: "#F59E0B", icon: "alert-triangle" },
  climax: { label: "Climax", color: "#EF4444", icon: "zap" },
  falling: { label: "Falling Action", color: "#F97316", icon: "trending-down" },
  resolution: { label: "Resolution", color: "#8B5CF6", icon: "check-circle" },
  epilogue: { label: "Epilogue", color: "#64748B", icon: "book" },
};

export function generateStoryProgression(arc: StoryArc, key: string): StoryChapter[] {
  return arc.emotionOrder.map((emotion, i) => ({
    emotion,
    storyRole: arc.storyRoles[i],
    chapterTitle: arc.chapterTitles[i],
    narrativeDescription: arc.narrativeDescriptions[i],
    progression: generateProgression(emotion, key),
  }));
}

export function generateCustomStoryProgression(
  emotions: Emotion[],
  key: string
): StoryChapter[] {
  const roleSequence: StoryChapter["storyRole"][] = (() => {
    const len = emotions.length;
    if (len === 1) return ["opening"];
    if (len === 2) return ["opening", "resolution"];
    if (len === 3) return ["opening", "climax", "resolution"];
    if (len === 4) return ["opening", "development", "climax", "resolution"];
    if (len === 5) return ["opening", "development", "climax", "falling", "resolution"];
    const roles: StoryChapter["storyRole"][] = ["opening"];
    for (let i = 1; i < len - 1; i++) {
      const progress = i / (len - 1);
      if (progress < 0.3) roles.push("development");
      else if (progress < 0.5) roles.push("tension");
      else if (progress < 0.6) roles.push("climax");
      else if (progress < 0.8) roles.push("falling");
      else roles.push("development");
    }
    roles.push("resolution");
    return roles;
  })();

  return emotions.map((emotion, i) => {
    const emotionData = EMOTIONS.find((e) => e.id === emotion)!;
    return {
      emotion,
      storyRole: roleSequence[i],
      chapterTitle: `Ch. ${i + 1}: ${emotionData.label}`,
      narrativeDescription: `The story moves through ${emotionData.description.toLowerCase()}.`,
      progression: generateProgression(emotion, key),
    };
  });
}

export const CONTINUANCE_ARCS = [
  {
    name: "Classic Narrative",
    description: "Setup, development, climax, resolution. The universal story.",
    path: ["tonic", "subdominant", "dominant", "tonic"],
    voiceNotes: "Start grounded, expand, build tension, return home. The voice tells a complete story.",
    pictureNotes: "Wide establishing shot, zoom in, close-up at peak, pull back to resolution.",
  },
  {
    name: "Deceptive Journey",
    description: "You think you're going home but the story takes a turn.",
    path: ["tonic", "subdominant", "dominant", "submediant"],
    voiceNotes: "The narration promises resolution but delivers emotional complexity instead.",
    pictureNotes: "The image you expected dissolves into something more nuanced.",
  },
  {
    name: "Circular Motion",
    description: "Orbiting without landing. Suspension as narrative device.",
    path: ["supertonic", "dominant", "supertonic", "dominant"],
    voiceNotes: "The voice circles, never quite settling. Each repetition adds new meaning.",
    pictureNotes: "A repeating motif that reveals new details each time through.",
  },
  {
    name: "Descent",
    description: "Chromatic falling. Each step pulls deeper.",
    path: ["tonic", "leading", "submediant", "dominant"],
    voiceNotes: "The narrator's voice lowers. Weight accumulates. Gravity takes over.",
    pictureNotes: "Colors darken frame by frame. The picture descends into shadow.",
  },
  {
    name: "Ascension",
    description: "Building from nothing to everything.",
    path: ["supertonic", "subdominant", "dominant", "tonic"],
    voiceNotes: "The voice rises from quiet reflection to confident declaration.",
    pictureNotes: "Dawn breaking. Each frame brighter than the last.",
  },
  {
    name: "The Outsider",
    description: "Chromatic intrusion disrupts the expected flow.",
    path: ["tonic", "chromatic", "subdominant", "tonic"],
    voiceNotes: "A foreign accent enters the conversation. The narration shifts register.",
    pictureNotes: "A surreal frame breaks the realism, then the picture reassembles.",
  },
];
