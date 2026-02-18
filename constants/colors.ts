const palette = {
  midnight: "#0A0E1A",
  deepNavy: "#111827",
  slate: "#1E293B",
  slateLight: "#334155",
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  amberDim: "rgba(245, 158, 11, 0.15)",
  coral: "#F97316",
  coralDim: "rgba(249, 115, 22, 0.12)",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  cardBg: "#1E293B",
  cardBorder: "rgba(148, 163, 184, 0.1)",
  success: "#10B981",
  error: "#EF4444",
  white: "#FFFFFF",
};

export default {
  light: {
    text: palette.textPrimary,
    background: palette.midnight,
    tint: palette.amber,
    tabIconDefault: palette.textMuted,
    tabIconSelected: palette.amber,
  },
  palette,
};
