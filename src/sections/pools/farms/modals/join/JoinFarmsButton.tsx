import { useFarms } from "api/farms"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"

export const JoinFarmsButton = (props: {
  poolId: string
  position?: HydraPositionsTableData
  onSuccess: () => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)
  const farms = useFarms([props.poolId])

  return (
    <>
      <Button
        variant="primary"
        size="compact"
        disabled={!farms.data?.length || account?.isExternalWalletConnected}
        onClick={() => setJoinFarm(true)}
      >
        <Icon size={12} icon={<FPIcon />} />
        {t("liquidity.asset.actions.joinFarms")}
      </Button>

      {joinFarm && farms.data && (
        <JoinFarmModal
          farms={farms.data}
          poolId={props.poolId}
          onClose={() => setJoinFarm(false)}
          onSuccess={props.onSuccess}
          initialShares={props.position?.shares}
          positionId={props.position?.id}
        />
      )}
    </>
  )
}
