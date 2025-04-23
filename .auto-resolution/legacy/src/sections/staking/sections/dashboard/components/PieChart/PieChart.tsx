import { PieChart as PieChartComponent } from "components/PieChart/PieChart"
import styled from "@emotion/styled"
import { ComponentProps } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

const SPieChart = styled(PieChartComponent)`
  background: conic-gradient(
    from 335deg at 48.08% 50.64%,
    #f6297c -0.8deg,
    rgba(246, 41, 124, 0) 285.15deg,
    #f6297c 359.2deg,
    rgba(246, 41, 124, 0) 645.15deg
  );
`

type Props = Omit<ComponentProps<typeof PieChartComponent>, "label"> & {
  circulatigSupply: number
}

export const PieChart = (props: Props) => {
  const { t } = useTranslation()

  const isInvalid = !props.loading && props.circulatigSupply === 0

  const label = (
    <>
      <Text fs={12}>{t("staking.dashboard.stats.chart.label")}</Text>
      <Text fs={30}>{isInvalid ? "N/a" : `${props.percentage}%`}</Text>
      {!isInvalid && (
        <Text fs={11} sx={{ width: 100 }} color="darkBlue300">{`of ${t(
          "value.token",
          {
            value: props.circulatigSupply,
          },
        )} circulating supply`}</Text>
      )}
    </>
  )

  return (
    <SPieChart
      {...props}
      percentage={isInvalid ? 0 : props.percentage}
      label={label}
    />
  )
}
