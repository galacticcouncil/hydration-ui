import { useTranslation } from "react-i18next"
import { Graph } from "components/Graph/Graph"
import { Spinner } from "components/Spinner/Spinner"
import { useLoyaltyRates } from "./LoyaltyGraph.utils"
import BigNumber from "bignumber.js"
import { TFarmAprData } from "api/farms"

type LoyaltyGraphProps = {
  farm: TFarmAprData
  loyaltyCurve: { initialRewardPercentage: string; scaleCoef: string }
  enteredAt?: BigNumber
  currentBlock: number
}

export const LoyaltyGraph = ({
  farm,
  loyaltyCurve,
  enteredAt,
  currentBlock,
}: LoyaltyGraphProps) => {
  const { t } = useTranslation()

  const rates = useLoyaltyRates(
    farm,
    BigNumber(farm.apr),
    loyaltyCurve,
    enteredAt ? BigNumber(currentBlock).minus(enteredAt) : undefined,
  )

  return (
    <div sx={{ height: 300, flex: "row", align: "center", justify: "center" }}>
      {rates.data ? (
        <Graph
          labelX={t("farms.modal.details.loyalty.x")}
          labelY={t("farms.modal.details.loyalty.y")}
          data={rates.data}
          offset={{ top: 0, right: 0, bottom: 16, left: 16 }}
        />
      ) : (
        <Spinner size={64} />
      )}
    </div>
  )
}
