import { Service } from "honestjs";
import type { Context } from "hono";
import type { User } from "better-auth";
import { v4 as uuidV4 } from "uuid";
import { and, eq } from "drizzle-orm";

import { streamText } from "hono/streaming";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { google } from "@packages/llm/models/google";
import { createSemanticSupervisedAgent } from "@/lib/agent";

// 🚀 MAX MODE INTEGRATION
import { maxModeSupervisor } from "@/lib/max-mode";

// ⚡ POWER MODE INTEGRATION - Hybrid Supervisor Agent
import { createHybridSupervisorAgent } from "@/lib/power-mode";

// 🎯 MENTION SYSTEM
import { processMentionsInQuery } from "@/lib/mention-system";

import { db } from "@/db";
import { chats, messages } from "@/db/schema/chat";
import { retrieveRelevantChunks } from "@/tool/research/retrieveRelevantChunks";
import { SimpleQueryHandler } from "@/lib/simple-query-handler";

import type { NewChatDto } from "./dto/new-chat";

import MessageService from "./messages/messages.service";

@Service()
export default class ChatService {
  private messageService = new MessageService();

  async getAllChats(user: User) {
    const chats = await db.query.chats.findMany({
      where: (chats, { eq }) => eq(chats.userId, user.id),
    });

    return {
      success: true,
      data: chats,
    };
  }

