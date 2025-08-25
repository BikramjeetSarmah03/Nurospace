/**
 * 🚀 SIMPLE QUERY HANDLER
 *
 * Handles basic greetings and common chat interactions without AI processing.
 * Provides instant responses for simple queries to improve user experience
 * and reduce API costs.
 */

export interface SimpleResponse {
  query: string;
  response: string;
  category: string;
}

export class SimpleQueryHandler {
  private static simpleResponses: Record<string, SimpleResponse> = {
    // Basic greetings
    hi: {
      query: "hi",
      response: "Hello! 👋 How can I help you today?",
      category: "greeting",
    },
    hello: {
      query: "hello",
      response: "Hi there! 👋 What would you like to know?",
      category: "greeting",
    },
    hey: {
      query: "hey",
      response: "Hey! 👋 How can I assist you?",
      category: "greeting",
    },
    yo: {
      query: "yo",
      response: "Yo! 👋 What can I help you with?",
      category: "greeting",
    },
    sup: {
      query: "sup",
      response: "Hey! 👋 What's on your mind?",
      category: "greeting",
    },
    hii: {
      query: "hii",
      response: "Hello! 👋 How can I help you today?",
      category: "greeting",
    },
    helloo: {
      query: "helloo",
      response: "Hi there! 👋 What would you like to know?",
      category: "greeting",
    },
    heyy: {
      query: "heyy",
      response: "Hey! 👋 How can I assist you?",
      category: "greeting",
    },

    // Time-based greetings
    "good morning": {
      query: "good morning",
      response: "Good morning! ☀️ How can I help you today?",
      category: "time-greeting",
    },
    "good afternoon": {
      query: "good afternoon",
      response: "Good afternoon! 🌤️ How can I assist you?",
      category: "time-greeting",
    },
    "good evening": {
      query: "good evening",
      response: "Good evening! 🌙 How can I help you?",
      category: "time-greeting",
    },
    "good night": {
      query: "good night",
      response: "Good night! 🌙 Sweet dreams!",
      category: "time-greeting",
    },
    morning: {
      query: "morning",
      response: "Good morning! ☀️ How can I assist you?",
      category: "time-greeting",
    },
    afternoon: {
      query: "afternoon",
      response: "Good afternoon! 🌤️ How can I help you?",
      category: "time-greeting",
    },
    evening: {
      query: "evening",
      response: "Good evening! 🌙 How can I assist you?",
      category: "time-greeting",
    },
    night: {
      query: "night",
      response: "Good night! 🌙 Sweet dreams!",
      category: "time-greeting",
    },

    // Gratitude
    thanks: {
      query: "thanks",
      response: "You're welcome! 😊",
      category: "gratitude",
    },
    "thank you": {
      query: "thank you",
      response: "You're welcome! 😊",
      category: "gratitude",
    },
    thx: {
      query: "thx",
      response: "You're welcome! 😊",
      category: "gratitude",
    },
    ty: {
      query: "ty",
      response: "You're welcome! 😊",
      category: "gratitude",
    },
    thank: {
      query: "thank",
      response: "You're welcome! 😊",
      category: "gratitude",
    },
    tnx: {
      query: "tnx",
      response: "You're welcome! 😊",
      category: "gratitude",
    },

    // Farewells
    bye: {
      query: "bye",
      response: "Goodbye! 👋 Have a great day!",
      category: "farewell",
    },
    goodbye: {
      query: "goodbye",
      response: "See you later! 👋 Take care!",
      category: "farewell",
    },
    "see you": {
      query: "see you",
      response: "See you later! 👋 Take care!",
      category: "farewell",
    },
    later: {
      query: "later",
      response: "Later! 👋 Take care!",
      category: "farewell",
    },

    // Well-being
    "how are you": {
      query: "how are you",
      response: "I'm doing well, thank you! 😊 How can I help you today?",
      category: "well-being",
    },
    "what's up": {
      query: "what's up",
      response: "Not much! Just here to help. 😊 What can I do for you?",
      category: "well-being",
    },
    "how's it going": {
      query: "how's it going",
      response: "It's going great! 😊 How can I assist you?",
      category: "well-being",
    },
    "how are you doing": {
      query: "how are you doing",
      response: "I'm doing great, thanks! 😊 How can I help you today?",
      category: "well-being",
    },
    "how do you do": {
      query: "how do you do",
      response: "I'm doing well, thank you! 😊 How can I assist you?",
      category: "well-being",
    },
    "what is up": {
      query: "what is up",
      response: "Not much! Just here to help. 😊 What can I do for you?",
      category: "well-being",
    },
    "whats up": {
      query: "whats up",
      response: "Not much! Just here to help. 😊 What can I do for you?",
      category: "well-being",
    },

    // Affirmations
    ok: {
      query: "ok",
      response: "Alright! 👍 What would you like to do?",
      category: "affirmation",
    },
    okay: {
      query: "okay",
      response: "Sure! 👍 How can I help you?",
      category: "affirmation",
    },
    yes: {
      query: "yes",
      response: "Great! 👍 What would you like to know?",
      category: "affirmation",
    },
    no: {
      query: "no",
      response: "No problem! 👍 What can I help you with instead?",
      category: "affirmation",
    },
    sure: {
      query: "sure",
      response: "Great! 👍 How can I assist you?",
      category: "affirmation",
    },
    alright: {
      query: "alright",
      response: "Alright! 👍 What's next?",
      category: "affirmation",
    },

    // Reactions
    cool: {
      query: "cool",
      response: "Cool! 😎 What's next?",
      category: "reaction",
    },
    nice: {
      query: "nice",
      response: "Nice! 😊 How can I assist you?",
      category: "reaction",
    },
    awesome: {
      query: "awesome",
      response: "Awesome! 🚀 What can I help you with?",
      category: "reaction",
    },
    great: {
      query: "great",
      response: "Great! 🎉 What would you like to do?",
      category: "reaction",
    },
    good: {
      query: "good",
      response: "Good! 👍 How can I help you?",
      category: "reaction",
    },
    bad: {
      query: "bad",
      response: "I'm sorry to hear that. 😔 How can I help make it better?",
      category: "reaction",
    },
    fine: {
      query: "fine",
      response: "That's good! 👍 How can I assist you?",
      category: "reaction",
    },
    amazing: {
      query: "amazing",
      response: "Amazing! 🎉 What can I help you with?",
      category: "reaction",
    },
    perfect: {
      query: "perfect",
      response: "Perfect! ✨ What's next?",
      category: "reaction",
    },

    // Help requests
    help: {
      query: "help",
      response: "I'm here to help! 😊 What would you like to know?",
      category: "help",
    },
    "can you help": {
      query: "can you help",
      response: "Absolutely! 😊 What can I assist you with?",
      category: "help",
    },
    "i need help": {
      query: "i need help",
      response: "I'm here to help! 😊 What do you need assistance with?",
      category: "help",
    },
    "help me": {
      query: "help me",
      response: "I'm here to help! 😊 What do you need assistance with?",
      category: "help",
    },

    // Status
    "what are you doing": {
      query: "what are you doing",
      response: "Just waiting to help you! 😊 What can I assist you with?",
      category: "status",
    },
    "are you busy": {
      query: "are you busy",
      response: "Not at all! 😊 I'm here and ready to help. What do you need?",
      category: "status",
    },
    "are you working": {
      query: "are you working",
      response: "Always working to help you! 😊 What can I assist you with?",
      category: "status",
    },
    "what can you do": {
      query: "what can you do",
      response:
        "I can help with many things! 😊 I can answer questions, analyze documents, help with research, and much more. What would you like to know?",
      category: "status",
    },
    "who are you": {
      query: "who are you",
      response:
        "I'm Nurospace AI, your intelligent assistant! 🤖 I'm here to help you with questions, analysis, and various tasks. How can I assist you today?",
      category: "status",
    },
    "what is your name": {
      query: "what is your name",
      response:
        "My name is Nurospace AI! 🤖 I'm your intelligent assistant, ready to help with whatever you need. What can I do for you today?",
      category: "status",
    },

    // Common chat responses
    lol: {
      query: "lol",
      response: "😄 What's so funny?",
      category: "chat",
    },
    haha: {
      query: "haha",
      response: "😄 Glad I could make you laugh!",
      category: "chat",
    },
    omg: {
      query: "omg",
      response: "😮 What happened?",
      category: "chat",
    },
    wow: {
      query: "wow",
      response: "😮 That's interesting! Tell me more.",
      category: "chat",
    },
    seriously: {
      query: "seriously",
      response: "Yes, seriously! 😊 What can I help you with?",
      category: "chat",
    },
    really: {
      query: "really",
      response: "Yes, really! 😊 What would you like to know?",
      category: "chat",
    },
    "no way": {
      query: "no way",
      response: "Way! 😄 What can I help you with?",
      category: "chat",
    },
    "for real": {
      query: "for real",
      response: "For real! 😊 How can I assist you?",
      category: "chat",
    },

    // Agreement/Disagreement
    "i agree": {
      query: "i agree",
      response: "Great! 👍 What would you like to do next?",
      category: "agreement",
    },
    "i disagree": {
      query: "i disagree",
      response: "That's okay! 👍 What's your perspective?",
      category: "agreement",
    },
    maybe: {
      query: "maybe",
      response: "Maybe! 🤔 What would help you decide?",
      category: "agreement",
    },
    "i think so": {
      query: "i think so",
      response: "That's good thinking! 👍 What can I help you with?",
      category: "agreement",
    },
    "i don't know": {
      query: "i don't know",
      response: "No worries! 😊 I'm here to help. What would you like to know?",
      category: "agreement",
    },
    idk: {
      query: "idk",
      response: "No worries! 😊 I'm here to help. What would you like to know?",
      category: "agreement",
    },
  };

