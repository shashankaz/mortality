export type TimerMode = "countdown" | "elapsed";
export type Theme = "dark" | "forest" | "ocean" | "sunset";
export type BackgroundType = "builtin" | "url" | "local";

export interface AppSettings {
  mode: TimerMode;
  startDate: string;
  targetDate: string;
  backgroundType: BackgroundType;
  backgroundUrl: string;
  builtinIndex: number;
  timezone: string;
  theme: Theme;
  showStats: boolean;
  blurIntensity: number;
  overlayOpacity: number;
}

export interface TimeComponents {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalWeeks: number;
}
