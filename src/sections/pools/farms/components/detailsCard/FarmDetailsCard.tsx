import { Tag } from "components/Tag/Tag"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { SIcon, SRow, SContainer } from "./FarmDetailsCard.styled"
import { FillBar } from "components/FillBar/FillBar"
import { scaleHuman } from "utils/balance"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { addSeconds } from "date-fns"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { Farm, useFarmApr } from "api/farms"
import { useBestNumber } from "api/chain"
import { BLOCK_TIME, BN_0 } from "utils/constants"
import { useMemo } from "react"
import { getCurrentLoyaltyFactor } from "utils/farms/apr"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useRpcProvider } from "providers/rpcProvider"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"

type FarmDetailsCardProps = {
  poolId: string
  depositNft?: TMiningNftPosition
  farm: Farm
  onSelect?: () => void
}

export const FarmDetailsCard = ({
  poolId,
  depositNft,
  farm,
  onSelect,
}: FarmDetailsCardProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const asset = assets.getAsset(farm.globalFarm.rewardCurrency.toString())
  const apr = useFarmApr(farm)
  const assetMeta = assets.getAsset(poolId.toString())

  const isClickable = !!onSelect

  const bestNumber = useBestNumber()
  const secondsDurationToEnd =
    bestNumber.data != null
      ? apr.data?.estimatedEndBlock
          .minus(bestNumber.data?.relaychainBlockNumber.toBigNumber())
          .times(BLOCK_TIME)
          .toNumber()
      : undefined

  const currentApr = useMemo(() => {
    if (depositNft && apr.data != null) {
      const depositYield = depositNft.data.yieldFarmEntries.find(
        (entry) =>
          entry.yieldFarmId.eq(farm.yieldFarm.id) &&
          entry.globalFarmId.eq(farm.globalFarm.id),
      )

      if (!depositYield) return BN_0
      if (!apr.data.loyaltyCurve) return apr.data.apr

      const currentLoyaltyFactor = getCurrentLoyaltyFactor(
        apr.data.loyaltyCurve,
        apr.data.currentPeriod.minus(depositYield?.enteredAt.toBigNumber()),
      )

      return apr.data.apr.times(currentLoyaltyFactor)
    }
    return BN_0
  }, [depositNft, farm.globalFarm.id, farm.yieldFarm.id, apr.data])

  if (apr.data == null) return null

  const fullness = apr.data.fullness
  const isFull = fullness.gte(100)

  return (
    <SContainer
      isClickable={isClickable}
      onClick={() => onSelect?.()}
      isJoined={!!depositNft}
    >
      <div
        sx={{
          flex: "column",
          justify: "space-between",
          gap: 12,
        }}
      >
        {depositNft && <Tag>{t("farms.details.card.tag.label")}</Tag>}
        <div
          sx={{
            flex: ["row", "column"],
            justify: "space-between",
          }}
          css={{ flex: 1 }}
        >
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Icon size={24} icon={<AssetLogo id={asset.id} />} />
            <Text fs={[18, 16]} font="GeistMedium">
              {asset.symbol}
            </Text>
          </div>
          <Text fs={19} lh={28} fw={400} css={{ whiteSpace: "nowrap" }}>
            {apr.data.minApr && apr.data?.apr.gt(0)
              ? t("value.upToAPR", {
                  maxApr: apr.data?.apr,
                })
              : t("value.APR", { apr: apr.data?.apr })}
          </Text>
        </div>
      </div>

      <div sx={{ flex: "column", flexGrow: 1, width: "100%" }}>
        <SRow>
          <FillBar
            percentage={apr.data.distributedRewards
              .div(apr.data.maxRewards)
              .times(100)
              .toNumber()}
          />
          <Text tAlign="right">
            <Trans
              t={t}
              i18nKey="farms.details.card.distribution"
              tOptions={{
                distributed: scaleHuman(
                  apr.data.distributedRewards,
                  asset.decimals,
                ),
                max: scaleHuman(apr.data.potMaxRewards, asset.decimals),
              }}
            >
              <Text as="span" fs={14} color="basic100" />
              <Text as="span" fs={14} color="basic300" />
            </Trans>
          </Text>
        </SRow>
        <SRow css={{ border: depositNft ? undefined : "none" }}>
          <FillBar
            percentage={fullness.toNumber()}
            variant={isFull ? "full" : "secondary"}
          />
          <div
            sx={{ flex: "row", gap: 2, align: "center" }}
            css={{ justifySelf: "end" }}
          >
            <Text fs={14} color="basic100">
              {t("farms.details.card.capacity", {
                capacity: fullness,
              })}
            </Text>
            {isFull && (
              <InfoTooltip text={t("farms.details.card.capacity.desc")}>
                <SInfoIcon />
              </InfoTooltip>
            )}
          </div>
        </SRow>
        {depositNft && (
          <>
            <SRow>
              <Text fs={14} lh={18}>
                {t("farms.details.card.lockedShares.label")}
              </Text>
              <GradientText
                fs={14}
                tAlign="right"
                font="GeistMedium"
                gradient="pinkLightBlue"
                sx={{ width: "fit-content" }}
                css={{ justifySelf: "end" }}
              >
                {t("farms.details.card.lockedShares.value", {
                  value: scaleHuman(depositNft.data.shares, assetMeta.decimals),
                })}
              </GradientText>
            </SRow>

            <div sx={{ flex: "row", justify: "space-between", mb: 9 }}>
              <Text fs={14} lh={18}>
                {t("farms.details.card.currentApr.label")}
              </Text>
              <GradientText fs={14} font="GeistMedium" gradient="pinkLightBlue">
                {t("value.APR", { apr: currentApr })}
              </GradientText>
            </div>
          </>
        )}
        <Text fs={12} lh={16} fw={400} color="basic500">
          {secondsDurationToEnd != null &&
            t("farms.details.card.end.value", {
              end: addSeconds(new Date(), secondsDurationToEnd),
            })}
        </Text>
      </div>
      {onSelect && (
        <SIcon
          sx={{ color: "iconGray", height: "100%", align: "center" }}
          icon={<ChevronRightIcon />}
        />
      )}
    </SContainer>
  )
}
