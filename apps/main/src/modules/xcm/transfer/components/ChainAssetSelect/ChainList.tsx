import {
  Box,
  Button,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
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
  const { isMobile } = useBreakpoints()
  const chainIndex = selectedChain
    ? items.findIndex(({ chain }) => chain.key === selectedChain.key)
    : 0

  const initialScrollIndex =
    chainIndex >= MAX_VISIBLE_CHAIN_ITEMS ? chainIndex : 0

  return (
    <VirtualizedList
      items={items}
      itemSize={CHAIN_ITEM_HEIGHT}
      maxVisibleItems={MAX_VISIBLE_CHAIN_ITEMS}
      initialScrollIndex={initialScrollIndex}
      sx={{
        px: "base",
        minHeight: CHAIN_ITEM_HEIGHT * MAX_VISIBLE_CHAIN_ITEMS,
      }}
      renderItem={({ chain }) => {
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
              <ChainLogo
                ecosystem={chain.ecosystem}
                chainId={getChainId(chain)}
                size={isMobile ? "medium" : "small"}
              />
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