  /**
   * Check if a query matches any simple response patterns
   * @param query - The user's input query
   * @returns The response string if matched, null otherwise
   */
  static handleSimpleQuery(query: string): string | null {
    if (!query) return null;

    const normalizedQuery = query.toLowerCase().trim();

    // Skip simple query processing for mention queries (starting with @)
    if (normalizedQuery.includes("@")) {
      return null;
    }

    // Check for exact matches first
    if (this.simpleResponses[normalizedQuery]) {
      console.log(`[SIMPLE QUERY] Direct response for: "${query}"`);
      return this.simpleResponses[normalizedQuery].response;
    }

    // Check for very short queries (1-3 words) that might be greetings
    const words = normalizedQuery.split(/\s+/);
    if (words.length <= 3) {
      // Check first word
      const firstWord = words[0];
      if (this.simpleResponses[firstWord]) {
        console.log(
          `[SIMPLE QUERY] First word match response for: "${query}" (matched: "${firstWord}")`,
        );
        return this.simpleResponses[firstWord].response;
      }

      // Check if it's a time-based greeting with additional words
      if (
        words.length === 2 &&
        (firstWord === "good" || firstWord === "great")
      ) {
        const secondWord = words[1];
        const timeGreeting = `${firstWord} ${secondWord}`;
        if (this.simpleResponses[timeGreeting]) {
          console.log(
            `[SIMPLE QUERY] Time greeting match response for: "${query}" (matched: "${timeGreeting}")`,
          );
          return this.simpleResponses[timeGreeting].response;
        }
      }

      // Check for "how are you" variations
      if (
        words.length === 3 &&
        firstWord === "how" &&
        words[1] === "are" &&
        words[2] === "you"
      ) {
        console.log(
          `[SIMPLE QUERY] How are you match response for: "${query}"`,
        );
        return this.simpleResponses["how are you"].response;
      }

      // Check for "what's up" variations
      if (words.length === 2 && firstWord === "what" && words[1] === "up") {
        console.log(`[SIMPLE QUERY] What's up match response for: "${query}"`);
        return this.simpleResponses["what's up"].response;
      }

      // Check for "i don't know" variations
      if (
        words.length === 3 &&
        firstWord === "i" &&
        words[1] === "don't" &&
        words[2] === "know"
      ) {
        console.log(
          `[SIMPLE QUERY] I don't know match response for: "${query}"`,
        );
        return this.simpleResponses["i don't know"].response;
      }

      // Check for "i think so" variations
      if (
        words.length === 3 &&
        firstWord === "i" &&
        words[1] === "think" &&
        words[2] === "so"
      ) {
        console.log(`[SIMPLE QUERY] I think so match response for: "${query}"`);
        return this.simpleResponses["i think so"].response;
      }
    }

    // Check for partial matches (e.g., "hello there" matches "hello")
    for (const [key, responseData] of Object.entries(this.simpleResponses)) {
      if (
        normalizedQuery.startsWith(key + " ") ||
        normalizedQuery.endsWith(" " + key)
      ) {
        console.log(
          `[SIMPLE QUERY] Partial match response for: "${query}" (matched: "${key}")`,
        );
        return responseData.response;
      }
    }

    return null; // No simple response found
  }

