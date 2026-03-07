import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { callAi, getActiveAiConfig } from "./providers";
import { botTools } from "./tools";
import { executeTool } from "./tool-handlers";

export async function processClientMessage(
  conversationId: number,
  messageText: string,
): Promise<string> {
  // 1. Load conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!conversation) throw new Error("Conversation not found");

  // 2. Load last 20 messages for context
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(20);

  // Reverse to chronological order
  history.reverse();

  // 3. Get AI config
  const config = await getActiveAiConfig();

  // 4. Build chat messages
  const chatMessages = history
    .filter((m) => m.role === "client" || m.role === "bot")
    .map((m) => ({
      role: (m.role === "client" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: m.content,
    }));

  // Add current message
  chatMessages.push({ role: "user", content: messageText });

  // 5. Call AI with tools
  let response = await callAi(config.systemPrompt, chatMessages, botTools);

  // 6. Handle tool calls (loop until we get a text response)
  let iterations = 0;
  while (response.toolCalls.length > 0 && iterations < 5) {
    for (const toolCall of response.toolCalls) {
      const result = await executeTool(toolCall.name, toolCall.arguments);
      // Add tool result to conversation and call AI again
      chatMessages.push({
        role: "assistant",
        content: `[Tool ${toolCall.name} called]`,
      });
      chatMessages.push({ role: "user", content: `[Tool result: ${result}]` });
    }
    response = await callAi(config.systemPrompt, chatMessages, botTools);
    iterations++;
  }

  const botResponse =
    response.text || "Sorry, I couldn't process your request.";

  // 7. Save bot response to messages table
  await db.insert(messages).values({
    conversationId,
    role: "bot",
    content: botResponse,
  });

  return botResponse;
}
