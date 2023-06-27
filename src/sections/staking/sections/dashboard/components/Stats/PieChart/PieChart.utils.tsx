const numLines = 41
const lineLength = 8
const startAnglePoint = 270

export const getRuleScaleLines = (radius: number) => {
  const center = { x: radius, y: radius }
  const lines = []

  const startAngle = startAnglePoint - 100
  const endAngle = startAnglePoint + 100

  for (let i = 0; i < numLines; i++) {
    const lineAngle =
      startAngle + ((endAngle - startAngle) * i) / (numLines - 1)
    const radians = (lineAngle * Math.PI) / 180

    const x1 = center.x + radius * Math.cos(radians)
    const y1 = center.y + radius * Math.sin(radians)
    const x2 = center.x + (radius - lineLength) * Math.cos(radians)
    const y2 = center.y + (radius - lineLength) * Math.sin(radians)

    lines.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(197, 220, 255, 0.58)"
        strokeOpacity={0.3}
      />,
    )
  }

  return lines
}
