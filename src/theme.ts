import { mapObj } from "utils/object";

const hexToRgb = (hex: string) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const tmp = hex.replace(
    shorthandRegex,
    (m, r, g, b) => r + r + g + g + b + b
  );

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(tmp);
  return [
    parseInt(result![1], 16),
    parseInt(result![2], 16),
    parseInt(result![3], 16),
  ].join(",");
};

const breakpoints = {
  smallTablet: 640,
  tablet: 850,
  desktop: 1280,
  lgDesktop: 1440,
};

const colors = {
  white: "#ffffff",
  black: "#000000",
  primarySuccess500: "#49E49F",
  primarySuccess450: "#4CF3A8",
  primarySuccess400: "#4FFFB0",
  primarySuccess300: "#8AFFCB",
  primarySuccess200: "#B8FFDF",
  primarySuccess100: "#DAFFEE",
  backgroundGray1000: "#1C1A1F",
  backgroundGray900: "#211F24",
  backgroundGray800: "#26282F",
  backgroundGray700: "#44444A",
  backgroundGray600: "#51515F",
  backgroundGray500: "#686876",
  neutralGray500: "#787E82",
  neutralGray400: "#A2B0B8",
  neutralGray300: "#9EA9B1",
  neutralGray200: "#D1DEE8",
  neutralGray100: "#E5ECF1",
  darkGreen: "#1D2D26",
  darkGray: "#1A171B",
};

const gradients = {
  primaryGradient:
    "linear-gradient(90deg, #4FFFB0 1.27%, #B3FF8F 48.96%, #FF984E 104.14%), linear-gradient(90deg, #4FFFB0 1.27%, #A2FF76 53.24%, #FF984E 104.14%), linear-gradient(90deg, #FFCE4F 1.27%, #4FFFB0 104.14%)",
  verticalGradient:
    "radial-gradient(89.2% 89.2% at 50.07% 87.94%, #008A69 0%, #262F31 88.52%), #2C3335;",
  simplifiedGradient: "90deg, #4fffb0, #b3ff8f, #ff984e",
  cardGradient:
    "linear-gradient(180deg, #1C2527 0%, #14161A 80.73%, #121316 100%)",
};

const zIndices = {};

export const theme = {
  colors,
  gradients,
  rgbColors: mapObj(hexToRgb, colors),
  zIndices,
  breakpoints,
  mq: mapObj((x: number) => `@media (min-width: ${x}px)`, breakpoints),
};
