import { Tag } from "components/Tag/Tag"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { SIcon, SRow, SContainer } from "./FarmDetailsCard.styled"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { addSeconds } from "date-fns"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import Distribution from "assets/icons/Distribution.svg?react"
import CalendarIcon from "assets/icons/CalendarIcon.svg?react"
import Hydrated from "assets/icons/Hydrated.svg?react"
import { Icon } from "components/Icon/Icon"
import { TFarmAprData, useFarmCurrentPeriod } from "api/farms"
import { BN_0 } from "utils/constants"
import { useMemo } from "react"
import { getCurrentLoyaltyFactor } from "utils/farms/apr"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import {
  isXYKDeposit,
  TDepositData,
} from "sections/pools/farms/position/FarmingPosition.utils"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { useAssets } from "providers/assets"
import { TDeposit } from "api/deposits"
import { LinearProgress } from "components/Progress"
import { theme } from "theme"
import BN from "bignumber.js"

type FarmDetailsCardProps = {
  depositNft?: TDeposit
  depositData?: TDepositData
  farm: TFarmAprData
  onSelect?: () => void
  compact?: boolean
}

export const FarmDetailsCard = ({
  depositNft,
  depositData,
  farm,
  onSelect,
  compact,
}: FarmDetailsCardProps) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const asset = getAssetWithFallback(farm.rewardCurrency)

  const { getSecondsToLeft, getCurrentPeriod } = useFarmCurrentPeriod()
  const secondsToLeft = getSecondsToLeft(farm.estimatedEndBlock)
  const isClickable = !!onSelect

  const currentApr = useMemo(() => {
    if (depositNft) {
      const depositYield = depositNft.data.yieldFarmEntries.find(
        (entry) =>
          BN(entry.yieldFarmId).eq(farm.yieldFarmId) &&
          BN(entry.globalFarmId).eq(farm.globalFarmId),
      )

      const currentPeriod = getCurrentPeriod(farm.blocksPerPeriod)

      if (!depositYield) return BN_0
      if (!farm.loyaltyCurve || !currentPeriod) return farm.apr

      const currentLoyaltyFactor = getCurrentLoyaltyFactor(
        farm.loyaltyCurve,
        BN(currentPeriod).minus(depositYield?.enteredAt),
      )

      return BN(farm.apr).times(currentLoyaltyFactor)
    }
    return BN_0
  }, [depositNft, farm, getCurrentPeriod])

  const fullness = BN(farm.fullness)
  const isFull = fullness.gte(100)

  return (
    <SContainer isClickable={isClickable} onClick={() => onSelect?.()}>
      <div
        sx={{
          flex: "column",
          justify: "space-between",
          gap: 12,
        }}
      >
        {(!compact || depositNft) && (
          <div sx={{ flex: "row", justify: "space-between" }}>
            {!compact && (
              <Text color="basic200" fs={14}>
                {t("farms.details.card.title")}
              </Text>
            )}
            {depositNft && <Tag>{t("farms.details.card.tag.label")}</Tag>}
          </div>
        )}
        <div
          sx={{
            flex: "row",
            align: "center",
            justify: "space-between",
          }}
          css={{ flex: 1 }}
        >
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Icon size={24} icon={<AssetLogo id={asset.id} />} />
            <Text fs={16} font="GeistMedium">
              {asset.symbol}
            </Text>
          </div>
          <Text
            fs={16}
            lh={16}
            font="GeistMedium"
            css={{ whiteSpace: "nowrap" }}
          >
            {BN(farm.apr).gt(0)
              ? t("value.upToAPR", {
                  maxApr: farm.apr,
                })
              : t("value.APR", { apr: farm.apr })}
          </Text>
        </div>
      </div>

      <div sx={{ flex: "column", flexGrow: 1, width: "100%" }}>
        <SRow compact={compact}>
          <Icon sx={{ color: "darkBlue200" }} icon={<Distribution />} />
          <Text>
            <Trans
              t={t}
              i18nKey="farms.details.card.distribution"
              tOptions={{
                distributed: farm.distributedRewards,
                max: farm.maxRewards,
              }}
            >
              <Text as="span" fs={14} color="basic100" />
              <Text as="span" fs={14} color="basic300" />
            </Trans>
          </Text>
          {!compact && (
            <LinearProgress
              size="small"
              color="brightBlue500"
              withoutLabel
              percent={Number(farm.diffRewards)}
            />
          )}
        </SRow>
        <SRow compact={compact}>
          <Icon sx={{ color: "brightBlue200" }} icon={<Hydrated />} />
          <div sx={{ flex: "row", gap: 2, align: "center" }}>
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
          {!compact && (
            <LinearProgress
              size="small"
              withoutLabel
              percent={fullness.toNumber()}
              colorCustom={
                true
                  ? theme.gradients.pinkDarkPink
                  : theme.gradients.lightGreenOrange
              }
            />
          )}
        </SRow>
        {depositData && (
          <>
            <SRow compact={compact}>
              <Text fs={14} lh={18}>
                {t("farms.details.card.locked.label")}
              </Text>
              <LockedValue depositData={depositData} />
            </SRow>

            <SRow compact={compact}>
              <Text fs={14} lh={18}>
                {t("farms.details.card.currentApr.label")}
              </Text>
              <GradientText
                fs={14}
                font="GeistSemiBold"
                gradient="pinkLightBlue"
                tAlign="right"
                sx={{ width: "fit-content" }}
                css={{ justifySelf: "end", gridColumn: "span 2 / span 2" }}
              >
                {t("value.APR", { apr: currentApr })}
              </GradientText>
            </SRow>
          </>
        )}
        <SRow compact={compact} sx={{ pb: 0 }}>
          <Icon sx={{ color: "brightBlue300" }} icon={<CalendarIcon />} />
          <Text fs={14} lh={18}>
            {secondsToLeft &&
              t("farms.details.card.end.value", {
                end: addSeconds(new Date(), secondsToLeft.toNumber()),
              })}
          </Text>
        </SRow>
      </div>
      {onSelect && (
        <SIcon
          sx={{
            color: "brightBlue300",
            height: "100%",
            align: "center",
            pr: 3,
          }}
          icon={<ChevronRightIcon />}
        />
      )}
    </SContainer>
  )
}

const LockedValue = ({ depositData }: { depositData: TDepositData }) => {
  const { t } = useTranslation()

  return (
    <GradientText
      fs={14}
      tAlign="right"
      font="GeistSemiBold"
      gradient="pinkLightBlue"
      sx={{ width: "fit-content" }}
      css={{ justifySelf: "end", gridColumn: "span 2 / span 2" }}
    >
      {isXYKDeposit(depositData) ? (
        <>
          {t("value.tokenWithSymbol", {
            value: depositData.assetA.amount,
            symbol: depositData.assetA.symbol,
          })}{" "}
          |{" "}
          {t("value.tokenWithSymbol", {
            value: depositData.assetB.amount,
            symbol: depositData.assetB.symbol,
          })}
        </>
      ) : (
        t("value.tokenWithSymbol", {
          value: depositData.totalValueShifted,
          symbol: depositData.meta.symbol,
        })
      )}
    </GradientText>
  )
}
