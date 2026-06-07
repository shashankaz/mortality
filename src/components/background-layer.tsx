import { useSettings } from "../context/settings-context";
import type { Theme } from "../types";
import { BUILTIN_BACKGROUNDS } from "../utils/backgrounds";

const THEME_OVERLAY: Record<Theme, string> = {
  dark: "0, 0, 0",
  forest: "0, 40, 20",
  ocean: "0, 15, 50",
  sunset: "50, 10, 0",
};

export const BackgroundLayer = () => {
  const { settings, backgroundImageData } = useSettings();

  const {
    backgroundType,
    backgroundUrl,
    builtinIndex,
    theme,
    blurIntensity,
    overlayOpacity,
  } = settings;

  const bgImage =
    backgroundType === "local" && backgroundImageData
      ? backgroundImageData
      : backgroundType === "url" && backgroundUrl
        ? backgroundUrl
        : (BUILTIN_BACKGROUNDS[builtinIndex % BUILTIN_BACKGROUNDS.length]
            ?.path ?? BUILTIN_BACKGROUNDS[0].path);

  const opacity = overlayOpacity / 100;
  const rgb = THEME_OVERLAY[theme];
  const overlayColor = `rgba(${rgb}, ${opacity})`;

  return (
    <>
      <div
        className="fixed inset-0 bg-neutral-950"
        style={{
          backgroundImage: `url("${bgImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : undefined,
          transform: blurIntensity > 0 ? "scale(1.06)" : undefined,
        }}
      />

      <div
        className="fixed inset-0 transition-all duration-700"
        style={{ background: overlayColor }}
      />
    </>
  );
};
