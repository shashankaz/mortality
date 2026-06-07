import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { FS, H, HALF, W } from "../constants";

const FACE: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: FS,
  fontWeight: 900,
  color: "#ffffff",
  fontFamily: "inherit",
  lineHeight: 1,
  background: "rgba(255, 255, 255, 0.07)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 12,
  boxShadow:
    "0 4px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
  userSelect: "none",
};

interface FlipDigitProps {
  digit: string;
}

export const FlipDigit = ({ digit }: FlipDigitProps) => {
  const [curr, setCurr] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  const lastRef = useRef(digit);

  useEffect(() => {
    if (digit === lastRef.current) return;

    setPrev(lastRef.current);
    setCurr(digit);
    setFlipping(true);
    lastRef.current = digit;

    const id = setTimeout(() => setFlipping(false), 380);

    return () => clearTimeout(id);
  }, [digit]);

  return (
    <div style={{ position: "relative", width: W, height: H, flexShrink: 0 }}>
      <div style={FACE}>
        {curr}

        <div
          style={{
            position: "absolute",
            top: HALF,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 10,
          }}
        />
      </div>

      {flipping && (
        <>
          <div
            style={{
              ...FACE,
              clipPath: `inset(0 0 ${HALF}px 0 round 12px 12px 0 0)`,
              transformOrigin: "50% 100%",
              animation: "flipFold 360ms ease-in forwards",
              zIndex: 5,
            }}
          >
            {prev}
          </div>

          <div
            style={{
              ...FACE,
              clipPath: `inset(${HALF}px 0 0 0 round 0 0 12px 12px)`,
              transformOrigin: "50% 0%",
              animation: "flipUnfold 360ms ease-out forwards",
              zIndex: 5,
            }}
          >
            {curr}
          </div>
        </>
      )}
    </div>
  );
};
