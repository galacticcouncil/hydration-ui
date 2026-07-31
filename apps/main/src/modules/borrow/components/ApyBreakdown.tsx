import { Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
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
  const { t } = useTranslation("common")

  const { totalSupplyApy, totalBorrowApy, incentives } = apyData

  const isSupply = type === "supply"
  const baseApy = isSupply ? totalSupplyApy : totalBorrowApy
  const apy =
    baseApy === null
      ? null
      : Big(baseApy)
          .plus(omnipoolFee ?? 0)
          .toNumber()

  const description =
    apy === null ? (
      <Flex direction="column" gap="s">
        <Text fs="p6" fw={500}>
          {t("apy.rewards.description")}
        </Text>
        <Text fs="p6" fw={500} color={getToken("accents.alertAlt.primary")}>
          {t("externalApy.alert")}
        </Text>
      </Flex>
    ) : (
      t("apy.rewards.description")
    )

  return (
    <DetailedApy apyData={apyData} description={description} {...props}>
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
