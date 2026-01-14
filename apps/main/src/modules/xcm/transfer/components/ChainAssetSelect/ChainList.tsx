import {
  Box,
  Button,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain } from "@galacticcouncil/xc-core"

import { ChainLogo } from "@/components/ChainLogo"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"

const CHAIN_ITEM_HEIGHT = 40
const MAX_VISIBLE_CHAIN_ITEMS = 10

export type ChainListProps = {
  items: ChainAssetPair[]
  selectedChain: AnyChain | null
  setSelectedChain: (chain: AnyChain | null) => void
}

export const ChainList: React.FC<ChainListProps> = ({
  items,
  selectedChain,
  setSelectedChain,
}) => {
  return (
    <VirtualizedList
      items={items}
      itemSize={CHAIN_ITEM_HEIGHT}
      maxVisibleItems={MAX_VISIBLE_CHAIN_ITEMS}
      initialScrollIndex={items.findIndex(
        ({ chain }) => chain.key === selectedChain?.key,
      )}
      sx={{
        px: 10,
        minHeight: CHAIN_ITEM_HEIGHT * MAX_VISIBLE_CHAIN_ITEMS,
      }}
      renderItem={({ chain }) => {
        const isActive = chain.key === selectedChain?.key

        return (
          <Box pb={4}>
            <Button
              variant={isActive ? "accent" : "transparent"}
              outline={isActive}
              sx={{
                width: [42, "100%"],
                justifyContent: "flex-start",
                px: 10,
              }}
              gap={4}
              onClick={() => setSelectedChain(chain)}
            >
              <ChainLogo chain={chain} size="small" />
              <Text display={["none", "block"]} color={getToken("text.medium")}>
                {chain.name}
              </Text>
            </Button>
          </Box>
        )
      }}
    />
  )
}
