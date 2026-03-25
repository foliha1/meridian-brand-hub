// ─────────────────────────────────────────────
// BRAND CONFIG — Single source of truth
// To deploy for a new client, edit only this file.
// All UI components read from this config.
// ─────────────────────────────────────────────

export interface BrandConfig {
  brand: { name: string; logo: string };
  colors: Record<string, { hex: string; name: string }>;
  typography: {
    display: { family: string; weights: number[]; sizes: Record<string, string> };
    body: { family: string; weights: number[]; sizes: Record<string, string> };
  };
  spacing: { base: number; scale: number[] };
  grid: { columns: number; gutter: number; snap: boolean };
  canvasPresets: { name: string; width: number; height: number }[];
}

export const brandConfig: BrandConfig = {
  brand: { name: "Meridian Transit", logo: "/logo.svg" },
  colors: {
    primary: { hex: "#0A2463", name: "Deep Navy" },
    secondary: { hex: "#3E92CC", name: "Sky Line" },
    accent: { hex: "#D8315B", name: "Signal Red" },
    neutral: { hex: "#F2F4F3", name: "Platform Gray" },
    dark: { hex: "#1B1B1E", name: "Tunnel Black" },
  },
  typography: {
    display: { family: "DM Sans", weights: [700, 800], sizes: { xl: "64px", lg: "48px", md: "32px" } },
    body: { family: "DM Sans", weights: [400, 500], sizes: { lg: "20px", md: "16px", sm: "14px", xs: "12px" } },
  },
  spacing: { base: 8, scale: [4, 8, 12, 16, 24, 32, 48, 64, 96] },
  grid: { columns: 12, gutter: 24, snap: true },
  canvasPresets: [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "LinkedIn Post", width: 1200, height: 627 },
    { name: "Twitter/X Post", width: 1600, height: 900 },
    { name: "Facebook Cover", width: 1640, height: 924 },
    { name: "Print A4", width: 2480, height: 3508 },
    { name: "Print A3", width: 3508, height: 4961 },
    { name: "Presentation 16:9", width: 1920, height: 1080 },
  ],
};

export const brandColorArray = Object.entries(brandConfig.colors).map(([key, value]) => ({
  key,
  hex: value.hex,
  name: value.name,
}));
