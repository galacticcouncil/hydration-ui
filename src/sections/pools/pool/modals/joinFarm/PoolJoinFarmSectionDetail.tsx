import { ModalMeta } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PoolJoinFarmDeposit } from "./PoolJoinFarmDeposit"
import { PoolJoinFarmItem } from "./PoolJoinFarmItem"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { PoolJoinFarmPosition } from "./PoolJoinFarmPosition"

export function PoolJoinFarmSectionDetail(props: {
  farm: AprFarm
  pool: PoolBase
  position?: PalletLiquidityMiningYieldFarmEntry
  onBack: () => void
}) {
  const { t } = useTranslation()

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

      <PoolJoinFarmItem pool={props.pool} farm={props.farm} />

      {props.position ? (
        <PoolJoinFarmPosition
          pool={props.pool}
          farm={props.farm}
          position={props.position}
        />
      ) : (
        <PoolJoinFarmDeposit pool={props.pool} farm={props.farm} />
      )}
    </>
  )
}
