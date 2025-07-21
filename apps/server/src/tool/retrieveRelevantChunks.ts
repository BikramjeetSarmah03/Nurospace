import { db } from "@/db";
import { resourceEmbeddings } from "@/db/schema/resource";
import { sql } from "drizzle-orm";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { DynamicTool, type ToolRunnableConfig } from "@langchain/core/tools";

/**
 * Retrieves the most relevant context chunks for a user's query using vector search.
 * @param query The user's query string
 * @param userId The user's ID
 * @param topK The number of top results to return (default 5)
 * @returns Array of relevant content strings
 */
export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  topK = 5,
) {
  const embeddingModel = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const queryEmbedding = await embeddingModel.embedQuery(query);

  const results = await db
    .select({ content: resourceEmbeddings.content })
    .from(resourceEmbeddings)
    .where(sql`user_id = ${userId}`)
    .orderBy(
      sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`,
    ) // cosine distance
    .limit(topK);

  return results.map((r) => r.content);
}

/**
 * LangChain DynamicTool for retrieving relevant context chunks.
 * Input: query string, userId should be provided in config object.
 */
export const retrieveRelevantChunksTool = new DynamicTool({
  name: "retrieveRelevantChunks",
  description:
    "ALWAYS use this tool when the user asks about documents, files, or any content they have uploaded. This tool searches through ALL the user's uploaded documents and resources to find relevant information. Use it for ANY question about documents, files, PDFs, text files, or any uploaded content. Examples: 'What does my document say about...', 'Tell me about the document', 'What's in my file', 'Summarize my document', etc. Input should be the user's question about their documents.",
  func: async (
    input: string,
    _runManager,
    config?: ToolRunnableConfig & { userId?: string },
  ) => {
    console.log("[DEBUG] retrieveRelevantChunksTool called with input:", input);
    console.log("[DEBUG] Config received:", config);

    // Try to get userId from config first
    let userId = config?.userId;

    // If not in config, try to get from the broader context
    if (!userId && config && typeof config === "object") {
      // Check if userId is in the configurable context
      const configurable = (config as any).configurable;
      if (configurable && configurable.userId) {
        userId = configurable.userId;
      }
    }

    console.log("[DEBUG] Extracted userId:", userId);

    if (!userId) {
      throw new Error(
        "userId is required for retrieveRelevantChunks. Please ensure the agent is configured with userId in the configurable context.",
      );
    }

    const chunks = await retrieveRelevantChunks(input, userId);
    console.log("[DEBUG] Retrieved chunks:", chunks);

    const result = chunks.join("\n\n");
    console.log("[DEBUG] Returning result:", result);

    return result;
  },
});
