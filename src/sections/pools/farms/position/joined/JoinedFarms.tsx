import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SSeparator } from "sections/pools/farms/position/FarmingPosition.styled"
import { ReactElement } from "react"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useFarmApr, useFarms } from "api/farms"
import { DepositNftType } from "api/deposits"
import { u32 } from "@polkadot/types"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { getCurrentLoyaltyFactor } from "utils/farms/apr"
import { useRpcProvider } from "providers/rpcProvider"

type DepositedYieldFarmProps = {
  activeYieldFarm: NonNullable<ReturnType<typeof useFarms>["data"]>[0]
  joinedYieldFarm?: PalletLiquidityMiningYieldFarmEntry
}

export const DepositedYieldFarm = ({
  activeYieldFarm,
  joinedYieldFarm,
}: DepositedYieldFarmProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const { data: farmApr } = useFarmApr(activeYieldFarm)
  const assetMeta = farmApr?.assetId
    ? assets.getAsset(farmApr.assetId.toString())
    : undefined

  if (!assetMeta || !farmApr || !joinedYieldFarm) return null

  const currentPeriodInFarm = farmApr.currentPeriod.minus(
    joinedYieldFarm.enteredAt.toBigNumber(),
  )

  const currentApr = farmApr.loyaltyCurve
    ? farmApr.apr.times(
        getCurrentLoyaltyFactor(farmApr.loyaltyCurve, currentPeriodInFarm),
      )
    : farmApr.apr

  return (
    <div sx={{ flex: "row", align: "center", gap: 6 }}>
      <Icon size={24} icon={<AssetLogo id={assetMeta.id} />} />
      <Text>{assetMeta.symbol}</Text>
      <Text color="brightBlue200">
        {t("value.APR", {
          apr: currentApr,
        })}
      </Text>
    </div>
  )
}

type JoinedFarmsProps = { depositNft: DepositNftType; poolId: u32 }

export const JoinedFarms = ({ depositNft, poolId }: JoinedFarmsProps) => {
  const { t } = useTranslation()

  const farms = useFarms([poolId])

  const activeYieldFarms =
    farms.data?.filter((i) =>
      depositNft.deposit.yieldFarmEntries.some(
        (entry) =>
          entry.globalFarmId.eq(i.globalFarm.id) &&
          entry.yieldFarmId.eq(i.yieldFarm.id),
      ),
    ) ?? []

  const joinedFarmComponents = activeYieldFarms.reduce(
    (acc, activeYieldFarm, i) => {
      const isLastElement = i + 1 === activeYieldFarms.length
      const joinedYieldFarm = depositNft.deposit.yieldFarmEntries.find(
        (nft) =>
          nft.yieldFarmId.toString() ===
          activeYieldFarm.yieldFarm.id.toString(),
      )

      acc.push(
        <DepositedYieldFarm
          key={i}
          activeYieldFarm={activeYieldFarm}
          joinedYieldFarm={joinedYieldFarm}
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
    <div
      sx={{
        flex: "column",
        gap: 6,
        pb: [12, 0],
        justify: "space-between",
      }}
    >
      <Text color="basic500" fs={14} lh={16} fw={400}>
        {t("farms.positions.labels.joinedFarms.title")}
      </Text>
      <div
        sx={{
          flex: "row",
          gap: ["10px 10px", "10px 35px"],
          width: "100%",
          flexWrap: "wrap",
          justify: "space-between",
        }}
      >
        {joinedFarmComponents}
      </div>
    </div>
  )
}
