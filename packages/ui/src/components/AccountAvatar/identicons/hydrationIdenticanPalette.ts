import { IdenticanPalette } from "@/components/AccountAvatar/identicons/identican"

const HYDRATION_IDENTICAN_CAN_COLORS = [
  "#E53E76",
  "#CC1775",
  "#DE394D",
  "#53A4F3",
  "#043875",
  "#36154B",
  "#2B1D3C",
  "#B3CF92",
]

const HYDRATION_IDENTICAN_PATTERN_COLORS = [
  "#240E32",
  "#111A15",
  "#98AFFF",
  "#BFFF98",
  "#F9AFCA",
  "#AAEEFC",
  "#E53E76",
  "#DFB1F3",
]

const HYDRATION_LIGHT_IDENTICAN_PALETTE: IdenticanPalette = {
  backgrounds: [
    "#FFDEEC",
    "#E7ECE1",
    "#B3D7FA",
    "#DFB1F3",
    "#AAEEFC",
    "#F9AFCA",
    "#98AFFF",
  ],
  cans: HYDRATION_IDENTICAN_CAN_COLORS,
  patterns: HYDRATION_IDENTICAN_PATTERN_COLORS,
}

const HYDRATION_DARK_IDENTICAN_PALETTE: IdenticanPalette = {
  backgrounds: ["#240E32", "#36154B", "#2B1D3C", "#111A15", "#043875"],
  cans: HYDRATION_IDENTICAN_CAN_COLORS,
  patterns: HYDRATION_IDENTICAN_PATTERN_COLORS,
}

export const getHydrationIdenticanPalette = (theme: "light" | "dark") =>
  theme === "dark"
    ? HYDRATION_DARK_IDENTICAN_PALETTE
    : HYDRATION_LIGHT_IDENTICAN_PALETTE
