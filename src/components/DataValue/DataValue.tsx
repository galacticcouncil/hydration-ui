import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { TextProps } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import Skeleton from "react-loading-skeleton"
import { SText } from "./DataValue.styled"
import { ResponsiveValue } from "utils/responsive"

type DataValueSize = "small" | "medium" | "large" | "extra-large"

const LABEL_SIZES: Record<DataValueSize, TextProps> = {
  small: {
    fs: 13,
    lh: 16,
  },
  medium: {
    fs: 14,
    lh: 16,
  },
  large: {
    fs: 14,
    lh: 16,
  },
  "extra-large": {
    fs: [14, 16],
    lh: [14, 16],
  },
}

const VALUE_SIZES: Record<DataValueSize, TextProps> = {
  small: {
    fs: 14,
    lh: 14,
  },
  medium: {
    fs: 19,
    lh: 19,
  },
  large: {
    fs: [19, 24],
    lh: [19, 24],
  },
  "extra-large": {
    fs: [19, 38],
    lh: [19, 38],
  },
}

const SKELETON_SIZES: Record<DataValueSize, ResponsiveValue<number>> = {
  small: 80,
  medium: 100,
  large: [100, 140],
  "extra-large": [100, 160],
}

export type DataValueProps = {
  label: ReactNode
  children?: ReactNode
  className?: string
  tooltip?: ReactNode
  size?: DataValueSize
  font?: TextProps["font"]
  labelColor?: TextProps["color"]
  isLoading?: boolean
  disableSkeletonAnimation?: boolean
}

export const DataValue: React.FC<DataValueProps> = ({
  label,
  children,
  className,
  tooltip,
  size = "medium",
  font = "GeistMedium",
  labelColor = "white",
  isLoading = false,
  disableSkeletonAnimation = false,
}) => {
  return (
    <div className={className}>
      <div sx={{ flex: "column", gap: size === "small" ? 4 : 8 }}>
        <SText
          as="div"
          color={labelColor}
          font="GeistMono"
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
          {isLoading ? (
            <Skeleton
              sx={{ width: SKELETON_SIZES[size] }}
              height="1em"
              enableAnimation={!disableSkeletonAnimation}
            />
          ) : (
            children
          )}
        </SText>
      </div>
    </div>
  )
}
