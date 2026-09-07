export const COLORS = {
  ink: "#1B2333",
  paper: "#F6F2EA",
  paperDeep: "#EFE9DC",
  text: "#20232B",
  textMuted: "#5C6270",
  gold: "#C98A2C",
  goldDeep: "#A66F1E",
  teal: "#2F7D5C",
  wine: "#7A3247",
  line: "#DFD8C8",
};

export const INTERVALS_DAYS = [1, 2, 4, 8, 16, 32];

export function nextReviewOffset(streak) {
  const idx = Math.min(streak, INTERVALS_DAYS.length - 1);
  return INTERVALS_DAYS[idx];
}
