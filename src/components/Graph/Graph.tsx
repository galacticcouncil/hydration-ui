import React, { FC } from "react"
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { StyledChart } from "components/Graph/Graph.styled"
import { theme } from "theme"

const tickProps = {
  stroke: theme.colors.white,
  fontSize: 13,
  fontWeight: 100,
  strokeWidth: 0.5,
  letterSpacing: 0.5,
}

const labelProps = {
  offset: 0,
  fill: theme.colors.yellow300,
  fontSize: 13,
  letterSpacing: 0.5,
}

type Props = {
  data: { x: number; y: number }[]
  labelX?: string
  labelY?: string
}

export const Graph: FC<Props> = ({ data, labelX, labelY }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <StyledChart
        data={data}
        margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
      >
        <CartesianGrid stroke={theme.colors.white} opacity={0.12} />
        <XAxis
          padding={{ left: 16, right: 16 }}
          axisLine={false}
          tickLine={false}
          name={labelX}
          tick={tickProps}
          type="number"
          dataKey="x"
          label={{
            value: labelX,
            position: "bottom",
            ...labelProps,
          }}
        />
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
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.colors.graphGradient0} />
            <stop offset="50%" stopColor={theme.colors.graphGradient50} />
            <stop offset="100%" stopColor={theme.colors.graphGradient100} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="y"
          stroke="url(#lineGradient)"
          strokeLinecap="round"
          strokeWidth={4}
          dot={false}
        />
      </StyledChart>
    </ResponsiveContainer>
  )
}
