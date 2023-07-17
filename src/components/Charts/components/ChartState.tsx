import { ReactComponent as NoDataIcon } from "assets/icons/ChartNoDataIcon.svg"
import { ReactComponent as ErrorIcon } from "assets/icons/ChartErrorIcon.svg"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { SChartStateContainer, SLoadingEl } from "./ChartState.styled"

export type TChartState = "loading" | "error" | "noData"

export const ChartState = ({ state }: { state: TChartState }) => {
  const { t } = useTranslation()

  return (
    <SChartStateContainer>
      {state === "loading" ? (
        <>
          <SLoadingEl />
          <SLoadingEl />
          <SLoadingEl />
        </>
      ) : (
        <div sx={{ flex: "column", gap: 15, align: "center" }}>
          <Icon icon={state === "noData" ? <NoDataIcon /> : <ErrorIcon />} />
          <Text
            color="brightBlue200"
            fs={[12, 14]}
            css={{ whiteSpace: "nowrap" }}
          >
            {state === "noData"
              ? t("chart.state.noData.label")
              : t("chart.state.error.label")}
          </Text>
        </div>
      )}
    </SChartStateContainer>
  )
}
