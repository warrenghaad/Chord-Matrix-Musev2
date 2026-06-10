import { Emotion } from "@/lib/music-engine";

export type ChatMode =
  | "explain"
  | "practice"
  | "discover"
  | "focused"
  | "build"
  | "offline";

export const LEARNER_SCHEMA_VERSION = 1 as const;

export interface LearnerModel {
  schemaVersion: 1;
  emotions: Record<string, number>;
  keys: Record<string, number>;
  extensions: Record<string, number>;
  conceptsAsked: Record<string, number>;
  modesUsed: Record<string, number>;
  voicingsExplored: number;
  progressionsGenerated: number;
  progressionsSaved: number;
  discoveriesReturned: number;
  chatMessagesSent: number;
  firstSeen: number;
  lastSeen: number;
}

export type LearnerEvent =
  | { type: "emotionSelected"; emotion: Emotion }
  | { type: "keySelected"; key: string }
  | { type: "extensionExplored"; extension: string }
  | { type: "progressionGenerated"; emotion: Emotion; key: string }
  | { type: "progressionSaved" }
  | { type: "voicingExpanded" }
  | { type: "conceptAsked"; concept: string }
  | { type: "modeUsed"; mode: ChatMode }
  | { type: "discoveryReturned" }
  | { type: "chatMessageSent" };

export function createLearnerModel(): LearnerModel {
  const now = Date.now();
  return {
    schemaVersion: LEARNER_SCHEMA_VERSION,
    emotions: {},
    keys: {},
    extensions: {},
    conceptsAsked: {},
    modesUsed: {},
    voicingsExplored: 0,
    progressionsGenerated: 0,
    progressionsSaved: 0,
    discoveriesReturned: 0,
    chatMessagesSent: 0,
    firstSeen: now,
    lastSeen: now,
  };
}

export function migrateLearnerModel(raw: unknown): LearnerModel {
  const base = createLearnerModel();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<LearnerModel>;
  // Phase 1: only schemaVersion 1 exists. Merge defensively so future fields
  // (and missing legacy fields) never crash the app.
  return {
    ...base,
    ...r,
    schemaVersion: LEARNER_SCHEMA_VERSION,
    emotions: { ...base.emotions, ...(r.emotions ?? {}) },
    keys: { ...base.keys, ...(r.keys ?? {}) },
    extensions: { ...base.extensions, ...(r.extensions ?? {}) },
    conceptsAsked: { ...base.conceptsAsked, ...(r.conceptsAsked ?? {}) },
    modesUsed: { ...base.modesUsed, ...(r.modesUsed ?? {}) },
    firstSeen: r.firstSeen ?? base.firstSeen,
  };
}

function bump(map: Record<string, number>, key: string): Record<string, number> {
  return { ...map, [key]: (map[key] ?? 0) + 1 };
}

export function applyEvent(model: LearnerModel, event: LearnerEvent): LearnerModel {
  const next: LearnerModel = { ...model, lastSeen: Date.now() };
  switch (event.type) {
    case "emotionSelected":
      next.emotions = bump(next.emotions, event.emotion);
      break;
    case "keySelected":
      next.keys = bump(next.keys, event.key);
      break;
    case "extensionExplored":
      next.extensions = bump(next.extensions, event.extension);
      break;
    case "progressionGenerated":
      next.emotions = bump(next.emotions, event.emotion);
      next.keys = bump(next.keys, event.key);
      next.progressionsGenerated += 1;
      break;
    case "progressionSaved":
      next.progressionsSaved += 1;
      break;
    case "voicingExpanded":
      next.voicingsExplored += 1;
      break;
    case "conceptAsked":
      next.conceptsAsked = bump(next.conceptsAsked, event.concept.toLowerCase().slice(0, 40));
      break;
    case "modeUsed":
      next.modesUsed = bump(next.modesUsed, event.mode);
      break;
    case "discoveryReturned":
      next.discoveriesReturned += 1;
      break;
    case "chatMessageSent":
      next.chatMessagesSent += 1;
      break;
  }
  return next;
}

function topKeys(map: Record<string, number>, n: number): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k} (${v})`);
}

const EXPERIENCE_THRESHOLDS = { exploring: 0, familiar: 8, fluent: 25 };

function experienceLevel(model: LearnerModel): string {
  const total =
    model.progressionsGenerated + model.voicingsExplored + model.chatMessagesSent;
  if (total >= EXPERIENCE_THRESHOLDS.fluent) return "fluent (knows the basics well)";
  if (total >= EXPERIENCE_THRESHOLDS.familiar) return "familiar (getting comfortable)";
  return "exploring (still new to the app)";
}

/**
 * Builds a compact, human-readable summary of the learner for Claude's system
 * context. Kept short on purpose — it's a hint, not a transcript.
 */
export function summarizeLearnerModel(model: LearnerModel): string {
  const lines: string[] = [];
  lines.push(`Player level: ${experienceLevel(model)}.`);

  const emotions = topKeys(model.emotions, 3);
  if (emotions.length) lines.push(`Favorite emotions: ${emotions.join(", ")}.`);

  const keys = topKeys(model.keys, 3);
  if (keys.length) lines.push(`Most-used keys: ${keys.join(", ")}.`);

  const exts = topKeys(model.extensions, 4);
  if (exts.length) lines.push(`Extensions they've explored: ${exts.join(", ")}.`);

  const concepts = topKeys(model.conceptsAsked, 4);
  if (concepts.length) lines.push(`Concepts they've asked about before: ${concepts.join(", ")}.`);

  lines.push(
    `Activity: ${model.progressionsGenerated} progressions generated, ${model.progressionsSaved} saved, ${model.voicingsExplored} voicings opened.`,
  );

  return lines.join("\n");
}