  /**
   * Get all available simple responses for debugging or management
   * @returns Array of all simple response data
   */
  static getAllResponses(): SimpleResponse[] {
    return Object.values(this.simpleResponses);
  }

  /**
   * Get responses by category
   * @param category - The category to filter by
   * @returns Array of responses in the specified category
   */
  static getResponsesByCategory(category: string): SimpleResponse[] {
    return Object.values(this.simpleResponses).filter(
      (response) => response.category === category,
    );
  }

  /**
   * Add a new simple response
   * @param query - The query to match
   * @param response - The response to return
   * @param category - The category for organization
   */
  static addResponse(query: string, response: string, category: string): void {
    this.simpleResponses[query.toLowerCase()] = {
      query: query.toLowerCase(),
      response,
      category,
    };
    console.log(
      `[SIMPLE QUERY] Added new response: "${query}" -> "${response}" (${category})`,
    );
  }

  /**
   * Remove a simple response
   * @param query - The query to remove
   */
  static removeResponse(query: string): void {
    if (this.simpleResponses[query.toLowerCase()]) {
      delete this.simpleResponses[query.toLowerCase()];
      console.log(`[SIMPLE QUERY] Removed response: "${query}"`);
    }
  }

  /**
   * Get statistics about the simple query handler
   * @returns Object with counts and categories
   */
  static getStats(): { total: number; categories: Record<string, number> } {
    const categories: Record<string, number> = {};

    Object.values(this.simpleResponses).forEach((response) => {
      categories[response.category] = (categories[response.category] || 0) + 1;
    });

    return {
      total: Object.keys(this.simpleResponses).length,
      categories,
    };
  }
}

// Export the static method for easy use
export const handleSimpleQuery = SimpleQueryHandler.handleSimpleQuery;
