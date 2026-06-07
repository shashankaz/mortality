import { useSettings } from "../context/settings-context";
import { useTimer } from "../hooks/use-timer";
import { FlipClock } from "./flip-clock";
import { StatCard } from "./stat-card";

const UnconfiguredState = ({ mode }: { mode: "countdown" | "elapsed" }) => {
  return (
    <div className="flex flex-col items-center justify-center px-8 text-center select-none">
      <div className="mb-8 text-9xl leading-none font-thin text-white/10">
        ∞
      </div>
      <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white/60">
        No date configured
      </h2>
      <p className="max-w-sm text-base leading-relaxed text-white/30">
        Press{" "}
        <kbd className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-sm text-white/60">
          S
        </kbd>{" "}
        or click the settings icon to set your{" "}
        {mode === "countdown" ? "target date" : "start date"}.
      </p>
    </div>
  );
};

const ExpiredState = ({ totalDays }: { totalDays: number }) => {
  return (
    <div className="flex flex-col items-center justify-center px-8 text-center select-none">
      <div className="mb-6 text-8xl">🎯</div>
      <h2 className="mb-4 text-6xl font-black tracking-tight text-white">
        Time's Up
      </h2>
      <p className="text-xl text-white/40">Your target date has passed.</p>
      <p className="mt-3 text-sm text-white/25">
        {totalDays.toLocaleString()} days ago
      </p>
    </div>
  );
};

export const TimerDisplay = () => {
  const { settings } = useSettings();
  const { mode, targetDate, startDate, showStats, timezone } = settings;

  const { time, isExpired, isUnconfigured } = useTimer(
    mode,
    targetDate,
    startDate,
    timezone,
  );

  if (isUnconfigured) return <UnconfiguredState mode={mode} />;

  if (isExpired && mode === "countdown")
    return <ExpiredState totalDays={time?.totalDays ?? 0} />;

  if (!time) return null;

  const refDate = mode === "countdown" ? targetDate : startDate;
  const refLabel = mode === "countdown" ? "Until" : "Since";
  const formattedRef = refDate
    ? new Date(refDate + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const stats =
    mode === "countdown"
      ? [
          { label: "Days Remaining", value: time.totalDays.toLocaleString() },
          { label: "Weeks Remaining", value: time.totalWeeks.toLocaleString() },
          { label: "Hours Remaining", value: time.totalHours.toLocaleString() },
        ]
      : [
          { label: "Days Passed", value: time.totalDays.toLocaleString() },
          { label: "Weeks Passed", value: time.totalWeeks.toLocaleString() },
          {
            label: "Years Passed",
            value: (time.years + time.months / 12).toFixed(1),
          },
        ];

  return (
    <div className="flex flex-col items-center gap-10 select-none">
      <FlipClock time={time} />

      {formattedRef && (
        <p className="text-xs font-medium tracking-[0.22em] text-white/22 uppercase">
          {refLabel}&nbsp;&nbsp;{formattedRef}
        </p>
      )}

      {showStats && (
        <div className="flex gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}
    </div>
  );
};
