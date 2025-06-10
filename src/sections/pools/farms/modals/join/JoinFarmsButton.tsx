import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { TLPData } from "utils/omnipool"
import { usePoolData } from "sections/pools/pool/Pool"

export const JoinFarmsButton = (props: {
  poolId: string
  position?: TLPData
  onSuccess: () => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)
  const {
    pool: { farms },
  } = usePoolData()

  return (
    <>
      <Button
        variant="primary"
        size="compact"
        disabled={!farms.length}
        onClick={() => setJoinFarm(true)}
        css={{ flex: "1 0 0" }}
      >
        <Icon size={12} icon={<FPIcon />} />
        {t("liquidity.asset.actions.joinFarms")}
      </Button>

      {joinFarm && (
        <JoinFarmModal
          onClose={() => setJoinFarm(false)}
          position={props.position}
        />
      )}
    </>
  )
}
