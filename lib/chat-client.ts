import { fetch } from "expo/fetch";
import { getApiUrl } from "@/lib/query-client";
import { ChatMessage } from "@/lib/chat-store";
import { ChatMode } from "@/lib/learner-model";

export interface StreamChatArgs {
  mode: ChatMode;
  messages: ChatMessage[];
  context: string;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

/**
 * Streams a chat completion from the Express `/api/chat` endpoint. The backend
 * writes raw text chunks; we surface each decoded chunk via onDelta.
 */
export async function streamChat({
  mode,
  messages,
  context,
  onDelta,
  signal,
}: StreamChatArgs): Promise<string> {
  const url = new URL("/api/chat", getApiUrl());

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, messages, context }),
    credentials: "include",
    signal,
  });

  if (!res.ok && res.status !== 503) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    // Fallback for environments without a streaming body.
    const text = await res.text();
    onDelta(text);
    return text;
  }

  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      full += chunk;
      onDelta(chunk);
    }
  }

  const tail = decoder.decode();
  if (tail) {
    full += tail;
    onDelta(tail);
  }

  return full;
}
