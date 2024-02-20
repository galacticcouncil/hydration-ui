import { DataValue } from "components/DataValue"
import { useTranslation } from "react-i18next"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { InterestRateModelGraphContainer } from "sections/lending/modules/reserve-overview/graphs/InterestRateModelGraphContainer"
import { NetworkConfig } from "sections/lending/ui-config/networksConfig"
import LinkIcon from "assets/icons/LinkIcon.svg?react"

export type InterestRateModelInfoProps = {
  reserve: ComputedReserveData
  currentNetworkConfig: NetworkConfig
}

export const InterestRateModelInfo: React.FC<InterestRateModelInfoProps> = ({
  reserve,
  currentNetworkConfig,
}) => {
  const { t } = useTranslation()
  return (
    <div>
      <div
        sx={{
          flex: ["column", "row"],
          align: ["start", "center"],
          justify: "space-between",
          gap: 20,
          mb: 20,
        }}
      >
        <DataValue
          label="Utilization Rate"
          labelColor="basic400"
          font="ChakraPetchBold"
        >
          {t("value.percentage", {
            value: +reserve.borrowUsageRatio * 100,
          })}
        </DataValue>
        <a
          target="_blank"
          href={currentNetworkConfig.explorerLinkBuilder({
            address: reserve.interestRateStrategyAddress,
          })}
          rel="noreferrer"
          css={{ textDecoration: "underline" }}
          sx={{ color: "basic500", fontSize: 14 }}
        >
          Interest rate strategy{" "}
          <LinkIcon width={10} height={10} sx={{ ml: 4 }} />
        </a>
      </div>
      <InterestRateModelGraphContainer reserve={reserve} />
    </div>
  )
}
