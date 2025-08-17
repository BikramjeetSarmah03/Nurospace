const CHAT_QUERY_KEYS = ["CHATS"] as const;

export const CHAT_QUERY = Object.fromEntries(
  CHAT_QUERY_KEYS.map((key) => [key, key]),
) as Record<(typeof CHAT_QUERY_KEYS)[number], string>;
