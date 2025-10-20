import { FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { ApyType, BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { DetailedApy } from "@/components/DetailedApy/DetailedApy"

export type ApyBreakdownProps = FlexProps & {
  type: ApyType
  assetId: string
  withFarms?: boolean
  omnipoolFee?: string
  apyData: BorrowAssetApyData
}

export const ApyBreakdown: React.FC<ApyBreakdownProps> = ({
  type,
  //withFarms,
  omnipoolFee,
  apyData,
  ...props
}) => {
  const { t } = useTranslation()

  const {
    totalSupplyApy,
    totalBorrowApy,
    lpAPY,
    underlyingAssetsApyData,
    incentives,
    // farms = [] @TODO: farms
  } = apyData

  const isSupply = type === "supply"
  const baseApy = isSupply ? totalSupplyApy : totalBorrowApy
  const apy = Big(baseApy ?? 0)
    .plus(omnipoolFee ?? 0)
    .toNumber()

  const validIncentives = incentives
    .filter(({ incentiveAPR }) => Big(incentiveAPR).gt(0))
    .map((incentive) => ({
      ...incentive,
      id: getAssetIdFromAddress(incentive.rewardTokenAddress),
    }))

  const validIncentivesIds = validIncentives.map((incentive) => incentive.id)

  return (
    <DetailedApy
      description={t("apy.rewards.description")}
      items={[
        ...(omnipoolFee
          ? [
              {
                label: t("apr.lpFeeOmnipool"),
                value: t("percent", { value: omnipoolFee }),
              },
            ]
          : []),
        ...(Big(apy).gt(0) && Big(lpAPY).gt(0)
          ? [
              {
                label: omnipoolFee ? t("apr.lpFeeStablepool") : t("apr.lpFee"),
                value: t("percent", { value: lpAPY }),
              },
            ]
          : []),
        ...underlyingAssetsApyData.map(
          ({ id, isStaked, borrowApy, supplyApy }) => ({
            assetId: id,
            label: isStaked
              ? t("stakeApy")
              : isSupply
                ? t("supplyApy")
                : t("borrowApy"),
            value: t("percent", {
              value: isSupply ? supplyApy : borrowApy,
            }),
          }),
        ),
        ...validIncentives.map(({ incentiveAPR, id }) => ({
          assetId: id,
          label: t("incentivesApr"),
          value: t("percent", {
            value: Big(incentiveAPR).times(100),
          }),
        })),
      ]}
      {...props}
    >
      {validIncentivesIds.length > 0 && (
        <AssetLogo size="extra-small" id={validIncentivesIds} />
      )}
      <Text color={getToken("text.high")}>
        {t("percent", {
          value: apy,
        })}
      </Text>
    </DetailedApy>
  )
}
