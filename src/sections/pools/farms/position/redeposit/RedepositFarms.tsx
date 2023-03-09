import { Text } from "components/Typography/Text/Text"
import { SContainer, SJoinButton } from "./RedepositFarms.styled"
import { Trans, useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { ReactElement, useState } from "react"
import { SSeparator } from "../FarmingPosition.styled"
import { DepositNftType } from "api/deposits"
import { useFarmApr, useFarms } from "api/farms"
import { useAssetMeta } from "api/assetMeta"
import { useFarmRedepositMutation } from "utils/farms/redeposit"
import { JoinFarmModal } from "../../modals/join/JoinFarmsModal"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccountStore } from "state/store"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"

type RedepositFarmProps = {
  availableYieldFarm: NonNullable<ReturnType<typeof useFarms>["data"]>[0]
}

const RedepositFarm = ({ availableYieldFarm }: RedepositFarmProps) => {
  const { data: farmApr } = useFarmApr(availableYieldFarm)
  const { data: assetMeta } = useAssetMeta(farmApr?.assetId)
  return (
    <div sx={{ flex: "row", align: "center", gap: 4 }}>
      <Icon icon={getAssetLogo(assetMeta?.symbol)} />
    </div>
  )
}

type RedepositFarmsProps = {
  depositNft: DepositNftType
  pool: OmnipoolPool
}

export const RedepositFarms = ({ depositNft, pool }: RedepositFarmsProps) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [joinFarm, setJoinFarm] = useState(false)

  const farms = useFarms(pool.id)
  const meta = useAssetMeta(pool.id)

  let availableYieldFarms =
    farms.data?.filter(
      (i) =>
        !depositNft.deposit.yieldFarmEntries.some(
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
          amount: depositNft.deposit.shares.toBigNumber(),
          fixedPointScale: meta.data?.decimals ?? 12,
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
          pool={pool}
          shares={depositNft.deposit.shares.toBigNumber()}
          mutation={redeposit}
          onClose={() => setJoinFarm(false)}
          isRedeposit
        />
      )}
    </SContainer>
  )
}
