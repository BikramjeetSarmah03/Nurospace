// 🔧 Utility to read a stream into buffer
export async function streamToBuffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests = 10,
  windowMs = 60000,
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export function getRateLimitInfo(
  userId: string,
): { remaining: number; resetTime: number } | null {
  const userLimit = rateLimitMap.get(userId);
  if (!userLimit) return null;

  const now = Date.now();
  if (now > userLimit.resetTime) return null;

  return {
    remaining: Math.max(0, 10 - userLimit.count),
    resetTime: userLimit.resetTime,
  };
}
