import { Icon } from "components/Icon/Icon"
import { SSwitchButton } from "./ChartSwitchMobile.styled"
import { ReactComponent as Overview } from "assets/icons/OverviewMobile.svg"
import { ReactComponent as Chart } from "assets/icons/ChartMobile.svg"
import { ReactComponent as ChartActive } from "assets/icons/ChartMobileActive.svg"
import { useTranslation } from "react-i18next"

type ChartSwitchMobileProps = {
  active: "overview" | "chart"
  onClick: (option: "overview" | "chart") => void
}

export const ChartSwitchMobile = ({
  active,
  onClick,
}: ChartSwitchMobileProps) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", gap: 12 }}>
      <SSwitchButton
        active={active === "overview"}
        onClick={() => onClick("overview")}
      >
        <Icon icon={<Overview />} />
        {t("stats.overview.mobile.tab.overview")}
      </SSwitchButton>
      <SSwitchButton
        active={active === "chart"}
        onClick={() => onClick("chart")}
      >
        <Icon icon={active === "chart" ? <ChartActive /> : <Chart />} />
        {t("stats.overview.mobile.tab.chart")}
      </SSwitchButton>
    </div>
  )
}
