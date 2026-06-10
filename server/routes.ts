import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { z } from "zod";
import { getAnthropicClient, hasAnthropicKey, DEFAULT_MODEL_STR } from "./anthropic";
import {
  buildSystemPrompt,
  OFFLINE_STUB_MESSAGE,
  type ChatMode,
} from "./chat-modes";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const chatRequestSchema = z.object({
  mode: z.enum(["explain", "practice", "discover", "focused", "build", "offline"]),
  messages: z.array(chatMessageSchema).min(1).max(40),
  context: z.string().max(6000).optional().default(""),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/chat/status", (_req: Request, res: Response) => {
    res.json({ available: hasAnthropicKey() });
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }

    const { mode, messages, context } = parsed.data;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    // Offline Assist is a Phase 1 stub — stream the canned message, no Claude call.
    if (mode === "offline") {
      res.write(OFFLINE_STUB_MESSAGE);
      return res.end();
    }

    if (!hasAnthropicKey()) {
      res.status(503);
      res.write(
        "Claude isn't connected yet. Add the ANTHROPIC_API_KEY secret to enable chat.",
      );
      return res.end();
    }

    try {
      const anthropic = getAnthropicClient();
      const system = buildSystemPrompt(mode as ChatMode, context);

      const stream = anthropic.messages.stream({
        model: DEFAULT_MODEL_STR, // "claude-sonnet-4-20250514"
        max_tokens: 1500,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      stream.on("text", (text: string) => {
        res.write(text);
      });

      await stream.finalMessage();
      res.end();
    } catch (err) {
      console.error("Chat stream error:", err);
      if (!res.headersSent) {
        res.status(500);
      }
      if (!res.writableEnded) {
        res.write("\n\n[Something went wrong reaching Claude. Try again in a moment.]");
        res.end();
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
