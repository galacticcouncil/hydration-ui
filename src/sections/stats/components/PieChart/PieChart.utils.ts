export const getCircleCoordinates = (
  innerRadius: number,
  outerRadius: number,
  circleSize: number,
  percentage: number,
) => {
  const angle = percentage * 3.6 - 1
  const startAngle = 0
  const endAngle = angle

  const centerX = circleSize / 2 // X-coordinate of the center of the doughnut chart
  const centerY = circleSize / 2 // Y-coordinate of the center of the doughnut chart

  const startAngleRad = ((startAngle - 90) * Math.PI) / 180
  const endAngleRad = ((endAngle - 90) * Math.PI) / 180

  const outerStartX = centerX + outerRadius * Math.cos(startAngleRad)
  const outerStartY = centerY + outerRadius * Math.sin(startAngleRad)
  const outerEndX = centerX + outerRadius * Math.cos(endAngleRad)
  const outerEndY = centerY + outerRadius * Math.sin(endAngleRad)

  const innerStartX = centerX + innerRadius * Math.cos(endAngleRad)
  const innerStartY = centerY + innerRadius * Math.sin(endAngleRad)
  const innerEndX = centerX + innerRadius * Math.cos(startAngleRad)
  const innerEndY = centerY + innerRadius * Math.sin(startAngleRad)

  const largeArcFlag = angle > 180 ? "1" : "0"

  return `M ${outerStartX} ${outerStartY} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY} L ${innerStartX} ${innerStartY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY} Z`
}

export const getPieConfig = (pieSize: number) => {
  const pieChartConfig = {
    hoverDiameter: 10,
    doughnutDiameter: 10,
    shadowDiameter: 40,
  }
  const pieRadius = pieSize / 2

  return {
    hoverOuterRadius: pieRadius,
    outerRadius: pieRadius - pieChartConfig.hoverDiameter,
    innerRadius:
      pieRadius -
      pieChartConfig.doughnutDiameter -
      pieChartConfig.hoverDiameter,
    shadowInnerRadius:
      pieRadius -
      pieChartConfig.doughnutDiameter -
      pieChartConfig.hoverDiameter -
      pieChartConfig.shadowDiameter,
    gap: 1,
    pieSize,
    shadowSize: pieSize - pieChartConfig.hoverDiameter,
  }
}

export const ASSET_COLORS: { [key: string]: string } = {
  hdx: "#f6287c",
  usdt: "#4faf95",
  astr: "#086ae7",
  pha: "#d1ff51",
  dai: "#f5ac37",
  cfg: "#141414",
  dot: "#e53684",
  ibtc: "#ff9900",
  wbtc: "#f09241",
  lrna: "#1e70ff",
  eth: "#343434",
}
