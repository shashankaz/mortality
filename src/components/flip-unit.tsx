import { INNER_GAP } from "../constants";
import { pad } from "../utils/date-utils";
import { FlipDigit } from "./flip-digit";

interface FlipUnitProps {
  value: number;
  label: string;
}

export const FlipUnit = ({ value, label }: FlipUnitProps) => {
  const padded = pad(value);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", gap: INNER_GAP }}>
        <FlipDigit digit={padded[0]} />
        <FlipDigit digit={padded[1]} />
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.22em",
          color: "rgba(255, 255, 255, 0.35)",
          textTransform: "uppercase",
          fontFamily: "inherit",
        }}
      >
        {label}
      </div>
    </div>
  );
};
