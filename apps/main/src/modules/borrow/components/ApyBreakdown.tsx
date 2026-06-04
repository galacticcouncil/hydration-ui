import { FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { ApyType, BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { DetailedApy } from "@/components/DetailedApy/DetailedApy"
import { formatApyPercent } from "@/utils/formatApyPercent"

export type ApyBreakdownProps = FlexProps & {
  type: ApyType
  assetId: string
  withFarms?: boolean
  omnipoolFee?: string
  apyData: BorrowAssetApyData
}

export const ApyBreakdown: React.FC<ApyBreakdownProps> = ({
  type,
  omnipoolFee,
  apyData,
  ...props
}) => {
  const { t } = useTranslation()

  const { totalSupplyApy, totalBorrowApy, incentives } = apyData

  const isSupply = type === "supply"
  const baseApy = isSupply ? totalSupplyApy : totalBorrowApy
  const apy =
    baseApy === null
      ? null
      : Big(baseApy)
          .plus(omnipoolFee ?? 0)
          .toNumber()

  return (
    <DetailedApy
      apyData={apyData}
      description={t("apy.rewards.description")}
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
      <Text color={getToken("text.high")}>{formatApyPercent(t, apy)}</Text>
    </DetailedApy>
  )
}
