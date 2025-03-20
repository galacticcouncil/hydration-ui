import { FC, memo, ReactElement } from "react"
import {
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { SChart } from "components/Graph/Graph.styled"
import { theme } from "theme"
import CurrentLoyaltyFactor from "assets/icons/CurrentLoyaltyFactor.svg?react"

const tickProps = {
  stroke: theme.colors.white,
  fontSize: 8,
  fontWeight: 100,
  strokeWidth: 0.5,
  letterSpacing: 0.5,
  fill: theme.colors.white,
}

const labelProps = {
  offset: 0,
  fill: theme.colors.brightBlue300,
  fontSize: 13,
  letterSpacing: 0.5,
}

type Props = {
  className?: string
  data: {
    x: number
    y: number
    current: boolean
    currentSecondary?: boolean
    currentThird?: boolean
  }[]
  labelX?: string | ReactElement
  labelY?: string | ReactElement
  withoutReferencedLine?: boolean
  offset?: {
    top?: number
    right?: number
    left?: number
    bottom?: number
  }
}

const CustomizedDot = ({
  payload,
  cx,
  cy,
}: {
  payload: Props["data"][0]
  cx: number
  cy: number
}) => {
  if (payload.current) {
    return <CurrentLoyaltyFactor x={cx - 10} y={cy - 10} color="white" />
  }

  if (payload.currentSecondary) {
    return <CurrentLoyaltyFactor x={cx - 10} y={cy - 10} color="#F0DA73" />
  }

  if (payload.currentThird) {
    return <CurrentLoyaltyFactor x={cx - 10} y={cy - 10} color="#57B3EB" />
  }

  return null
}
export const Graph: FC<Props> = memo(
  ({ data, labelX, labelY, withoutReferencedLine, offset, className }) => {
    const current = withoutReferencedLine
      ? undefined
      : data.find((point) => point.current)
    const currentSecondary = withoutReferencedLine
      ? undefined
      : data.find((point) => point.currentSecondary)

    const currentThird = withoutReferencedLine
      ? undefined
      : data.find((point) => point.currentThird)

    return (
      <ResponsiveContainer width="100%" height="100%" className={className}>
        <SChart data={data} margin={offset}>
          <CartesianGrid stroke={theme.colors.white} opacity={0.05} />
          {labelX && typeof labelX !== "string" ? (
            labelX
          ) : (
            <XAxis
              padding={{ left: 16, right: 16 }}
              axisLine={false}
              tickLine={false}
              name={labelX}
              tick={tickProps}
              type="number"
              tickCount={10}
              domain={[0, "auto"]}
              interval={0}
              dataKey="x"
              label={{
                value: labelX,
                position: "bottom",
                ...labelProps,
              }}
            />
          )}
          {labelY && typeof labelY !== "string" ? (
            labelY
          ) : (
            <YAxis
              padding={{ top: 16, bottom: 16 }}
              axisLine={false}
              tickLine={false}
              name={labelY}
              tick={tickProps}
              tickFormatter={(value) => `${value}%`}
              type="number"
              dataKey="y"
              label={{
                value: labelY,
                position: "insideLeft",
                angle: -90,
                dy: 50,
                ...labelProps,
              }}
            />
          )}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.colors.graphGradient0} />
              <stop offset="100%" stopColor={theme.colors.graphGradient100} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="y"
            stroke="url(#lineGradient)"
            strokeLinecap="round"
            strokeWidth={4}
            isAnimationActive={false}
            dot={(props) => <CustomizedDot {...props} key={props.key} />}
          />
          {withoutReferencedLine ? null : (
            <>
              <ReferenceLine
                stroke="white"
                strokeDasharray="3 3"
                segment={[
                  { y: current?.y, x: 0 },
                  { y: current?.y, x: current?.x },
                ]}
              />
              <ReferenceLine
                stroke="white"
                strokeDasharray="3 3"
                segment={[
                  { y: 0, x: current?.x },
                  { y: current?.y, x: current?.x },
                ]}
              />
              <ReferenceLine
                stroke="yellow"
                strokeDasharray="3 3"
                segment={[
                  { y: currentSecondary?.y, x: 0 },
                  { y: currentSecondary?.y, x: currentSecondary?.x },
                ]}
              />
              <ReferenceLine
                stroke="yellow"
                strokeDasharray="3 3"
                segment={[
                  { y: 0, x: currentSecondary?.x },
                  { y: currentSecondary?.y, x: currentSecondary?.x },
                ]}
              />
              <ReferenceLine
                stroke="black"
                strokeDasharray="3 3"
                segment={[
                  { y: currentThird?.y, x: 0 },
                  { y: currentThird?.y, x: currentThird?.x },
                ]}
              />
              <ReferenceLine
                stroke="black"
                strokeDasharray="3 3"
                segment={[
                  { y: 0, x: currentThird?.x },
                  { y: currentThird?.y, x: currentThird?.x },
                ]}
              />
            </>
          )}
        </SChart>
      </ResponsiveContainer>
    )
  },
)
