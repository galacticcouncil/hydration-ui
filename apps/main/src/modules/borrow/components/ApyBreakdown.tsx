import { FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { ApyType, BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { DetailedApy } from "@/components/DetailedApy/DetailedApy"
import { useApyBreakdownItems } from "@/modules/borrow/hooks/useApyBreakdownItems"

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

  const apyBreakdownItems = useApyBreakdownItems({
    type,
    omnipoolFee,
    lpAPY,
    underlyingAssetsApyData,
    incentives,
  })

  return (
    <DetailedApy
      description={t("apy.rewards.description")}
      items={apyBreakdownItems}
      {...props}
    >
      {incentives.length > 0 && (
        <AssetLogo
          size="extra-small"
          id={incentives.map(({ rewardTokenAddress }) =>
            getAssetIdFromAddress(rewardTokenAddress),
          )}
        />
      )}
      <Text color={getToken("text.high")}>
        {t("percent", {
          value: apy,
        })}
      </Text>
    </DetailedApy>
  )
}
