import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/farms/apr"
import { Graph } from "components/Graph/Graph"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useLoyaltyRates } from "./PoolJoinFarmLoyaltyGraph.utils"
import { Text } from "components/Typography/Text/Text"
import { PalletLiquidityMiningLoyaltyCurve } from "@polkadot/types/lookup"

export function PoolJoinFarmLoyaltyGraph(props: {
  farm: AprFarm
  loyaltyCurve: PalletLiquidityMiningLoyaltyCurve
  showDisclaimer: boolean
}) {
  const { t } = useTranslation()
  const rates = useLoyaltyRates(props.farm, props.loyaltyCurve)

  return (
    <div sx={{ flex: "column", gap: 32 }}>
      <Text fw={600} fs={20} color="neutralGray100">
        {t("pools.allFarms.modal.position.loyalty.title")}
      </Text>
      <div
        sx={{ height: 300, flex: "row", align: "center", justify: "center" }}
      >
        {rates.data ? (
          <Graph
            labelX={t("pools.allFarms.modal.position.loyalty.x")}
            labelY={t("pools.allFarms.modal.position.loyalty.y")}
            data={rates.data}
          />
        ) : (
          <Spinner width={64} height={64} />
        )}
      </div>

      {props.showDisclaimer && (
        <Text
          fw={400}
          fs={14}
          color="neutralGray400"
          lh={20}
          tAlign="center"
          sx={{ px: 30 }}
        >
          {t("pools.allFarms.modal.position.loyalty.disclaimer")}
        </Text>
      )}
    </div>
  )
}
