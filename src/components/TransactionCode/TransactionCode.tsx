import ReactJson, { ReactJsonViewProps } from "react-json-view"
import { theme } from "theme"

export const TransactionCode = (props: ReactJsonViewProps) => (
  <ReactJson
    indentWidth={5}
    collapseStringsAfterLength={false}
    quotesOnKeys={false}
    shouldCollapse={false}
    enableClipboard={false}
    displayObjectSize={false}
    displayDataTypes={false}
    theme={{
      base00: `transparent`,
      base01: "#ddd",
      base02: `rgba(${theme.rgbColors.alpha0}, .06)`,
      base03: "white",
      base04: "purple",
      base05: "white",
      base06: "white",
      base07: theme.colors.basic100,
      base08: "#444",
      base09: theme.colors.brightBlue200Alpha,
      base0A: "rgba(70, 70, 230, 0)",
      base0B: "rgba(70, 70, 230, 0)",
      base0C: "rgba(70, 70, 230, 0)",
      base0D: theme.colors.warning300,
      base0E: theme.colors.basic100,
      base0F: "rgba(70, 70, 230, 1)",
    }}
    {...props}
    style={{
      fontFamily: "ChakraPetch",
      fontSize: "12px",
      position: "relative",
    }}
  />
)
