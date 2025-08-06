// Tool: Get current date and time
export function getCurrentDateTime() {
  const now = new Date();
  
  // Get timezone information
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format date and time with more detail
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  
  return {
    date: now.toLocaleDateString('en-US', dateOptions),
    time: now.toLocaleTimeString('en-US', timeOptions),
    iso: now.toISOString(),
    timezone: timezone,
    unix: Math.floor(now.getTime() / 1000),
    year: now.getFullYear(),
    month: now.getMonth() + 1, // getMonth() returns 0-11
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds()
  };
}
