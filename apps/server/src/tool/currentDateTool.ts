// Tool: Get current date and time
export function getCurrentDateTime() {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    iso: now.toISOString(),
  };
}
