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
  console.log("[DEBUG] retrieveRelevantChunks called with query:", query, "userId:", userId);
  
  const embeddingModel = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const queryEmbedding = await embeddingModel.embedQuery(query);
  console.log("[DEBUG] Generated query embedding, length:", queryEmbedding.length);

  const results = await db
    .select({ content: resourceEmbeddings.content })
    .from(resourceEmbeddings)
    .where(sql`user_id = ${userId}`)
    .orderBy(
      sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`,
    ) // cosine distance
    .limit(topK);

  console.log("[DEBUG] Database query returned", results.length, "results");
  console.log("[DEBUG] Results:", results.map(r => r.content.substring(0, 100) + "..."));

  return results.map((r) => r.content);
}

/**
 * LangChain DynamicTool for retrieving relevant context chunks.
 * Input: query string, userId should be provided in config object.
 */
export const retrieveRelevantChunksTool = new DynamicTool({
  name: "retrieveRelevantChunks",
  description:
    "CRITICAL: ALWAYS use this tool FIRST when the user asks about ANY information that might be in their uploaded documents, files, or personal content. This includes names, addresses, personal details, facts, or any information the user has provided in their documents. IMPORTANT: If the user asks about specific names, people, addresses, or personal information that they have uploaded, you MUST use this tool to search their documents first. Do NOT refuse to provide information from their own documents. Examples: 'Tell me about John Smith', 'What's the address for...', 'Tell me a fact about...', 'What does my document say about...', 'news about...', 'district of...', 'news regarding [name]', etc. Input should be the user's question about their documents.",
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
    
    if (chunks.length === 0) {
      console.log("[WARNING] No relevant chunks found for query:", input);
      return "I searched through your documents but couldn't find any information related to your query. Please make sure you have uploaded the relevant documents or try rephrasing your question.";
    }

    return result;
  },
});
