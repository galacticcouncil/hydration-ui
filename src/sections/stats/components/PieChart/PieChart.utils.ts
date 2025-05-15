export const getCircleCoordinates = (
  innerRadius: number,
  outerRadius: number,
  circleSize: number,
  percentage: number,
  startAnglePoint?: number,
) => {
  let currentAngle = startAnglePoint ?? 0

  const angle = percentage * 3.6 - 1
  const centerX = circleSize / 2 // X-coordinate of the center of the doughnut chart
  const centerY = circleSize / 2 // Y-coordinate of the center of the doughnut chart

  const startAngleRad = ((currentAngle - 90) * Math.PI) / 180
  const endAngleRad = ((currentAngle + angle - 90) * Math.PI) / 180

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
  hdx: "#a91161",
  "2-pool": "#009FFF",
  dot: "#e53684",
  adot: "#e53684",
  tbtc: "#000000",
  atbtc: "#000000",
  astr: "#086ae7",
  vdot: "#df92cb",
  avdot: "#df92cb",
  glmr: "#b3a3e5",
  "4-pool": "#8D71FF",
  weth: "#3e3e3e",
  bnc: "#b4c2f1",
  aave: "#a9c8fd",
  ibtc: "#ff9900",
  wbtc: "#f09241",
  awbtc: "#f09241",
  pha: "#d1ff51",
  cfg: "#141414",
  ksm: "#cbcbcb",
  vastr: "#782ce9",
  intr: "#b2b2b2",
  kilt: "#d94ac1",
  link: "#2c5be9",
  sky: "#c3dcf7",
  sol: "#3c958a",
  usdt: "#4faf95",
  ausdt: "#4faf95",
  dai: "#f5ac37",
  h2o: "#1e70ff",
  eth: "#343434",
  ztg: "#808080",
  cru: "#f4792b",
  ring: "#434343",
}
