import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { ApyRow } from "@/components/DetailedApy/DetailedApy"
import { useApyBreakdownItems } from "@/modules/borrow/hooks/useApyBreakdownItems"
import { useAssets } from "@/providers/assetsProvider"

export const TooltipAPR = ({
  omnipoolFee,
  stablepoolFee,
  farms,
  borrowApyData,
}: {
  omnipoolFee?: string
  stablepoolFee?: string
  farms: Farm[]
  borrowApyData?: BorrowAssetApyData
}) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { getAssetWithFallback } = useAssets()

  if (!farms.length && !borrowApyData) return null

  return (
    <Tooltip
      text={
        <Flex direction="column" gap={4}>
          <Text fs={12}>{t("liquidity:liquidity.tooltip.fee.apr.title")}</Text>

          {omnipoolFee && (
            <Row
              label={t("liquidity:liquidity.tooltip.fee.apr.omnipoolFee")}
              value={t("percent", { value: omnipoolFee })}
            />
          )}

          {stablepoolFee && (
            <Row
              label={t("liquidity:liquidity.tooltip.fee.apr.stablepoolFee")}
              value={t("percent", { value: stablepoolFee })}
            />
          )}

          {borrowApyData && (
            <BorrowApyBreakdown borrowApyData={borrowApyData} />
          )}

          {!!farms?.length && (
            <>
              <Row
                label={t("liquidity:liquidity.tooltip.fee.apr.farmRewardsApr")}
                value={
                  <Text
                    transform="uppercase"
                    fs={10}
                    color={getToken("text.medium")}
                  >
                    {t("liquidity:liquidity.tooltip.fee.apr.apr")}
                  </Text>
                }
              />
              {farms.map((farm, index) => (
                <Row
                  key={`${farm.rewardCurrency}-${index}`}
                  label={
                    <Flex align="center" gap={4}>
                      <AssetLogo
                        id={farm.rewardCurrency.toString()}
                        size="small"
                      />
                      <Text>
                        {
                          getAssetWithFallback(farm.rewardCurrency.toString())
                            .symbol
                        }
                      </Text>
                    </Flex>
                  }
                  value={t("percent", { value: farm.apr })}
                />
              ))}
            </>
          )}
        </Flex>
      }
    />
  )
}

const BorrowApyBreakdown = ({
  borrowApyData,
  omnipoolFee,
}: {
  borrowApyData: BorrowAssetApyData
  omnipoolFee?: string
}) => {
  const { lpAPY, underlyingAssetsApyData, incentives } = borrowApyData

  const apyBreakdownItems = useApyBreakdownItems({
    type: "supply",
    omnipoolFee,
    lpAPY,
    underlyingAssetsApyData,
    incentives,
  })

  return (
    <Flex direction="column" gap={4}>
      {apyBreakdownItems.map((props, index) => (
        <ApyRow key={`${props.label}-${index}`} {...props} />
      ))}
    </Flex>
  )
}

const Row = ({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) => {
  return (
    <Flex justify="space-between" align="center">
      <Text transform="uppercase" fs={10} color={getToken("text.medium")}>
        {label}
      </Text>
      <Text
        transform="uppercase"
        fs={12}
        color={getToken("text.high")}
        fw={500}
      >
        {value}
      </Text>
    </Flex>
  )
}
