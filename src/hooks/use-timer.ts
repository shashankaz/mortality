import { useEffect, useMemo, useState } from "react";

import type { TimeComponents, TimerMode } from "../types";
import { getTimeDiff, parseDateInTimezone } from "../utils/date-utils";

export interface TimerResult {
  time: TimeComponents | null;
  isExpired: boolean;
  isUnconfigured: boolean;
}

export const useTimer = (
  mode: TimerMode,
  targetDate: string,
  startDate: string,
  timezone: string,
): TimerResult => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(id);
  }, []);

  return useMemo((): TimerResult => {
    if (mode === "countdown") {
      if (!targetDate)
        return { time: null, isExpired: false, isUnconfigured: true };

      const target = parseDateInTimezone(targetDate, timezone);
      if (isNaN(target.getTime()))
        return { time: null, isExpired: false, isUnconfigured: true };

      if (target.getTime() <= now.getTime())
        return {
          time: getTimeDiff(target, now),
          isExpired: true,
          isUnconfigured: false,
        };

      return {
        time: getTimeDiff(now, target),
        isExpired: false,
        isUnconfigured: false,
      };
    } else {
      if (!startDate)
        return { time: null, isExpired: false, isUnconfigured: true };

      const start = parseDateInTimezone(startDate, timezone);
      if (isNaN(start.getTime()))
        return { time: null, isExpired: false, isUnconfigured: true };

      return {
        time: getTimeDiff(start, now),
        isExpired: false,
        isUnconfigured: false,
      };
    }
  }, [mode, targetDate, startDate, timezone, now]);
};
