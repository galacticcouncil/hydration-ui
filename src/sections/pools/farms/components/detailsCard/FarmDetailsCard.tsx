import { useAsset } from "api/asset"
import { Tag } from "components/Tag/Tag"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { SContainer, SIcon, SRow } from "./FarmDetailsCard.styled"
import { FillBar } from "components/FillBar/FillBar"
import { getFloatingPointAmount } from "utils/balance"
import { GradientText } from "components/Typography/GradientText/GradientText"
import BN from "bignumber.js"
import { addSeconds } from "date-fns"
import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { Icon } from "components/Icon/Icon"
import {
  PalletLiquidityMiningGlobalFarmData,
  PalletLiquidityMiningYieldFarmData,
} from "@polkadot/types/lookup"
import { useFarmApr } from "api/farms"

type FarmDetailsCardProps = {
  depositNft: any
  farm: {
    globalFarm: PalletLiquidityMiningGlobalFarmData
    yieldFarm: PalletLiquidityMiningYieldFarmData
  }
  onSelect?: () => void
}

export type CardVariant = "button" | "div"

export const FarmDetailsCard = ({
  depositNft,
  farm,
  onSelect,
}: FarmDetailsCardProps) => {
  const { t } = useTranslation()

  const asset = useAsset(farm.globalFarm.rewardCurrency)
  const apr = useFarmApr(farm)

  const variant = onSelect ? "button" : "div"

  if (apr.data == null) return null
  return (
    <SContainer
      as={variant}
      variant={variant}
      onClick={() => onSelect?.()}
      isJoined={!!depositNft}
    >
      {depositNft && (
        <div css={{ gridArea: "tag" }}>
          <Tag>{t("farms.details.card.tag.label")}</Tag>
        </div>
      )}
      <div
        sx={{
          flex: ["row", "column"],
          justify: ["space-between", "start"],
          gap: 32,
        }}
        css={{ gridArea: "apr" }}
      >
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Icon size={24} icon={asset.data?.icon} />
          <Text fs={[18, 16]} font="ChakraPetchBold">
            {asset.data?.symbol}
          </Text>
        </div>
        <Text fs={19} lh={28} fw={400} font="FontOver">
          {t("value.APR", { apr: apr.data?.apr })}
        </Text>
      </div>
      <div sx={{ flex: "column" }} css={{ gridArea: "details" }}>
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
                distributed: getFloatingPointAmount(
                  apr.data.distributedRewards,
                  12,
                ),
                max: getFloatingPointAmount(apr.data.maxRewards, 12),
              }}
            >
              <Text as="span" fs={14} color="basic100" />
              <Text as="span" fs={14} color="basic300" />
            </Trans>
          </Text>
        </SRow>
        <SRow css={{ border: depositNft ? undefined : "none" }}>
          <FillBar
            percentage={apr.data.distributedRewards
              .div(apr.data.maxRewards)
              .times(100)
              .toNumber()}
            variant="secondary"
          />
          <Text fs={14} color="basic100" tAlign="right">
            {t("farms.details.card.capacity", {
              capacity: apr.data.fullness.times(100),
            })}
          </Text>
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
                font="ChakraPetchBold"
                gradient="pinkLightBlue"
                sx={{ width: "fit-content" }}
                css={{ justifySelf: "end" }}
              >
                {t("farms.details.card.lockedShares.value", {
                  value: getFloatingPointAmount(depositNft.deposit.shares, 12),
                })}
              </GradientText>
            </SRow>

            <div sx={{ flex: "row", justify: "space-between", mb: 9 }}>
              <Text fs={14} lh={18}>
                {t("farms.details.card.currentApr.label")}
              </Text>
              <GradientText
                fs={14}
                font="ChakraPetchBold"
                gradient="pinkLightBlue"
              >
                {t("value.percentage", { value: BN(33) })}
              </GradientText>
            </div>
          </>
        )}
        <Text fs={12} lh={16} fw={400} color="basic500">
          {t("farms.details.card.end.value", {
            end: addSeconds(new Date(), BN(333333444).toNumber()),
          })}
        </Text>
      </div>
      {onSelect && (
        <SIcon
          sx={{ color: "iconGray", height: "100%", align: "center" }}
          icon={<ChevronDown />}
          css={{ gridArea: "icon" }}
        />
      )}
    </SContainer>
  )
}
