import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM, SupportedModels } from "@/lib/llm";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const NewChatSchema = z.object({
  message: z.string(),
  model: z.enum(SupportedModels).optional(),
});

export const chatRoutes = new Hono().post(
  "/",
  zValidator("json", NewChatSchema),
  async (c) => {
    const { message, model = "gemini-2.5-pro" } = c.req.valid("json");

    const llm = getLLM(model);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful AI assistant."],
      ["user", "{input}"],
    ]);

    console.log({ prompt: prompt.promptMessages });
    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const stream = await chain.stream({ input: message });

    return streamText(c, async (writer) => {
      for await (const chunk of stream) {
        await writer.write(chunk);
      }
    });
  },
);
