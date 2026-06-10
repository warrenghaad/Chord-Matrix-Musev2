import { ChatMode } from "@/lib/learner-model";

export type { ChatMode };

export const CHAT_MODES: { id: ChatMode; label: string; icon: string; blurb: string }[] = [
  { id: "explain", label: "Explain", icon: "book-open", blurb: "Clear theory, plainly stated" },
  { id: "practice", label: "Practice", icon: "repeat", blurb: "Drills and exercises to play now" },
  { id: "discover", label: "Discover", icon: "compass", blurb: "Open-ended rabbit holes" },
  { id: "focused", label: "Focused Discovery", icon: "target", blurb: "One concept, explored deeply" },
  { id: "build", label: "Build", icon: "tool", blurb: "Construct progressions & voicings" },
  { id: "offline", label: "Offline Assist", icon: "cloud-off", blurb: "Cached packs ship in Phase 2" },
];
