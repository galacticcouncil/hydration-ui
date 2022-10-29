import { ModalMeta } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/farms/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PoolJoinFarmDeposit } from "./PoolJoinFarmDeposit"
import { PoolJoinFarmItem } from "./PoolJoinFarmItem"
import {
  PalletLiquidityMiningDepositData,
  PalletLiquidityMiningYieldFarmEntry,
} from "@polkadot/types/lookup"
import { PoolJoinFarmPosition } from "./PoolJoinFarmPosition"
import { PoolJoinFarmLoyaltyGraph } from "./PoolJoinFarmLoyaltyGraph"
import { u128 } from "@polkadot/types"

export function PoolJoinFarmSectionDetail(props: {
  farm: AprFarm
  pool: PoolBase
  position?: PalletLiquidityMiningYieldFarmEntry
  onBack: () => void
  deposit?: { id: u128; deposit: PalletLiquidityMiningDepositData }
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
        <PoolJoinFarmItem
          pool={props.pool}
          farm={props.farm}
          deposit={props.deposit}
        />

        {loyaltyCurve && (
          <PoolJoinFarmLoyaltyGraph
            farm={props.farm}
            loyaltyCurve={loyaltyCurve}
            showDisclaimer={!props.position}
          />
        )}

        {props.position ? (
          <PoolJoinFarmPosition
            pool={props.pool}
            farm={props.farm}
            position={props.position}
          />
        ) : (
          <PoolJoinFarmDeposit pool={props.pool} farm={props.farm} />
        )}
      </div>
    </>
  )
}
