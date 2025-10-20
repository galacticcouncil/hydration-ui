import { Flex, FlexProps, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

type ApyRowProps = {
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
            <Text fs={11} fw={600} color={getToken("text.high")}>
              {asset.symbol}
            </Text>
          </>
        )}
        <Text
          fs={11}
          fw={500}
          color={getToken("text.medium")}
          transform={assetId ? "none" : "uppercase"}
        >
          {label}
        </Text>
      </Flex>
      <Text fs={12} fw={600}>
        {value}
      </Text>
    </Flex>
  )
}

type DetailedApyProps = FlexProps & {
  children: React.ReactNode
  description?: string
  items: ApyRowProps[]
}

export const DetailedApy: React.FC<DetailedApyProps> = ({
  children,
  description,
  items,
  ...props
}) => {
  return (
    <Flex gap={4} align="center" {...props}>
      {children}
      <Tooltip
        text={
          <Flex direction="column" gap={4}>
            {description && (
              <Text fs={12} fw={500}>
                {description}
              </Text>
            )}
            {items.map((props, index) => (
              <ApyRow key={`${props.label}-${index}`} {...props} />
            ))}
          </Flex>
        }
      />
    </Flex>
  )
}
