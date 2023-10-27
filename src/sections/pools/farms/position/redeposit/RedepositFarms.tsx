import { Text } from "components/Typography/Text/Text"
import { SContainer, SJoinButton } from "./RedepositFarms.styled"
import { Trans, useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { ReactElement, useState } from "react"
import { SSeparator } from "sections/pools/farms/position/FarmingPosition.styled"
import { useFarmApr, useFarms } from "api/farms"
import { useFarmRedepositMutation } from "utils/farms/redeposit"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccountStore } from "state/store"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { useRpcProvider } from "providers/rpcProvider"

type RedepositFarmProps = {
  availableYieldFarm: NonNullable<ReturnType<typeof useFarms>["data"]>[0]
}

const RedepositFarm = ({ availableYieldFarm }: RedepositFarmProps) => {
  const { assets } = useRpcProvider()
  const { data: farmApr } = useFarmApr(availableYieldFarm)
  const assetMeta = farmApr?.assetId
    ? assets.getAsset(farmApr.assetId.toString())
    : undefined
  return (
    <div sx={{ flex: "row", align: "center", gap: 8 }}>
      <Icon size={24} icon={<AssetLogo id={assetMeta?.id} />} />
      <Text>{assetMeta?.symbol}</Text>
    </div>
  )
}

type RedepositFarmsProps = {
  depositNft: TMiningNftPosition
  poolId: string
}

export const RedepositFarms = ({ depositNft, poolId }: RedepositFarmsProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
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

  const farmComponents = availableYieldFarms.reduce(
    (acc, availableYieldFarm, i) => {
      const isLastElement = i + 1 === availableYieldFarms.length

      acc.push(
        <RedepositFarm
          key={`farm_${i}`}
          availableYieldFarm={availableYieldFarm}
        />,
      )

      if (!isLastElement)
        acc.push(
          <SSeparator
            key={`separator_${i}`}
            sx={{ height: 35 }}
            orientation="vertical"
          />,
        )

      return acc
    },
    [] as ReactElement[],
  )

  return (
    <SContainer>
      <Text fs={13} fw={600} color="brightBlue300" tTransform="uppercase">
        <Trans t={t} i18nKey="farms.positions.redeposit.openFarms" />
      </Text>
      {farmComponents}
      <SJoinButton
        onClick={() => setJoinFarm(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <Text fs={13} color="basic900" tTransform="uppercase" tAlign="center">
          {t("farms.positions.join.button.label")}
        </Text>
      </SJoinButton>
      {joinFarm && (
        <JoinFarmModal
          farms={availableYieldFarms}
          isOpen={joinFarm}
          poolId={poolId}
          shares={depositNft.deposit.shares.toBigNumber()}
          mutation={redeposit}
          onClose={() => setJoinFarm(false)}
          isRedeposit
        />
      )}
    </SContainer>
  )
}
