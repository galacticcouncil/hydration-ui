import {
  XAxis,
  AreaChart as RCAreaChart,
  CartesianGrid,
  Area,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { theme } from "theme"

const data = [
  {
    "name": "Page A",
    "uv": 4000,
    "pv": 2400,
    "amt": 2400
  },
  {
    "name": "Page B",
    "uv": 3000,
    "pv": 1398,
    "amt": 2210
  },
  {
    "name": "Page C",
    "uv": 2000,
    "pv": 9800,
    "amt": 2290
  },
  {
    "name": "Page D",
    "uv": 2780,
    "pv": 3908,
    "amt": 2000
  },
  {
    "name": "Page E",
    "uv": 1890,
    "pv": 4800,
    "amt": 2181
  },
  {
    "name": "Page F",
    "uv": 2390,
    "pv": 3800,
    "amt": 2500
  },
  {
    "name": "Page G",
    "uv": 3490,
    "pv": 4300,
    "amt": 2100
  }
]

export const AreaChart = () => {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ResponsiveContainer>
        <RCAreaChart data={data}>
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#85D1FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <Tooltip />
          <Area type="monotone" dataKey="uv" stroke="#85D1FF" fill="url(#color)" />
          <ReferenceLine
            y={3000}
            label={(p) => (
              <g>
                <foreignObject x={p.viewBox.x} y={p.viewBox.y - 12} width="100%" height="100%">
                  <span style={{ position: 'absolute', background: theme.colors.brightBlue300, padding: '2px 5px 2px 5px', borderRadius: '2px' }}>2 425 567</span>
                </foreignObject>
              </g>
            )}
            stroke="#66697C"
            strokeDasharray="2 4"
          />
        </RCAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
