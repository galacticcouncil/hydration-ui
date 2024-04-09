import { useFarms } from "api/farms"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useRpcProvider } from "providers/rpcProvider"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { ToastMessage } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { useFarmDepositMutation } from "utils/farms/deposit"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { BN_0 } from "utils/constants"

const shares = BN_0
const positionId = "0"

export const JoinFarmsButton = (props: {
  poolId: string
  onSuccess: () => void
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)
  const farms = useFarms([props.poolId])
  const meta = assets.getAsset(props.poolId.toString())

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.join.toast.${msType}`}
        tOptions={{
          amount: shares,
          fixedPointScale: meta.decimals,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const joinFarmMutation = useFarmDepositMutation(
    props.poolId,
    positionId,
    toast,
    () => setJoinFarm(false),
    props.onSuccess,
  )

  return (
    <>
      <Button
        variant="primary"
        size="compact"
        disabled={
          /*!farms.data?.length || */ account?.isExternalWalletConnected
        }
        onClick={() => setJoinFarm(true)}
      >
        <Icon size={12} icon={<FPIcon />} />
        {t("liquidity.asset.actions.joinFarms")}
      </Button>

      {joinFarm && farms.data && (
        <JoinFarmModal
          isOpen
          farms={farms.data}
          poolId={props.poolId}
          onClose={() => setJoinFarm(false)}
          mutation={joinFarmMutation}
        />
      )}
    </>
  )
}
