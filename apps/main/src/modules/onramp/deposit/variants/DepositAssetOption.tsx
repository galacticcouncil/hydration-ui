import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { FC } from "react"

import { ChainLogo } from "@/components/ChainLogo"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"

type DepositAssetOptionProps = {
  asset: Asset
  chain: AnyChain
  supportedNetworks?: AnyChain[]
  onSelect: () => void
  isSelected?: boolean
}

export const DepositAssetOption: FC<DepositAssetOptionProps> = ({
  asset,
  chain,
  supportedNetworks,
  onSelect,
  isSelected,
}) => {
  return (
    <Button
      variant={isSelected ? "tertiary" : "ghost"}
      width="100%"
      onClick={onSelect}
      aria-pressed={isSelected}
      sx={{
        height: "auto",
        px: "m",
        py: "m",
        borderRadius: "m",
        gridTemplateColumns: "minmax(0, 1fr)",
      }}
    >
      <Flex gap="m" align="center" width="100%">
        <XAssetLogo asset={asset} chain={chain} showChainLogo={false} />
        <Stack gap="s" flex={1} align="start">
          <Text fs="p3" fw={500} color={getToken("text.high")}>
            {asset.originSymbol}
          </Text>
          {!!supportedNetworks?.length && (
            <Flex gap="xs" align="center" wrap>
              {supportedNetworks.map((network) => (
                <ChainLogo
                  key={network.key}
                  ecosystem={network.ecosystem}
                  chainId={getChainId(network)}
                  size="extra-small"
                  alt={network.name}
                />
              ))}
            </Flex>
          )}
        </Stack>
        <Icon component={ChevronRight} size="m" />
      </Flex>
    </Button>
  )
}
