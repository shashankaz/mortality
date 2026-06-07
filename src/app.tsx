import { useEffect, useState } from "react";

import { BackgroundLayer } from "./components/background-layer";
import { SettingsDrawer } from "./components/settings-drawer";
import { TimerDisplay } from "./components/timer-display";
import { useSettings } from "./context/settings-context";

const GearIcon = () => {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
};

export const App = () => {
  const { loading } = useSettings();

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSettingsOpen(true);
      }
      if (e.key === "Escape") setSettingsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-950">
        <div className="text-xs tracking-[0.3em] text-white/20 uppercase">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <BackgroundLayer />

      <main className="relative z-10 flex h-full items-center justify-center px-4">
        <div style={{ animation: "fadeIn 0.6s ease-out both" }}>
          <TimerDisplay />
        </div>
      </main>

      <button
        onClick={() => setSettingsOpen(true)}
        title="Settings (S)"
        className="fixed top-5 right-5 z-30 rounded-xl border border-white/15 bg-white/8 p-2.5 text-white/45 backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:bg-white/16 hover:text-white"
        aria-label="Open settings"
      >
        <GearIcon />
      </button>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
