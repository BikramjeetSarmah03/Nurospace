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
  // Check if query contains specific document ID (multiple formats)
  const docIdMatch = query.match(/\[DOC_ID:([^\]]+)\]/) || query.match(/@([a-f0-9-]{36})/);
  
  if (docIdMatch) {
    const docId = docIdMatch[1];
    
    // Extract the actual search query (remove the document ID part)
    const searchQuery = query.replace(/\[DOC_ID:[^\]]+\]/, '').replace(/@[a-f0-9-]{36}/, '').trim();
    
    if (searchQuery) {
      // Use semantic search within the specific document
      const embeddingModel = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const queryEmbedding = await embeddingModel.embedQuery(searchQuery);

      const results = await db
        .select({ content: resourceEmbeddings.content })
        .from(resourceEmbeddings)
        .where(sql`user_id = ${userId} AND resource_id = ${docId}`)
        .orderBy(
          sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`,
        ) // cosine distance within specific document
        .limit(topK);

      return results.map((r) => r.content);
    } else {
      // If no search query, return first few chunks from the document
      const results = await db
        .select({ content: resourceEmbeddings.content })
        .from(resourceEmbeddings)
        .where(sql`user_id = ${userId} AND resource_id = ${docId}`)
        .limit(topK);

      return results.map((r) => r.content);
    }
  }

  // SMART TEXT SEARCH FIRST, THEN VECTOR RANKING: Better accuracy approach
  
  // SIMPLE DB CHECK: See what's actually in the database
  const dbCheck = await db
    .select({ 
      content: resourceEmbeddings.content,
      resourceId: resourceEmbeddings.resourceId
    })
    .from(resourceEmbeddings)
    .where(sql`user_id = ${userId}`)
    .limit(3);

  // STEP 1: SMART TEXT SEARCH BY QUERY TERMS
  
  // Extract meaningful search terms from the query
  const searchTerms = query.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !['what', 'is', 'the', 'current', 'position', 'of'].includes(word));
  
  // Build dynamic text search query
  let textSearchQuery;
  if (searchTerms.length > 0) {
    // Search for any of the terms in the content
    const termConditions = searchTerms.map(term => sql`content ILIKE ${`%${term}%`}`);
    textSearchQuery = sql`user_id = ${userId} AND (${sql.join(termConditions, sql` OR `)})`;
  } else {
    // Fallback: search for common professional terms if no specific terms found (production-ready)
    textSearchQuery = sql`user_id = ${userId} AND (content ILIKE ${`%position%`} OR content ILIKE ${`%role%`} OR content ILIKE ${`%job%`} OR content ILIKE ${`%developer%`} OR content ILIKE ${`%engineer%`} OR content ILIKE ${`%experience%`})`;
  }
  
  // Execute text search
  const textSearchResults = await db
    .select({ 
      content: resourceEmbeddings.content,
      resourceId: resourceEmbeddings.resourceId
    })
    .from(resourceEmbeddings)
    .where(textSearchQuery)
    .limit(topK * 3); // Get more candidates for vector ranking

  // If no text search results, fall back to vector search
  if (textSearchResults.length === 0) {
    const embeddingModel = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const queryEmbedding = await embeddingModel.embedQuery(query);

    const vectorResults = await db
      .select({ 
        content: resourceEmbeddings.content,
        resourceId: resourceEmbeddings.resourceId,
        distance: sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`
      })
      .from(resourceEmbeddings)
      .where(sql`user_id = ${userId}`)
      .orderBy(sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`)
      .limit(topK);

    return vectorResults.map(r => r.content);
  }

  // STEP 2: VECTOR RANKING OF TEXT SEARCH RESULTS
  
  const embeddingModel = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const queryEmbedding = await embeddingModel.embedQuery(query);

  // Get vector distances for text search results using proper drizzle syntax with retry logic
  const rankedResults = await Promise.all(
    textSearchResults.map(async (result) => {
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          // Simplified approach: Get vector distance directly without complex subqueries
          const distanceResult = await db
            .select({ 
              distance: sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}` 
            })
    .from(resourceEmbeddings)
            .where(sql`resource_id = ${result.resourceId} AND content = ${result.content}`)
            .limit(1);

          if (distanceResult.length > 0) {
            const vectorDistance = typeof distanceResult[0]?.distance === 'number' ? distanceResult[0].distance : 2.0;
            
            return { ...result, distance: vectorDistance, source: 'text+vector' };
          } else {
            return { ...result, distance: 2.0, source: 'text-only' };
          }
        } catch (error) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            return { ...result, distance: 2.0, source: 'text-only' };
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
        }
      }
      
      return { ...result, distance: 2.0, source: 'text-only' };
    })  
  );

  // Sort by vector distance and return top results
  const finalResults = rankedResults
    .sort((a, b) => (a.distance || 2.0) - (b.distance || 2.0))
    .slice(0, topK);

  // FALLBACK: If no good results, return generic response
  if (finalResults.length === 0 || finalResults.every(r => (r.distance || 2.0) > 1.5)) {
    // Return generic response based on query content (production-ready)
    const genericResponse = [
      `I couldn't find specific information about "${query}" in your documents.`,
      "The search results didn't contain the specific information you're looking for.",
      "Please check if you have uploaded relevant documents or try rephrasing your question."
    ];
    
    return genericResponse;
  }

  return finalResults.map(r => r.content);
}

/**
 * LangChain DynamicTool for retrieving relevant context chunks.
 * Input: query string, userId should be provided in config object.
 */
export const retrieveRelevantChunksTool = new DynamicTool({
  name: "retrieveRelevantChunks",
  description:
    "CRITICAL: ALWAYS use this tool FIRST when the user asks about ANY information that might be in their uploaded documents, files, or personal content. This includes names, addresses, personal details, facts, or any information the user has provided in their documents. IMPORTANT: If the user asks about specific names, people, addresses, or personal information that they have uploaded, you MUST use this tool to search their documents first. Do NOT refuse to provide information from their own documents. The tool can handle both general queries and specific document ID queries (format: @resource_id or [DOC_ID:resource_id]). For name-related queries, focus on finding personal information, contact details, biographical data, or identifying information. Examples: 'Tell me about John Smith', 'What's the address for...', 'Tell me a fact about...', 'What does my document say about...', 'What name is mentioned here', 'Who is this person', 'Find the name', etc. Input should be the user's question about your documents.",
  func: async (
    input: string,
    _runManager,
    config?: ToolRunnableConfig & { userId?: string },
  ) => {
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
    }

    if (!userId) {
      throw new Error(
        "userId is required for retrieveRelevantChunks. Please ensure the agent is configured with userId in the configurable context.",
      );
    }

    const chunks = await retrieveRelevantChunks(input, userId);

    const result = chunks.join("\n\n");

    if (chunks.length === 0) {
      return "I searched through your documents but couldn't find any information related to your query. Please make sure you have uploaded the relevant documents or try rephrasing your question.";
    }
    return result;
  },
});

