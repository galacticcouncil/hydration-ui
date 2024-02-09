import { TextProps } from "components/Typography/Text/Text"
import { ReactNode } from "react"

import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { SText } from "./DataValue.styled"

const LABEL_SIZES: Record<string, TextProps> = {
  small: {
    fs: 12,
    lh: 12,
  },
  medium: {
    fs: 14,
    lh: 14,
  },
  large: {
    fs: [14, 16],
    lh: [14, 16],
  },
}

const VALUE_SIZES: Record<string, TextProps> = {
  small: {
    fs: 14,
    lh: 14,
  },
  medium: {
    fs: 19,
    lh: 19,
  },
  large: {
    fs: [19, 38],
    lh: [19, 38],
  },
}

export type DataValueProps = {
  label: string
  children: ReactNode
  className?: string
  tooltip?: string
  size?: keyof typeof VALUE_SIZES
  font?: TextProps["font"]
  labelColor?: TextProps["color"]
}

export const DataValue: React.FC<DataValueProps> = ({
  label,
  children,
  className,
  tooltip,
  size = "medium",
  font = "FontOver",
  labelColor = "white",
}) => {
  return (
    <div className={className}>
      <div sx={{ flex: "column", gap: size === "small" ? 4 : 8 }}>
        <SText
          as="div"
          color={labelColor}
          {...LABEL_SIZES[size]}
          sx={{ flex: "row", gap: 4, align: "center" }}
        >
          {label}
          {tooltip && (
            <InfoTooltip text={tooltip}>
              <SInfoIcon />
            </InfoTooltip>
          )}
        </SText>
        <SText as="div" font={font} {...VALUE_SIZES[size]}>
          {children}
        </SText>
      </div>
    </div>
  )
}
