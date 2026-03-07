import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveAiConfig() {
  const results = await db
    .select()
    .from(aiSettings)
    .where(eq(aiSettings.isActive, true))
    .limit(1);
  if (!results[0]) throw new Error("No active AI provider configured");
  return results[0];
}

export type AiResponse = {
  text: string | null;
  toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>;
};

export async function callAi(
  systemPrompt: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>,
): Promise<AiResponse> {
  const config = await getActiveAiConfig();

  if (config.provider === "openai") {
    return callOpenAi(config, systemPrompt, chatMessages, tools);
  } else {
    return callAnthropic(config, systemPrompt, chatMessages, tools);
  }
}

async function callOpenAi(
  config: typeof aiSettings.$inferSelect,
  systemPrompt: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>,
): Promise<AiResponse> {
  const client = new OpenAI({ apiKey: config.apiKey });

  const openAiTools =
    tools.length > 0
      ? tools.map((t) => ({
          type: "function" as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }))
      : undefined;

  const response = await client.chat.completions.create({
    model: config.model,
    temperature: parseFloat(String(config.temperature)),
    messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
    ...(openAiTools ? { tools: openAiTools } : {}),
  });

  const choice = response.choices[0];
  const toolCalls =
    choice.message.tool_calls?.map((tc) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })) || [];

  return {
    text: choice.message.content,
    toolCalls,
  };
}

async function callAnthropic(
  config: typeof aiSettings.$inferSelect,
  systemPrompt: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>,
): Promise<AiResponse> {
  const client = new Anthropic({ apiKey: config.apiKey });

  const anthropicTools =
    tools.length > 0
      ? tools.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.parameters as Anthropic.Tool.InputSchema,
        }))
      : undefined;

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    temperature: parseFloat(String(config.temperature)),
    system: systemPrompt,
    messages: chatMessages,
    ...(anthropicTools ? { tools: anthropicTools } : {}),
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const toolBlocks = response.content.filter((b) => b.type === "tool_use");

  return {
    text: textBlock?.type === "text" ? textBlock.text : null,
    toolCalls: toolBlocks.map((b) => ({
      name: b.type === "tool_use" ? b.name : "",
      arguments:
        b.type === "tool_use" ? (b.input as Record<string, unknown>) : {},
    })),
  };
}
