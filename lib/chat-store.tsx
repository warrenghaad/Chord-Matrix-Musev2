import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LearnerModel,
  LearnerEvent,
  ChatMode,
  createLearnerModel,
  migrateLearnerModel,
  applyEvent,
  summarizeLearnerModel,
} from "@/lib/learner-model";

const LEARNER_KEY = "@chordflow_learner_v1";
const DISCOVERIES_KEY = "@chordflow_discoveries_v1";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Context handed from Generate/Story into the Chat tab. */
export interface BridgeContext {
  /** Short label shown in the context chip. */
  label: string;
  /** Compact text injected into Claude's system context. */
  detail: string;
  /** Suggested seed question to prefill the composer. */
  seedQuestion?: string;
  emotion?: string;
  key?: string;
}

export interface Discovery {
  id: string;
  createdAt: number;
  mode: ChatMode;
  title: string;
  trigger: string;
  question: string;
  summary: string;
  messages: ChatMessage[];
  contextDetail: string;
}

interface ChatStore {
  ready: boolean;
  learnerModel: LearnerModel;
  recordEvent: (event: LearnerEvent) => void;
  learnerSummary: () => string;

  pendingBridge: BridgeContext | null;
  setBridge: (bridge: BridgeContext) => void;
  consumeBridge: () => BridgeContext | null;

  discoveries: Discovery[];
  saveDiscovery: (d: Omit<Discovery, "id" | "createdAt">) => Discovery;
  deleteDiscovery: (id: string) => void;

  /** A discovery queued to reopen in the Chat tab. */
  pendingReopen: Discovery | null;
  reopenDiscovery: (d: Discovery) => void;
  consumeReopen: () => Discovery | null;
}

const ChatContext = createContext<ChatStore | null>(null);

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [learnerModel, setLearnerModel] = useState<LearnerModel>(createLearnerModel);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [pendingBridge, setPendingBridge] = useState<BridgeContext | null>(null);
  const [pendingReopen, setPendingReopen] = useState<Discovery | null>(null);

  // Keep a ref so recordEvent always batches onto the freshest model.
  const modelRef = useRef(learnerModel);
  modelRef.current = learnerModel;

  useEffect(() => {
    (async () => {
      try {
        const [rawModel, rawDisc] = await Promise.all([
          AsyncStorage.getItem(LEARNER_KEY),
          AsyncStorage.getItem(DISCOVERIES_KEY),
        ]);
        if (rawModel) setLearnerModel(migrateLearnerModel(JSON.parse(rawModel)));
        if (rawDisc) setDiscoveries(JSON.parse(rawDisc));
      } catch (e) {
        console.error("ChatStore load failed:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persistModel = useCallback((model: LearnerModel) => {
    AsyncStorage.setItem(LEARNER_KEY, JSON.stringify(model)).catch((e) =>
      console.error("Learner persist failed:", e),
    );
  }, []);

  const persistDiscoveries = useCallback((list: Discovery[]) => {
    AsyncStorage.setItem(DISCOVERIES_KEY, JSON.stringify(list)).catch((e) =>
      console.error("Discoveries persist failed:", e),
    );
  }, []);

  const recordEvent = useCallback(
    (event: LearnerEvent) => {
      const next = applyEvent(modelRef.current, event);
      modelRef.current = next;
      setLearnerModel(next);
      persistModel(next);
    },
    [persistModel],
  );

  const learnerSummary = useCallback(
    () => summarizeLearnerModel(modelRef.current),
    [],
  );

  const setBridge = useCallback((bridge: BridgeContext) => {
    setPendingBridge(bridge);
  }, []);

  const consumeBridge = useCallback(() => {
    const b = pendingBridge;
    setPendingBridge(null);
    return b;
  }, [pendingBridge]);

  const saveDiscovery = useCallback(
    (d: Omit<Discovery, "id" | "createdAt">) => {
      const full: Discovery = { ...d, id: genId(), createdAt: Date.now() };
      setDiscoveries((prev) => {
        const next = [full, ...prev];
        persistDiscoveries(next);
        return next;
      });
      return full;
    },
    [persistDiscoveries],
  );

  const deleteDiscovery = useCallback(
    (id: string) => {
      setDiscoveries((prev) => {
        const next = prev.filter((x) => x.id !== id);
        persistDiscoveries(next);
        return next;
      });
    },
    [persistDiscoveries],
  );

  const reopenDiscovery = useCallback((d: Discovery) => {
    setPendingReopen(d);
  }, []);

  const consumeReopen = useCallback(() => {
    const d = pendingReopen;
    setPendingReopen(null);
    return d;
  }, [pendingReopen]);

  const value = useMemo<ChatStore>(
    () => ({
      ready,
      learnerModel,
      recordEvent,
      learnerSummary,
      pendingBridge,
      setBridge,
      consumeBridge,
      discoveries,
      saveDiscovery,
      deleteDiscovery,
      pendingReopen,
      reopenDiscovery,
      consumeReopen,
    }),
    [
      ready,
      learnerModel,
      recordEvent,
      learnerSummary,
      pendingBridge,
      setBridge,
      consumeBridge,
      discoveries,
      saveDiscovery,
      deleteDiscovery,
      pendingReopen,
      reopenDiscovery,
      consumeReopen,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatStore(): ChatStore {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatStore must be used within a ChatProvider");
  }
  return ctx;
}
