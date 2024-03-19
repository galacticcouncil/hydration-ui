import { Text } from "components/Typography/Text/Text"
import { SContainer, SJoinButton } from "./RedepositFarms.styled"
import { Trans, useTranslation } from "react-i18next"
import { useFarmRedepositMutation } from "utils/farms/redeposit"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { useState } from "react"
import { useFarms } from "api/farms"

type RedepositFarmsProps = {
  depositNft: TMiningNftPosition
  poolId: string
}

export const RedepositFarms = ({ depositNft, poolId }: RedepositFarmsProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)

  const farms = useFarms([poolId])
  const meta = assets.getAsset(poolId.toString())

  let availableYieldFarms =
    farms.data?.filter(
      (i) =>
        !depositNft.data.yieldFarmEntries.some(
          (entry) =>
            entry.globalFarmId.eq(i.globalFarm.id) &&
            entry.yieldFarmId.eq(i.yieldFarm.id),
        ),
    ) ?? []

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.join.toast.${msType}`}
        tOptions={{
          amount: depositNft.data.shares.toBigNumber(),
          fixedPointScale: meta.decimals,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const redeposit = useFarmRedepositMutation(
    availableYieldFarms,
    [depositNft],
    toast,
    () => setJoinFarm(false),
  )

  if (!availableYieldFarms.length) return null

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 4 }}>
        <Text fs={13} color="brightBlue300" tTransform="uppercase">
          <Trans t={t} i18nKey="farms.positions.redeposit.openFarms" />
        </Text>

        <GlobalFarmRowMulti
          farms={availableYieldFarms}
          fontSize={16}
          iconSize={24}
          css={{ flexDirection: "row-reverse" }}
        />
      </div>

      <SJoinButton
        onClick={() => setJoinFarm(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <Text fs={12} color="basic900" tTransform="uppercase" tAlign="center">
          {t("farms.positions.join.button.label")}
        </Text>
      </SJoinButton>
      {joinFarm && (
        <JoinFarmModal
          farms={availableYieldFarms}
          isOpen={joinFarm}
          poolId={poolId}
          shares={depositNft.data.shares.toBigNumber()}
          mutation={redeposit}
          onClose={() => setJoinFarm(false)}
          isRedeposit
        />
      )}
    </SContainer>
  )
}
