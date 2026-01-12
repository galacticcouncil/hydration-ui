import {
  Box,
  Flex,
  InfoTooltipProps,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { ApyRow } from "@/components/DetailedApy/DetailedApy"
import { useApyBreakdownItems } from "@/modules/borrow/hooks/useApyBreakdownItems"
import { useAssets } from "@/providers/assetsProvider"

export const TooltipAPR = ({
  lpAPY,
  omnipoolFee,
  stablepoolFee,
  farms,
  borrowApyData,
  description,
  ...props
}: {
  lpAPY?: number
  omnipoolFee?: string
  stablepoolFee?: string
  farms: { rewardCurrency: number; apr: string }[]
  borrowApyData?: BorrowAssetApyData
  description?: string
} & Omit<InfoTooltipProps, "text">) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { getAssetWithFallback } = useAssets()

  if (!farms.length && !borrowApyData) return null

  return (
    <Tooltip
      asChild
      preventDefault
      {...props}
      text={
        <Flex direction="column" gap={8}>
          <Text fs="p6" fw={500} mb={6}>
            {description ?? t("liquidity:liquidity.tooltip.fee.apr.title")}
          </Text>

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

          {lpAPY && (
            <Row
              label={t("apr.lpFee")}
              value={t("percent", { value: lpAPY })}
            />
          )}

          {borrowApyData && (
            <BorrowApyBreakdown borrowApyData={borrowApyData} />
          )}

          {!!farms?.length && (
            <Box>
              <Row
                label={t("liquidity:liquidity.tooltip.fee.apr.farmRewardsApr")}
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
                      <Text fs="p5" fw={500} color={getToken("text.high")}>
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
            </Box>
          )}
        </Flex>
      }
    />
  )
}

const BorrowApyBreakdown = ({
  borrowApyData,
}: {
  borrowApyData: BorrowAssetApyData
}) => {
  const { underlyingAssetsApyData, incentives } = borrowApyData

  const apyBreakdownItems = useApyBreakdownItems({
    type: "supply",
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
  value?: React.ReactNode
}) => {
  return (
    <Flex justify="space-between" align="center">
      {typeof label === "string" ? (
        <Text
          transform="uppercase"
          fs={8}
          fw={600}
          color={getToken("text.medium")}
        >
          {label}
        </Text>
      ) : (
        label
      )}
      {value && typeof value === "string" ? (
        <Text
          transform="uppercase"
          fs="p5"
          color={getToken("text.high")}
          fw={500}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </Flex>
  )
}
