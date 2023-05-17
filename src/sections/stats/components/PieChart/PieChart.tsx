import { useState } from "react"
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  PieProps,
  Cell,
} from "recharts"

const data = [
  { name: "Group A", value: 800 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 500 },
  { name: "Group D", value: 100 },
]

const COLORS = [
  { start: "#FFFFFF", end: "#FFFFFF" },
  { start: "#34c3ff", end: "#2876bd" },
  { start: "#da9d35", end: "#e96935" },
  { start: "#d11d35", end: "#e34935" },
]

type PieDataType = Required<NonNullable<PieProps["sectors"]>[number]>

const renderActiveShape = (props: PieDataType) => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export const PieChartComponent = () => {
  const [activeIndex, setIndex] = useState<number | undefined>(undefined)

  const onPieEnter = (data: any, index: number | undefined) => {
    setIndex(index)
  }

  const valueSum = data.reduce((acc, val) => {
    return (acc += val.value)
  }, 0)

  const test = data.reduce((acc, val, index) => {
    const length = (val.value / valueSum) * 360

    const startAngle = acc?.[index - 1]?.endAngle ?? 0
    const endAngle = startAngle + length
    return [...acc, { startAngle, endAngle }]
  }, [])

  //console.log(result, "result")
  //console.log(anglesSum, "anglesSum")
  //console.log(test, "test")
  // 338 : 360
  return (
    <div>
      <PieChart width={300} height={300}>
        <defs>
          {data.map((entry, index) => (
            <linearGradient
              id={`myGradient${index}`}
              x1={"100%"}
              y1={"100%"}
              x2={"0%"}
              y2={"0%"}
            >
              <stop
                offset="0%"
                stopColor={COLORS[index % COLORS.length].start}
                stopOpacity={0}
              />
              <stop
                offset="100%"
                stopColor={COLORS[index % COLORS.length].start}
                stopOpacity={1}
              />
            </linearGradient>
          ))}
        </defs>
        <defs>
          {data.map((entry, index) => (
            <linearGradient
              id={`myShadowGradient${index}`}
              x1={"0%"}
              y1={"100%"}
              x2={"0%"}
              y2={"0%"}
            >
              <stop
                offset="0%"
                stopColor={COLORS[index % COLORS.length].start}
                stopOpacity={0}
              />
              <stop
                offset="30%"
                stopColor={COLORS[index % COLORS.length].start}
                stopOpacity={0}
              />
              <stop
                offset="100%"
                stopColor={COLORS[index % COLORS.length].start}
                stopOpacity={0.2}
              />
            </linearGradient>
          ))}
        </defs>
        <Pie
          //startAngle={90}
          //endAngle={450}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          paddingAngle={3}
          //cx="200px"
          //cy="200px"
          innerRadius={120}
          outerRadius={140}
          //fill="#8884d8"
          dataKey="value"
          //onMouseEnter={onPieEnter}
          shapeRendering={120}
          //onMouseLeave={() => onPieEnter(null, undefined)}
        >
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={`url(#myGradient${index})`}
                stroke="0"
                style={
                  {
                    // filter: `drop-shadow(0px 0px 10px ${COLORS[index].start}`,
                  }
                }
              />
            )
          })}
        </Pie>
        <Pie
          //startAngle={90}
          //endAngle={450}
          //activeIndex={activeIndex}
          //activeShape={renderActiveShape}
          data={data}
          paddingAngle={3}
          //cx="200px"
          //cy="200px"
          innerRadius={100}
          outerRadius={120}
          //fill="#8884d8"
          dataKey="value"
          //onMouseEnter={onPieEnter}
          shapeRendering={120}
          //onMouseLeave={() => onPieEnter(null, undefined)}
        >
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={`url(#myShadowGradient${index})`}
                stroke="0"
                style={
                  {
                    //filter: `drop-shadow(0px 0px 10px ${COLORS[index].start}`,
                  }
                }
              />
            )
          })}
        </Pie>
      </PieChart>
    </div>
  )
}
