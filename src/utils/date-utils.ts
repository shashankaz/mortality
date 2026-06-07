import type { TimeComponents } from "../types";

export const parseDateInTimezone = (dateStr: string, tz: string): Date => {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0],
    month = parts[1],
    day = parts[2];
  if (!year || !month || !day) return new Date(NaN);

  const ref = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(ref);

  const p: Record<string, number> = {};
  for (const { type, value } of fmt) {
    if (type !== "literal") p[type] = Number(value);
  }

  const hour = p.hour === 24 ? 0 : p.hour;
  const dayDiff =
    p.day !== day ? (p.month !== month || p.day > day ? 1 : -1) : 0;
  const localSecsFromMidnight =
    (dayDiff * 24 + hour) * 3600 + p.minute * 60 + p.second;
  const offsetSecs = localSecsFromMidnight - 12 * 3600;

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offsetSecs * 1000);
};

export const getTimeDiff = (from: Date, to: Date): TimeComponents => {
  const start = from.getTime() <= to.getTime() ? from : to;
  const end = from.getTime() <= to.getTime() ? to : from;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const daysInPrevMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0,
    ).getDate();
    days += daysInPrevMonth;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
  const totalWeeks = Math.floor(totalDays / 7);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalWeeks,
  };
};

export const pad = (n: number): string => {
  return String(n).padStart(2, "0");
};
