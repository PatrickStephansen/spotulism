import { intervalToDuration } from "date-fns";

export const msToDisplayDuration = (ms: number) => {
  if (ms === undefined || ms === null) {
    return "--:--:--";
  }
  const duration = intervalToDuration({
    start: new Date(0),
    end: new Date(ms),
  });
  return `${duration.hours?.toString(10).padStart(2, "0")}:${duration.minutes
    ?.toString(10)
    .padStart(2, "0")}:${duration.seconds?.toString(10).padStart(2, "0")}`;
};
