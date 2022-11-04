import { ModalMeta } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/farms/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PoolFarmDetail } from "sections/pools/farm/detail/PoolFarmDetail"
import { PoolFarmLoyaltyGraph } from "sections/pools/farm/loyaltyGraph/PoolFarmLoyaltyGraph"

export function PoolFarmJoinSectionItem(props: {
  farm: AprFarm
  pool: PoolBase
  onBack: () => void
}) {
  const { t } = useTranslation()

  const loyaltyCurve = props.farm.yieldFarm.loyaltyCurve.unwrapOr(null)

  return (
    <>
      <ModalMeta
        title={t("pools.allFarms.detail.modal.title")}
        secondaryIcon={{
          icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
          name: "Back",
          onClick: props.onBack,
        }}
      />

      <div sx={{ flex: "column", gap: 32 }}>
        <PoolFarmDetail pool={props.pool} farm={props.farm} />

        {loyaltyCurve && (
          <PoolFarmLoyaltyGraph farm={props.farm} loyaltyCurve={loyaltyCurve} />
        )}
      </div>
    </>
  )
}
