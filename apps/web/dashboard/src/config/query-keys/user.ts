const USER_QUERY_KEYS = ["MY_PROFILE", "USER"] as const;

export const USER_KEYS = Object.fromEntries(
  USER_QUERY_KEYS.map((key) => [key, key]),
) as Record<(typeof USER_QUERY_KEYS)[number], string>;
