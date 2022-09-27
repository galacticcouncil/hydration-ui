import { ModalMeta } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/apr"
import { PoolToken } from "@galacticcouncil/sdk"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PoolJoinFarmDeposit } from "./PoolJoinFarmDeposit"
import { PoolJoinFarmItem } from "./PoolJoinFarmItem"

export function PoolJoinFarmSectionDetail(props: {
  poolId: string
  assetIn: PoolToken
  assetOut: PoolToken
  onBack: () => void
  farm: AprFarm
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

      <PoolJoinFarmItem farm={props.farm} />

      <PoolJoinFarmDeposit
        poolId={props.poolId}
        assetIn={props.assetIn}
        assetOut={props.assetOut}
        farm={props.farm}
      />
    </>
  )
}
