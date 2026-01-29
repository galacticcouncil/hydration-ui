import darkJSON from "./dark.json"
import lightJSON from "./light.json"

interface ScalesWithDeprecatedProps
  extends Omit<typeof lightJSON.scales, "paddings" | "cornerRadius"> {
  /** @deprecated use `theme.space.<size>` instead */
  paddings: typeof lightJSON.scales.paddings
  /** @deprecated use `theme.radii.<size>` instead */
  cornerRadius: typeof lightJSON.scales.cornerRadius
}

export type TokenProps = Omit<
  typeof lightJSON,
  "scales" | "lineHeight" | "paragraphSize" | "headlineSize"
> & {
  /** @deprecated use `theme.lineHeights.<size>` instead */
  lineHeight: typeof lightJSON.lineHeight
  /** @deprecated use `theme.fontSizes.<size>` instead */
  paragraphSize: typeof lightJSON.paragraphSize
  /** @deprecated use `theme.fontSizes.<size>` instead */
  headlineSize: typeof lightJSON.headlineSize
  scales: ScalesWithDeprecatedProps
}

export const tokens = {
  dark: darkJSON,
  light: lightJSON,
}
