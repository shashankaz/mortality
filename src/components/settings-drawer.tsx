import { useMemo, useRef, type ChangeEvent } from "react";

import { useSettings } from "../context/settings-context";
import type { BackgroundType, Theme, TimerMode } from "../types";
import { BUILTIN_BACKGROUNDS, randomBuiltinIndex } from "../utils/backgrounds";
import { cn } from "../utils/tailwind-merge";

const TIMEZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Paris",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const getTimezoneLabel = (tz: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());

    const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
    const city = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

    return `${offset} — ${city}`;
  } catch {
    return tz;
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const THEMES: { value: Theme; label: string; swatch: string }[] = [
  { value: "dark", label: "Dark", swatch: "bg-neutral-700" },
  { value: "forest", label: "Forest", swatch: "bg-green-900" },
  { value: "ocean", label: "Ocean", swatch: "bg-blue-900" },
  { value: "sunset", label: "Sunset", swatch: "bg-orange-800" },
];

const BG_TABS: { value: BackgroundType; label: string }[] = [
  { value: "builtin", label: "Wallpapers" },
  { value: "url", label: "URL" },
  { value: "local", label: "Upload" },
];

const SectionHeading = ({ children }: { children: string }) => {
  return (
    <h3 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
      {children}
    </h3>
  );
};

export const SettingsDrawer = ({ open, onClose }: Props) => {
  const {
    settings,
    updateSettings,
    updateBackgroundImage,
    backgroundImageData,
  } = useSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      void updateBackgroundImage(data);
      updateSettings({ backgroundType: "local" });
    };
    reader.readAsDataURL(file);
  };

  const tzOptions = useMemo(
    () =>
      TIMEZONES.includes(settings.timezone)
        ? TIMEZONES
        : [settings.timezone, ...TIMEZONES],
    [settings.timezone],
  );

  const handleClear = () => {
    void updateBackgroundImage("");

    updateSettings({
      backgroundType: "builtin",
      builtinIndex: randomBuiltinIndex(),
    });
  };

  const handleRandom = () => {
    updateSettings({
      backgroundType: "builtin",
      builtinIndex: randomBuiltinIndex(),
    });
  };

  const activeTab: BackgroundType =
    (settings.backgroundType as string) === "none"
      ? "builtin"
      : settings.backgroundType;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-80 flex-col border-l border-white/10 bg-neutral-950/95 shadow-[−8px_0_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-in-out will-change-transform sm:w-96",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
          <span className="font-semibold tracking-wide text-white">
            Settings
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Close settings"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="scrollbar-hide flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <section>
            <SectionHeading>Timer Mode</SectionHeading>
            <div className="flex gap-2">
              {(["countdown", "elapsed"] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => updateSettings({ mode: m })}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all duration-150",
                    settings.mode === m
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/8 text-white/50 hover:bg-white/15 hover:text-white",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading>
              {settings.mode === "countdown" ? "Target Date" : "Start Date"}
            </SectionHeading>
            {settings.mode === "countdown" ? (
              <input
                type="date"
                value={settings.targetDate}
                onChange={(e) => updateSettings({ targetDate: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white transition-all focus:border-white/35 focus:bg-white/12 focus:outline-none"
              />
            ) : (
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => updateSettings({ startDate: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white transition-all focus:border-white/35 focus:bg-white/12 focus:outline-none"
              />
            )}
          </section>

          <section>
            <SectionHeading>Timezone</SectionHeading>
            <div className="relative">
              <select
                value={settings.timezone}
                onChange={(e) => updateSettings({ timezone: e.target.value })}
                className="w-full cursor-pointer appearance-none rounded-lg border border-white/15 bg-white/8 py-2.5 pr-8 pl-3 text-sm text-white transition-all focus:border-white/35 focus:bg-white/12 focus:outline-none"
              >
                {tzOptions.map((tz) => (
                  <option
                    key={tz}
                    value={tz}
                    className="bg-neutral-900 text-white"
                  >
                    {getTimezoneLabel(tz)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-white/35">
                ▾
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Background</SectionHeading>

            <div className="mb-4 flex gap-1.5">
              {BG_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => updateSettings({ backgroundType: tab.value })}
                  className={cn(
                    "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-150",
                    activeTab === tab.value
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/8 text-white/50 hover:bg-white/15 hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "builtin" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {BUILTIN_BACKGROUNDS.map((bg, i) => (
                    <button
                      key={bg.path}
                      onClick={() =>
                        updateSettings({
                          backgroundType: "builtin",
                          builtinIndex: i,
                        })
                      }
                      className={cn(
                        "relative overflow-hidden rounded-lg transition-all duration-150",
                        settings.backgroundType === "builtin" &&
                          settings.builtinIndex === i
                          ? "scale-[1.03] ring-2 ring-white/80"
                          : "ring-1 ring-white/15 hover:ring-white/40",
                      )}
                      title={bg.name}
                    >
                      <img
                        src={bg.path}
                        alt={bg.name}
                        className="block w-full object-cover"
                        style={{ height: 56 }}
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] leading-tight text-white/80">
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRandom}
                  className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white/55 transition-all duration-150 hover:border-white/28 hover:bg-white/12 hover:text-white"
                >
                  ⟳&nbsp;&nbsp;Random Wallpaper
                </button>
              </div>
            )}

            {activeTab === "url" && (
              <div className="space-y-2.5">
                <input
                  type="url"
                  placeholder="https://…/image.jpg"
                  value={settings.backgroundUrl}
                  onChange={(e) =>
                    updateSettings({ backgroundUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white placeholder-white/25 transition-all focus:border-white/35 focus:bg-white/12 focus:outline-none"
                />
                <button
                  onClick={handleClear}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/35 transition-all duration-150 hover:border-red-500/30 hover:bg-red-950/30 hover:text-red-400"
                >
                  Clear Background
                </button>
              </div>
            )}

            {activeTab === "local" && (
              <div className="space-y-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border border-dashed border-white/20 bg-white/8 px-4 py-3 text-sm text-white/50 transition-all duration-150 hover:border-white/35 hover:bg-white/12 hover:text-white"
                >
                  {backgroundImageData
                    ? "Replace image"
                    : "Click to upload image"}
                </button>
                {backgroundImageData && (
                  <button
                    onClick={handleClear}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/35 transition-all duration-150 hover:border-red-500/30 hover:bg-red-950/30 hover:text-red-400"
                  >
                    Clear Background
                  </button>
                )}
              </div>
            )}
          </section>

          <section>
            <SectionHeading>Theme</SectionHeading>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateSettings({ theme: t.value })}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    settings.theme === t.value
                      ? "border border-white/30 bg-white/15 text-white"
                      : "border border-transparent bg-white/5 text-white/50 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full ${t.swatch} shrink-0 ring-1 ring-white/25`}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading>Visual Options</SectionHeading>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/65">Show Statistics</span>
                <button
                  role="switch"
                  aria-checked={settings.showStats}
                  onClick={() =>
                    updateSettings({ showStats: !settings.showStats })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none",
                    settings.showStats ? "bg-white" : "bg-white/20",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full shadow transition-transform duration-200",
                      settings.showStats
                        ? "translate-x-6 bg-black"
                        : "translate-x-1 bg-white/50",
                    )}
                  />
                </button>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-white/65">Background Blur</span>
                  <span className="text-sm text-white/35 tabular-nums">
                    {settings.blurIntensity}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={settings.blurIntensity}
                  onChange={(e) =>
                    updateSettings({ blurIntensity: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white"
                />
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-white/65">Overlay Opacity</span>
                  <span className="text-sm text-white/35 tabular-nums">
                    {settings.overlayOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={settings.overlayOpacity}
                  onChange={(e) =>
                    updateSettings({ overlayOpacity: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="shrink-0 border-t border-white/8 px-6 py-4">
          <p className="text-center text-xs tracking-wider text-white/18">
            Press <kbd className="font-mono">ESC</kbd> to close ·{" "}
            <kbd className="font-mono">S</kbd> to open
          </p>
        </div>
      </aside>
    </>
  );
};
