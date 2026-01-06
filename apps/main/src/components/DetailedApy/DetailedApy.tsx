import { Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"
import { useAssets } from "@/providers/assetsProvider"

export type ApyRowProps = {
  assetId?: string
  value: string | number
  label: string
}

export const ApyRow: React.FC<ApyRowProps> = ({ assetId, value, label }) => {
  const { getAsset } = useAssets()

  const asset = assetId ? getAsset(assetId) : null

  return (
    <Flex align="center" justify="space-between" gap={4}>
      <Flex gap={4} align="center">
        {asset && (
          <>
            <AssetLogo id={asset.id} size="extra-small" />
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              {asset.symbol}
            </Text>
          </>
        )}
        <Text
          fs="p5"
          fw={500}
          color={getToken("text.high")}
          transform={assetId ? "none" : "uppercase"}
        >
          {label}
        </Text>
      </Flex>
      <Text fs="p5" fw={500}>
        {value}
      </Text>
    </Flex>
  )
}

type DetailedApyProps = FlexProps & {
  children: React.ReactNode
  description?: string
  apyData: BorrowAssetApyData
}

export const DetailedApy: React.FC<DetailedApyProps> = ({
  children,
  description,
  apyData,
  ...props
}) => {
  return (
    <Flex gap={4} align="center" {...props}>
      {children}
      <TooltipAPR
        farms={[]}
        borrowApyData={apyData}
        lpAPY={apyData.lpAPY}
        description={description}
      />
    </Flex>
  )
}
