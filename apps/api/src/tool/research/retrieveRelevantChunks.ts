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
  console.log(
    "[DEBUG] retrieveRelevantChunks called with query:",
    query,
    "userId:",
    userId,
  );

  // Check if query contains specific document ID (multiple formats)
  const docIdMatch = query.match(/\[DOC_ID:([^\]]+)\]/) || query.match(/@([a-f0-9-]{36})/);
  
  if (docIdMatch) {
    const docId = docIdMatch[1];
    console.log("[DEBUG] Found specific document ID:", docId);
    
    // Extract the actual search query (remove the document ID part)
    const searchQuery = query.replace(/\[DOC_ID:[^\]]+\]/, '').replace(/@[a-f0-9-]{36}/, '').trim();
    console.log("[DEBUG] Search query after removing doc ID:", searchQuery);
    
    if (searchQuery) {
      // Use semantic search within the specific document
      const embeddingModel = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const queryEmbedding = await embeddingModel.embedQuery(searchQuery);
      console.log("[DEBUG] Generated query embedding for document search, length:", queryEmbedding.length);

      const results = await db
        .select({ content: resourceEmbeddings.content })
        .from(resourceEmbeddings)
        .where(sql`user_id = ${userId} AND resource_id = ${docId}`)
        .orderBy(
          sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`,
        ) // cosine distance within specific document
        .limit(topK);

      console.log("[DEBUG] Document-specific semantic search returned", results.length, "results");
      console.log(
        "[DEBUG] Results:",
        results.map((r) => r.content.substring(0, 100) + "..."),
      );

      return results.map((r) => r.content);
    } else {
      // If no search query, return first few chunks from the document
      const results = await db
        .select({ content: resourceEmbeddings.content })
        .from(resourceEmbeddings)
        .where(sql`user_id = ${userId} AND resource_id = ${docId}`)
        .limit(topK);

      console.log("[DEBUG] Document-specific query returned", results.length, "results");
      console.log(
        "[DEBUG] Results:",
        results.map((r) => r.content.substring(0, 100) + "..."),
      );

      return results.map((r) => r.content);
    }
  }

  // Fallback to vector search for general queries
  const embeddingModel = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const queryEmbedding = await embeddingModel.embedQuery(query);
  console.log(
    "[DEBUG] Generated query embedding, length:",
    queryEmbedding.length,
  );

  const results = await db
    .select({ content: resourceEmbeddings.content })
    .from(resourceEmbeddings)
    .where(sql`user_id = ${userId}`)
    .orderBy(
      sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`,
    ) // cosine distance
    .limit(topK);

  console.log("[DEBUG] Vector search returned", results.length, "results");
  console.log(
    "[DEBUG] Results:",
    results.map((r) => r.content.substring(0, 100) + "..."),
  );

  return results.map((r) => r.content);
}

/**
 * LangChain DynamicTool for retrieving relevant context chunks.
 * Input: query string, userId should be provided in config object.
 */
export const retrieveRelevantChunksTool = new DynamicTool({
  name: "retrieveRelevantChunks",
  description:
    "CRITICAL: ALWAYS use this tool FIRST when the user asks about ANY information that might be in their uploaded documents, files, or personal content. This includes names, addresses, personal details, facts, or any information the user has provided in their documents. IMPORTANT: If the user asks about specific names, people, addresses, or personal information that they have uploaded, you MUST use this tool to search their documents first. Do NOT refuse to provide information from their own documents. The tool can handle both general queries and specific document ID queries (format: @resource_id or [DOC_ID:resource_id]). For name-related queries, focus on finding personal information, contact details, biographical data, or identifying information. Examples: 'Tell me about John Smith', 'What's the address for...', 'Tell me a fact about...', 'What does my document say about...', 'What name is mentioned here', 'Who is this person', 'Find the name', etc. Input should be the user's question about their documents.",
  func: async (
    input: string,
    _runManager,
    config?: ToolRunnableConfig & { userId?: string },
  ) => {
    console.log("[DEBUG] retrieveRelevantChunksTool called with input:", input);
    console.log("[DEBUG] Config received:", config);

    // Try to get userId from multiple sources
    let userId = config?.userId;

    // If not in config, try to get from the broader context
    if (!userId && config && typeof config === "object") {
      // Check if userId is in the configurable context
      const configurable = (config as any).configurable;
      if (configurable && configurable.userId) {
        userId = configurable.userId;
      }
    }

    // If still no userId, try to get from environment or global context
    if (!userId) {
      // For now, we'll use a default userId for testing
      // In production, this should come from the authenticated user context
      userId = process.env.DEFAULT_USER_ID || "mC7pqADICzQTvOfUQ1e6HpxQMVhYaJmm";
      console.log("[DEBUG] Using default userId:", userId);
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