  async getSingleChat(chatSlug: string, user: User) {
    const chat = await db.query.chats.findFirst({
      where: (chats, { eq, and }) =>
        and(eq(chats.slug, chatSlug), eq(chats.userId, user.id)),
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        },
      },
    });

    if (!chat) {
      return { success: false, message: "Chat not found" };
    }

    return {
      success: true,
      data: chat,
    };
  }

  async deleteChat(chatId: string, user: User) {
    try {
      const deleted = await db
        .delete(chats)
        .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
        .returning();

      const success = deleted.length > 0;

      return {
        success,
        data: deleted,
        message: success
          ? "Chat deleted successfully."
          : "Chat not found or unauthorized.",
      };
    } catch (error) {
      console.log({ error });
    }
  }

  async newChat(c: Context, body: NewChatDto, user: User) {
    try {
      let chatId: { id: string };
      let finalSlug: string;

      // 🧠 Create or find chat
      if (body.slug) {
        // Try to find existing chat first
        const existingChat = await db.query.chats.findFirst({
          where: (chats, { eq, and }) =>
            and(eq(chats.slug, body.slug as string), eq(chats.userId, user.id)),
        });

        if (existingChat) {
          // Continue existing conversation
          chatId = { id: existingChat.id };
          finalSlug = existingChat.slug;
          console.log(
            "[DEBUG] Continuing existing chat:",
            existingChat.id,
            "Slug:",
            finalSlug,
          );
        } else {
          // Chat doesn't exist, create it
          finalSlug = body.slug;
          const newChat = await this.createChat(
            body.msg?.slice(0, 50) ?? "new chat",
            finalSlug,
            user.id,
          );
          chatId = { id: newChat.id };
          console.log(
            "[DEBUG] Created new chat with provided slug:",
            newChat.id,
            "Slug:",
            finalSlug,
          );
        }
      } else {
        // Create new chat with generated slug
        finalSlug = this.generateSlug(body.msg ?? "new-chat");
        const newChat = await this.createChat(
          body.msg?.slice(0, 50) ?? "new chat",
          finalSlug,
          user.id,
        );
        chatId = { id: newChat.id };
        console.log(
          "[DEBUG] Created new chat:",
          newChat.id,
          "Slug:",
          finalSlug,
        );
      }

      // Check if this is a new conversation by looking for existing messages
      const existingMessages = await db.query.messages.findMany({
        where: (messages, { eq }) => eq(messages.chatId, chatId.id),
        limit: 1,
      });

      // 💬 Save user message
      await this.messageService.createMessage(chatId.id, "user", body.msg);
      console.log("[DEBUG] Saved user message for chat:", chatId.id);

      // 📄 Parse document mentions and fetch their content
      const mentionedDocs = await this.parseDocumentMentions(
        body.msg ?? "",
        user.id,
      );

      // 🎯 MENTION-BASED DIRECT TOOL CALLS
      const userInput = body.msg ?? "";
      console.log(`[MENTION] Checking for mentions in: "${userInput}"`);

      const mentionResult = await this.handleDirectMentionCalls(userInput);

      if (mentionResult.hasMentions) {
        console.log("[MENTION] ✅ Direct tool calls executed for mentions");

        // Save the mention response
        await this.messageService.createMessage(
          chatId.id,
          "assistant",
          mentionResult.response,
        );

        // Return the mention response immediately
        return streamText(c, async (stream) => {
          await stream.write(mentionResult.response);
          await stream.write("[MODE]:mention");
          await stream.write(`[CHAT_SLUG]:${finalSlug}`);
          await stream.close();
        });
      }

      // 🚀 SIMPLE QUERY CHECK - Handle basic greetings directly
      console.log(
        `[SIMPLE QUERY] Checking if "${userInput}" is a simple query...`,
      );

      const simpleResponse = SimpleQueryHandler.handleSimpleQuery(userInput);

      if (simpleResponse) {
        console.log(
          `[SIMPLE QUERY] ✅ Detected simple query: "${userInput}" -> "${simpleResponse}"`,
        );

        // Save the simple response
        await this.messageService.createMessage(
          chatId.id,
          "assistant",
          simpleResponse,
        );

        // Return the simple response immediately
        return streamText(c, async (stream) => {
          await stream.write(simpleResponse);
          await stream.write("[MODE]:simple");
          await stream.write(`[CHAT_SLUG]:${finalSlug}`);
          await stream.close();
        });
      }
      console.log(
        "[SIMPLE QUERY] ❌ Not a simple query, proceeding with AI processing",
      );

      // 🎯 Create semantic supervisor agent with userId context
      const supervisorAgent = await createSemanticSupervisedAgent(false);
      console.log("[DEBUG] Starting supervisor agent stream...");

      // For existing conversations, let LangGraph memory handle context
      // For new conversations, add system message
      const agentMessages: any[] = [];

      if (existingMessages.length === 0) {
        // This is a new conversation, add system message
        let systemContent = `You are an intelligent AI assistant that provides helpful, accurate responses.

🎯 **YOUR ROLE**:
• Understand user queries and provide clear, well-structured answers
• Use available capabilities when appropriate to enhance your responses
• Combine information from multiple sources when needed
• Be direct, helpful, and conversational`;

        // Add document context if documents are mentioned
        if (mentionedDocs.length > 0) {
          const docNames = mentionedDocs.map((doc) => doc.name).join(", ");
          systemContent += `\n\n📄 **Referenced Documents**: ${docNames}`;
        }

        systemContent += `\n\nProvide helpful responses based on the user's needs.`;

        agentMessages.push(new SystemMessage(systemContent));
      }

      // Add user message (replace @resource_id mentions with [DOC_ID:resource_id] format)
      let userMessage = body.msg ?? "";

      // Replace @resource_id mentions with [DOC_ID:resource_id] format
      if (mentionedDocs.length > 0) {
        for (const doc of mentionedDocs) {
          const mentionPattern = new RegExp(
            `@${doc.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "g",
          );
          userMessage = userMessage.replace(
            mentionPattern,
            `[DOC_ID:${doc.id}]`,
          );
        }
      }

      agentMessages.push(new HumanMessage(userMessage));

      // Get existing messages for context
      if (existingMessages.length > 0) {
        const previousMessages = await db.query.messages.findMany({
          where: (messages, { eq }) => eq(messages.chatId, chatId.id),
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });

        // Convert database messages to LangChain messages
        for (const msg of previousMessages) {
          if (msg.role === "user") {
            agentMessages.push(new HumanMessage(msg.content));
          } else if (msg.role === "assistant") {
            agentMessages.push(new HumanMessage(msg.content));
          }
        }
      }

      return streamText(c, async (stream) => {
        // Set up cancellation detection at the top level
        let isCancelled = false;

        // Check for cancellation header
        const cancelHeader = c.req.header("x-cancel-request");
        if (cancelHeader === "true") {
          console.log("[DEBUG] Cancellation header detected");
          isCancelled = true;
        }

        // Check connection status
        c.req.raw.signal?.addEventListener("abort", () => {
          console.log("[DEBUG] Request aborted signal received");
          isCancelled = true;
        });

        try {
          console.log("[DEBUG] Starting supervisor agent invocation...");

          if (isCancelled) {
            console.log("[DEBUG] Request was cancelled before processing");
            return;
          }

          // 🚀 MODE SELECTION - Handle normal, max, and power modes
          const requestedMode = body.mode;
          const autoDetectedMax = this.shouldUseMaxMode(body.msg ?? "");

          // Determine which mode to use
          let selectedMode: "normal" | "max" | "power" = "normal";

          if (requestedMode === "power") {
            selectedMode = "power";
          } else if (
            requestedMode === "max" ||
            (requestedMode !== "normal" && autoDetectedMax)
          ) {
            selectedMode = "max";
          } else {
            selectedMode = "normal";
          }

          console.log(
            `[MODE SELECTION] Frontend requested: "${requestedMode || "auto"}", Auto-detected: ${autoDetectedMax}, Final decision: ${selectedMode.toUpperCase()}`,
          );

          // ⚡ POWER MODE PROCESSING - Hybrid Supervisor Agent
          if (selectedMode === "power") {
            console.log(
              "[POWER MODE] 🚀 Frontend requested POWER mode, using Hybrid Supervisor Agent",
            );

            try {
              // Create hybrid supervisor agent
              const hybridAgent = createHybridSupervisorAgent({
                enableSmartCache: true,
                cacheTTL: 300000, // 5 minutes
                enableFunctionCalling: true,
                enableFallbackRouting: true,
              });

              // Process with hybrid agent
              const hybridResult = await hybridAgent.processQuery(
                agentMessages,
                {
                  configurable: { userId: user.id },
                },
              );

              console.log("[POWER MODE] ✅ Processing completed:", {
                source: hybridResult.metadata.source,
                processingTime: hybridResult.metadata.processingTime,
                tokensUsed: hybridResult.metadata.tokensUsed,
                confidence: hybridResult.metadata.confidence,
              });

              // Check if cancelled during POWER mode processing
              if (isCancelled || c.req.raw.signal?.aborted) {
                console.log(
                  "[POWER MODE] Request was cancelled during processing",
                );
                return;
              }

              // Save the response
              if (hybridResult.messages[0]?.content && !isCancelled) {
                const responseContent = hybridResult.messages[0].content;
                if (responseContent.length > 10) {
                  await this.messageService.createMessage(
                    chatId.id,
                    "assistant",
                    responseContent,
                  );
                }
              }

              // Stream the response
              if (!isCancelled) {
                const formattedResponse =
                  this.formatPowerModeResponse(hybridResult);
                await stream.write(formattedResponse);

                // Add mode indicator to response
                await stream.write("[MODE]:power");
                await stream.write(`[CHAT_SLUG]:${finalSlug}`);
                await stream.close();
              }

              console.log(
                "[POWER MODE] 🚀 Response streamed and stream closed successfully",
              );
              return; // Exit early since POWER mode handled the response
            } catch (powerModeError) {
              console.error(
                "[POWER MODE] ❌ Processing failed, falling back to normal mode:",
                powerModeError,
              );
              // Continue to normal processing as fallback
            }
          }

          // 🚀 MAX MODE PROCESSING
          // Only run if MAX mode was specifically selected
          if (selectedMode === "max") {
            const modeReason =
              requestedMode === "max"
                ? "Frontend requested MAX mode"
                : "Auto-detected complex query";
            console.log(
              `[MAX MODE] 🚀 ${modeReason}, using MAX mode processing`,
            );

            try {
              // Process with MAX mode
              const maxModeResult = await maxModeSupervisor.processQuery(
                body.msg ?? "",
                user.id,
              );

              console.log("[MAX MODE] ✅ Processing completed:", {
                confidence: `${(maxModeResult.confidence * 100).toFixed(1)}%`,
                processingTime: `${maxModeResult.processingTime}ms`,
                steps: maxModeResult.executionResult.steps.length,
                quality: maxModeResult.qualityMetrics,
              });

              // Check if cancelled during MAX mode processing
              if (isCancelled || c.req.raw.signal?.aborted) {
                console.log(
                  "[MAX MODE] Request was cancelled during processing",
                );
                return;
              }

              // Save the enhanced response
              if (maxModeResult.enhancedResponse && !isCancelled) {
                const responseContent = maxModeResult.enhancedResponse;
                if (responseContent.length > 10) {
                  await this.messageService.createMessage(
                    chatId.id,
                    "assistant",
                    responseContent,
                  );
                }
              }

              // Stream the enhanced response
              if (!isCancelled) {
                const formattedResponse =
                  this.formatMaxModeResponse(maxModeResult);
                await stream.write(formattedResponse);

                // Add mode indicator to response
                await stream.write("[MODE]:max");
                await stream.write(`[CHAT_SLUG]:${finalSlug}`);
                await stream.close();
              }

              return; // Exit early since MAX mode handled the response
            } catch (maxModeError) {
              console.error(
                "[MAX MODE] ❌ Processing failed, falling back to normal mode:",
                maxModeError,
              );
              // Continue to normal processing as fallback
            }
          }

          // 🔄 NORMAL MODE PROCESSING (existing logic)
          // Only run if no other mode has been selected
          if (selectedMode !== "normal") {
            console.log(
              `[DEBUG] Skipping normal mode - ${selectedMode.toUpperCase()} mode was selected`,
            );
            return;
          }

          const modeReason =
            requestedMode === "normal"
              ? "Frontend requested normal mode"
              : "Auto-selected normal mode";
          console.log(
            `[DEBUG] ${modeReason} - Using normal semantic processing`,
          );

          // 🎯 Use supervisor agent with userId context
          const result = await supervisorAgent(agentMessages, {
            configurable: { userId: user.id },
          });

          console.log("[DEBUG] Supervisor agent completed");

          // Check if the request was cancelled during processing
          if (isCancelled || c.req.raw.signal?.aborted) {
            console.log("[DEBUG] Request was cancelled, not saving response");
            return;
          }

          // Save the final response only if not cancelled and complete
          const finalResponse = result.messages[result.messages.length - 1];
          if (finalResponse && finalResponse.content && !isCancelled) {
            const responseContent =
              typeof finalResponse.content === "string"
                ? finalResponse.content
                : "";

            // Only save if response is substantial (more than just a few characters)
            if (responseContent.length > 10) {
              await this.messageService.createMessage(
                chatId.id,
                "assistant",
                responseContent,
              );
            } else {
              console.log(
                "[DEBUG] Response too short, not saving:",
                responseContent.length,
              );
            }
          }

          // Send the final response
          const responseContent =
            result.messages[result.messages.length - 1]?.content;
          if (responseContent && !isCancelled) {
            const content =
              typeof responseContent === "string" ? responseContent : "";

            await stream.write(content);
            // Add mode indicator to response
            await stream.write("[MODE]:normal");
            await stream.write(`[CHAT_SLUG]:${finalSlug}`);
            await stream.close();
          }
        } catch (error) {
          console.error("[ERROR] Supervisor agent error:", error);

          // Check if cancelled before saving error
          if (isCancelled || c.req.raw.signal?.aborted) {
            console.log(
              "[DEBUG] Request was cancelled during error, not saving error message",
            );
            return;
          }

          // Save error message only if not cancelled
          await this.messageService.createMessage(
            chatId.id,
            "assistant",
            "I apologize, but I encountered an error while processing your request. Please try again.",
          );

          await stream.write(
            "I apologize, but I encountered an error while processing your request. Please try again.",
          );
          // Add mode indicator to error response
          await stream.write("[MODE]:error");
          await stream.write(`[CHAT_SLUG]:${finalSlug}`);
          await stream.close();
        }
      });
    } catch (error) {
      console.error("[ERROR] Chat route error:", error);
      return c.json(
        {
          success: false,
          error: "Failed to process chat message",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }

  generateSlug(input: string): string {
    const rawSlug = input.slice(0, 30).toLowerCase() ?? "new-chat";
    const sanitizedSlug = rawSlug
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return `${sanitizedSlug}-${uuidV4()}`;
  }

  async createChat(title: string, slug: string, userId: string) {
    const chat = await db
      .insert(chats)
      .values({
        title: title,
        slug: slug,
        userId: userId,
      })
      .returning();
    return chat[0];
  }

  async cancelChat(chatSlug: string | undefined, user: User) {
    try {
      console.log(
        "[DEBUG] Cancelling chat for user:",
        user.id,
        "chatSlug:",
        chatSlug,
      );

      // If we have a chatSlug, handle the cancellation
      if (chatSlug && chatSlug !== "cancelled") {
        // Find the chat
        const chat = await db.query.chats.findFirst({
          where: (chats, { eq, and }) =>
            and(eq(chats.slug, chatSlug), eq(chats.userId, user.id)),
        });

        if (chat) {
          // Find and remove any incomplete AI responses (less than 10 characters)
          // We'll use a simple approach: get all AI responses and filter by length in code
          const allAIResponses = await db.query.messages.findMany({
            where: (messages, { eq, and }) =>
              and(eq(messages.chatId, chat.id), eq(messages.role, "assistant")),
          });

          // Filter and remove incomplete responses
          for (const response of allAIResponses) {
            if (response.content.length < 10) {
              await db.delete(messages).where(eq(messages.id, response.id));

              console.log(
                "[DEBUG] Removed incomplete AI response:",
                response.id,
              );
            }
          }

          console.log(
            "[DEBUG] Cleaned up incomplete responses for chat:",
            chat.id,
          );
        }
      }

      return {
        success: true,
        message: "Chat cancelled successfully",
      };
    } catch (error) {
      console.error("[ERROR] Failed to cancel chat:", error);
      return {
        success: false,
        error: "Failed to cancel chat",
      };
    }
  }

  async parseDocumentMentions(message: string, userId: string) {
    // Extract document mentions like @resource_id (UUID format)
    // This regex captures @ followed by a UUID pattern
    const uuidMentionRegex =
      /@([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/gi;
    const uuidMentions = message.match(uuidMentionRegex);

    if (!uuidMentions) return [];

    // Extract valid UUIDs from mentions
    const resourceIds = uuidMentions
      .map((mention) => mention.slice(1)) // Remove @ symbol
      .filter((id) => {
        // Double-check UUID v4 validation
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isValid = uuidRegex.test(id);
        if (!isValid) {
          console.log(`[DEBUG] Skipping invalid UUID mention: @${id}`);
        }
        return isValid;
      });

    if (resourceIds.length === 0) {
      console.log("[DEBUG] No valid UUID mentions found");
      return [];
    }

    console.log("[DEBUG] Found valid resource ID mentions:", resourceIds);

    // Fetch mentioned documents from database by ID
    const mentionedDocs = await db.query.resources.findMany({
      where: (resources, { eq, and, inArray }) =>
        and(eq(resources.userId, userId), inArray(resources.id, resourceIds)),
    });

    console.log("[DEBUG] Found mentioned documents:", mentionedDocs);
    return mentionedDocs;
  }

  /**
   * Check for static keyword mentions like @Search, @YouTube, etc.
   * These are direct tool mentions that should trigger immediate tool execution
   */
  private checkStaticKeywordMentions(message: string): {
    hasStaticMentions: boolean;
    staticMentions: string[];
    modifiedMessage: string;
  } {
    // Define static keyword mentions that map to tools
    const staticMentions: Record<string, string> = {
      search: "tavilySearch",
      youtube: "youtubeSearch",
      web: "tavilySearch",
      research: "tavilySearch",
      papers: "tavilySearch",
      workspace: "retrieveRelevantChunks",
      documents: "retrieveRelevantChunks",
      files: "retrieveRelevantChunks",
      time: "getCurrentDateTime",
      date: "getCurrentDateTime",
      weather: "getCurrentWeather",
      // Add support for the new keyword mappings
      "search youtube": "youtubeSearch",
      "search web": "tavilySearch",
      "search workspace": "retrieveRelevantChunks",
      "search papers": "tavilySearch",
      "complete form": "retrieveRelevantChunks",
      "create citation": "tavilySearch",
      "create flashcards": "retrieveRelevantChunks",
      citation: "tavilySearch",
      flashcards: "retrieveRelevantChunks",
      form: "retrieveRelevantChunks",
    };

    // Extract mentions like @Search, @Search YouTube, etc.
    const mentionRegex = /@([^@\s]+(?:\s+[^@\s]+)*)/gi;
    const mentions = message.match(mentionRegex);

    if (!mentions) {
      return {
        hasStaticMentions: false,
        staticMentions: [],
        modifiedMessage: message,
      };
    }

    const foundStaticMentions: string[] = [];
    let modifiedMessage = message;

    for (const mention of mentions) {
      const keyword = mention.slice(1).toLowerCase(); // Remove @ and convert to lowercase

      if (keyword in staticMentions) {
        const toolName = staticMentions[keyword];
        foundStaticMentions.push(toolName);
        console.log(
          `[STATIC MENTION] Found static keyword mention: @${keyword} -> ${toolName}`,
        );

        // Remove the mention from the message to avoid confusion
        modifiedMessage = modifiedMessage.replace(mention, "").trim();
      }
    }

    return {
      hasStaticMentions: foundStaticMentions.length > 0,
      staticMentions: foundStaticMentions,
      modifiedMessage,
    };
  }

  // 🚀 MAX MODE DETECTION - Determines when to use enhanced AI processing
  private shouldUseMaxMode(query: string): boolean {
    if (!query) return false;

    const normalizedQuery = query.toLowerCase();

    // Use MAX mode for complex queries
    const complexIndicators = [
      "analyze",
      "compare",
      "research",
      "investigate",
      "examine",
      "evaluate",
      "assess",
      "synthesize",
      "verify",
      "fact check",
      "comprehensive",
      "detailed",
      "thorough",
      "in-depth",
      "explain",
      "break down",
      "compare and contrast",
      "pros and cons",
    ];

    const hasComplexIndicator = complexIndicators.some((indicator) =>
      normalizedQuery.includes(indicator),
    );

    // Use MAX mode for long queries (more than 50 characters)
    const isLongQuery = query.length > 50;

    // Use MAX mode for queries with multiple parts
    const hasMultipleParts =
      normalizedQuery.includes(" and ") ||
      normalizedQuery.includes(" or ") ||
      normalizedQuery.includes(" but ") ||
      normalizedQuery.includes(";") ||
      normalizedQuery.includes(",") ||
      (normalizedQuery.includes("?") && normalizedQuery.split("?").length > 2);

    // Use MAX mode for questions that ask for analysis or comparison
    const isAnalysisQuestion =
      normalizedQuery.includes("how") ||
      normalizedQuery.includes("why") ||
      normalizedQuery.includes("what are the") ||
      normalizedQuery.includes("differences between") ||
      normalizedQuery.includes("similarities between");

    const shouldUseMax =
      hasComplexIndicator ||
      isLongQuery ||
      hasMultipleParts ||
      isAnalysisQuestion;

    console.log(`[MAX MODE] Query analysis: "${query}"`, {
      hasComplexIndicator,
      isLongQuery,
      hasMultipleParts,
      isAnalysisQuestion,
      shouldUseMax,
    });

    return shouldUseMax;
  }

  // 🚀 MAX MODE RESPONSE FORMATTING - Creates user-friendly output with metrics
  private formatMaxModeResponse(maxModeResult: any): string {
    const {
      enhancedResponse,
      confidence,
      processingTime,
      qualityMetrics,
      recommendations,
    } = maxModeResult;

    let formattedResponse = enhancedResponse;

    // Add quality metrics footer with better formatting
    formattedResponse += "\n\n--- 🔍 ANALYSIS INSIGHTS ---\n\n";
    formattedResponse += "📊 **Quality Metrics:**\n";
    formattedResponse += `• **Confidence Level**: ${(confidence * 100).toFixed(1)}%\n`;
    formattedResponse += `• **Processing Time**: ${processingTime}ms\n`;
    formattedResponse += `• **Accuracy**: ${(qualityMetrics.accuracy * 100).toFixed(1)}%\n`;
    formattedResponse += `• **Completeness**: ${(qualityMetrics.completeness * 100).toFixed(1)}%\n`;
    formattedResponse += `• **Source Attribution**: ${(qualityMetrics.sourceAttribution * 100).toFixed(1)}%\n\n`;

    // Add recommendations if available with better formatting
    if (
      recommendations &&
      Array.isArray(recommendations) &&
      recommendations.length > 0
    ) {
      formattedResponse += "💡 **Recommendations for Better Results:**\n";
      recommendations.forEach((rec: string) => {
        formattedResponse += `• ${rec}\n`;
      });
      formattedResponse += "\n";
    }

    // Add MAX mode indicator
    formattedResponse += "🚀 *Powered by MAX MODE - Enhanced AI Analysis*";

    return formattedResponse;
  }

  // ⚡ POWER MODE RESPONSE FORMATTING - Creates user-friendly output with hybrid metrics
  private formatPowerModeResponse(hybridResult: any): string {
    const { messages, metadata } = hybridResult;
    const responseContent = messages[0]?.content || "No response generated";

    let formattedResponse = responseContent;

    // Add hybrid mode metrics footer
    formattedResponse += `\n\n--- ⚡ POWER MODE INSIGHTS ---
🎯 **Processing Source**: ${metadata.source}
⚡ **Processing Time**: ${metadata.processingTime}ms
💰 **Tokens Used**: ${metadata.tokensUsed}
🔒 **Confidence**: ${(metadata.confidence * 100).toFixed(1)}%
🎭 **Agent Type**: ${metadata.agentType || "Hybrid"}`;

    // Add tools used if available
    if (
      metadata.toolsUsed &&
      Array.isArray(metadata.toolsUsed) &&
      metadata.toolsUsed.length > 0
    ) {
      formattedResponse += `\n🛠️ **Tools Used**: ${metadata.toolsUsed.join(", ")}`;
    }

    // Add POWER mode indicator
    formattedResponse +=
      "\n\n⚡ *Powered by POWER MODE - Hybrid Supervisor Agent*";

    return formattedResponse;
  }

  /**
   * Handle direct mention calls using the mention system
   */
  private async handleDirectMentionCalls(userQuery: string): Promise<{
    hasMentions: boolean;
    response: string;
  }> {
    const result = await processMentionsInQuery(userQuery);
    return {
      hasMentions: result.hasMentions,
      response: result.response,
    };
  }
}
