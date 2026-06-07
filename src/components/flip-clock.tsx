import { H, UNIT_PAD } from "../constants";
import type { TimeComponents } from "../types";
import { FlipUnit } from "./flip-unit";

interface FlipClockProps {
  time: TimeComponents;
}

const CLOCK_UNITS: Array<{
  field: keyof Pick<
    TimeComponents,
    "years" | "months" | "days" | "hours" | "minutes" | "seconds"
  >;
  label: string;
}> = [
  { field: "years", label: "Years" },
  { field: "months", label: "Months" },
  { field: "days", label: "Days" },
  { field: "hours", label: "Hours" },
  { field: "minutes", label: "Minutes" },
  { field: "seconds", label: "Seconds" },
];

export const FlipClock = ({ time }: FlipClockProps) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {CLOCK_UNITS.map((u, i) => (
        <div
          key={u.field}
          style={{ display: "flex", alignItems: "flex-start" }}
        >
          <div style={{ padding: `0 ${UNIT_PAD}px` }}>
            <FlipUnit value={time[u.field]} label={u.label} />
          </div>
          {i < CLOCK_UNITS.length - 1 && (
            <div
              style={{
                width: 1,
                height: H,
                background: "rgba(255, 255, 255, 0.08)",
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
