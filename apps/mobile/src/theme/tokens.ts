export type ThemeMode = "light" | "dark";

export interface ThemeTokens {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  danger: string;
}

export const lightTheme: ThemeTokens = {
  mode: "light",
  background: "#F7F4EF",
  surface: "#FFFFFF",
  surfaceMuted: "#EFE7DE",
  text: "#201B18",
  textMuted: "#665C55",
  border: "#D8CEC5",
  accent: "#1F6F5B",
  accentText: "#FFFFFF",
  danger: "#A43838"
};

export const darkTheme: ThemeTokens = {
  mode: "dark",
  background: "#121417",
  surface: "#1C2026",
  surfaceMuted: "#272D35",
  text: "#F7F4EF",
  textMuted: "#C7BFB6",
  border: "#39414B",
  accent: "#7CC7A8",
  accentText: "#102018",
  danger: "#FF8A8A"
};

export const themes = {
  light: lightTheme,
  dark: darkTheme
} as const;
