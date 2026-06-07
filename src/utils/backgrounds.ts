export interface BuiltinBackground {
  path: string;
  name: string;
}

export const BUILTIN_BACKGROUNDS: BuiltinBackground[] = [
  { path: "./backgrounds/bg-aurora.svg", name: "Aurora" },
  { path: "./backgrounds/bg-ocean.svg", name: "Ocean" },
  { path: "./backgrounds/bg-ember.svg", name: "Ember" },
  { path: "./backgrounds/bg-forest.svg", name: "Forest" },
  { path: "./backgrounds/bg-cosmic.svg", name: "Cosmic" },
  { path: "./backgrounds/bg-rose.svg", name: "Rose" },
  { path: "./backgrounds/sample-1.jpg", name: "Photo I" },
  { path: "./backgrounds/sample-2.jpg", name: "Photo II" },
  { path: "./backgrounds/sample-3.jpg", name: "Photo III" },
  { path: "./backgrounds/sample-4.jpg", name: "Photo IV" },
  { path: "./backgrounds/sample-5.jpg", name: "Photo V" },
  { path: "./backgrounds/sample-6.jpg", name: "Photo VI" },
];

export const randomBuiltinIndex = (): number => {
  return Math.floor(Math.random() * BUILTIN_BACKGROUNDS.length);
};
