import {
  Box,
  Button,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import {
  XC_SWAP_CHAIN_ITEM_HEIGHT,
  XC_SWAP_MAX_VISIBLE_CHAIN_ITEMS,
} from "@/modules/trade/swap/sections/XcSwap/config/ui"
import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"

export type ChainListProps = {
  items: XcChain[]
  selectedChain: XcChain | null
  setSelectedChain: (chain: XcChain) => void
}

export const ChainList: React.FC<ChainListProps> = ({
  items,
  selectedChain,
  setSelectedChain,
}) => {
  const chainIndex = selectedChain
    ? items.findIndex(({ key }) => key === selectedChain.key)
    : 0

  const initialScrollIndex =
    chainIndex >= XC_SWAP_MAX_VISIBLE_CHAIN_ITEMS ? chainIndex : 0

  return (
    <VirtualizedList
      items={items}
      itemSize={XC_SWAP_CHAIN_ITEM_HEIGHT}
      maxVisibleItems={XC_SWAP_MAX_VISIBLE_CHAIN_ITEMS}
      initialScrollIndex={initialScrollIndex}
      sx={{
        px: "base",
        minHeight: XC_SWAP_CHAIN_ITEM_HEIGHT * XC_SWAP_MAX_VISIBLE_CHAIN_ITEMS,
      }}
      renderItem={(chain) => {
        const isActive = chain.key === selectedChain?.key

        return (
          <Box pb="s">
            <Button
              variant={isActive ? "accent" : "transparent"}
              outline={isActive}
              sx={{
                width: ["auto", "100%"],
                justifyContent: ["center", "flex-start"],
                height: "auto",
                px: "base",
              }}
              onClick={() => setSelectedChain(chain)}
            >
              <XcLogo src={chain.logo} size="small" />
              <Text
                display={["none", "block"]}
                color={
                  isActive ? getToken("text.high") : getToken("text.medium")
                }
              >
                {chain.name}
              </Text>
            </Button>
          </Box>
        )
      }}
    />
  )
}
