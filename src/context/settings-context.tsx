import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { useStorage } from "../hooks/use-storage";
import type { AppSettings } from "../types";
import { randomBuiltinIndex } from "../utils/backgrounds";

const DEFAULT_SETTINGS: AppSettings = {
  mode: "countdown",
  startDate: "",
  targetDate: "",
  backgroundType: "builtin",
  backgroundUrl: "",
  builtinIndex: randomBuiltinIndex(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme: "dark",
  showStats: true,
  blurIntensity: 4,
  overlayOpacity: 35,
};

interface SettingsContextType {
  settings: AppSettings;
  backgroundImageData: string;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateBackgroundImage: (data: string) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [rawSettings, saveSettings, settingsLoading] = useStorage<
    Partial<AppSettings>
  >("settings", {}, "sync");

  const [backgroundImageData, saveBgImage, bgLoading] = useStorage<string>(
    "background_image",
    "",
    "local",
  );

  const settings = useMemo<AppSettings>(
    () => ({ ...DEFAULT_SETTINGS, ...rawSettings }),
    [rawSettings],
  );

  const settingsRef = useRef<AppSettings>(settings);
  settingsRef.current = settings;

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      const next = { ...settingsRef.current, ...partial };
      void saveSettings(next);
    },
    [saveSettings],
  );

  const updateBackgroundImage = useCallback(
    async (data: string): Promise<void> => {
      await saveBgImage(data);
    },
    [saveBgImage],
  );

  const value = useMemo<SettingsContextType>(
    () => ({
      settings,
      backgroundImageData,
      updateSettings,
      updateBackgroundImage,
      loading: settingsLoading || bgLoading,
    }),
    [
      settings,
      backgroundImageData,
      updateSettings,
      updateBackgroundImage,
      settingsLoading,
      bgLoading,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings: () => SettingsContextType = () => {
  const ctx = useContext(SettingsContext);

  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");

  return ctx;
};
