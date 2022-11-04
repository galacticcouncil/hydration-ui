import { ModalMeta } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/farms/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { PoolFarmPosition } from "../../position/PoolFarmPosition"
import { PoolFarmDetail } from "sections/pools/farm/detail/PoolFarmDetail"
import { PoolFarmLoyaltyGraph } from "sections/pools/farm/loyaltyGraph/PoolFarmLoyaltyGraph"
import { DepositNftType } from "api/deposits"

export function PoolFarmPositionDetailSectionItem(props: {
  farm: AprFarm
  pool: PoolBase
  onBack: () => void
  position?: PalletLiquidityMiningYieldFarmEntry
  depositNft?: DepositNftType
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
        <PoolFarmDetail
          pool={props.pool}
          farm={props.farm}
          depositNft={props.depositNft}
        />

        {loyaltyCurve && (
          <PoolFarmLoyaltyGraph
            farm={props.farm}
            loyaltyCurve={loyaltyCurve}
            showDisclaimer={!props.position}
          />
        )}

        {props.position && (
          <PoolFarmPosition
            pool={props.pool}
            farm={props.farm}
            position={props.position}
          />
        )}
      </div>
    </>
  )
}
