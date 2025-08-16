const WORKFLOW_QUERY_KEYS = [
  "ALL_WORKFLOW",
  "SINGLE_WORKFLOW",
  "EXECUTION",
] as const;

export const WORKFLOW_KEYS = Object.fromEntries(
  WORKFLOW_QUERY_KEYS.map((key) => [key, key]),
) as Record<(typeof WORKFLOW_QUERY_KEYS)[number], string>;
