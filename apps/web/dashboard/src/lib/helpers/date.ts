import { intervalToDuration } from "date-fns";

export function DatesToDurationString(
  end: Date | string | null | undefined,
  start: Date | string | null | undefined,
) {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Check for invalid dates
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const timeElapsed = endDate.getTime() - startDate.getTime();

  if (timeElapsed < 1000) return `${timeElapsed}ms`;

  const duration = intervalToDuration({ start: 0, end: timeElapsed });

  return `${duration.minutes || 0}m ${duration.seconds || 0}s`;
}
