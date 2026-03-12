import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getChainId } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { Link, useLocation } from "@tanstack/react-router"

import { ChainLogo } from "@/components/ChainLogo"
import { TabItem, TabMenu } from "@/components/TabMenu"
import {
  MULTICHAIN_CHAINS,
  MultichainChainKey,
} from "@/routes/wallet/multichain"

type ChainTabConfig = {
  key: MultichainChainKey
  name: string
  chainId: string | number
  ecosystem: ChainEcosystem
}

const CHAIN_TABS: ChainTabConfig[] = MULTICHAIN_CHAINS.map((key) => {
  const chain = chainsMap.get(key)!
  return {
    key,
    name: chain.name,
    chainId: getChainId(chain),
    ecosystem: chain.ecosystem ?? ChainEcosystem.Polkadot,
  }
})

const tabItems: TabItem[] = CHAIN_TABS.map((chain) => ({
  to: "/wallet/multichain",
  title: chain.name,
  search: { chain: chain.key },
  resetScroll: false,
}))

type ChainTabItemProps = {
  item: TabItem
  chain: ChainTabConfig
}

const ChainTabItem = ({ item, chain }: ChainTabItemProps) => {
  const currentSearch = useLocation({ select: (s) => s.search })
  const path = useLocation({ select: (s) => s.href })

  const isActive =
    path.startsWith(item.to) &&
    Object.entries(item.search ?? {}).every(
      ([key, value]) =>
        currentSearch[key as keyof typeof currentSearch] === value,
    )

  return (
    <Button
      variant={isActive ? "secondary" : "muted"}
      size="medium"
      asChild
      sx={{ minWidth: "2xl" }}
    >
      <Link
        to={item.to}
        search={{ ...currentSearch, ...item.search }}
        resetScroll={false}
      >
        <Flex align="center" gap="6px">
          <ChainLogo
            chainId={chain.chainId}
            ecosystem={chain.ecosystem}
            size="small"
          />
          <Text fs="p3" fw={500} color="inherit">
            {chain.name}
          </Text>
        </Flex>
      </Link>
    </Button>
  )
}

export const MultichainChainTabs = () => {
  return (
    <TabMenu
      items={tabItems}
      ignoreCurrentSearch
      renderItem={(item) => {
        const chain = CHAIN_TABS.find((c) => c.name === item.title)
        if (!chain) return null
        return <ChainTabItem item={item} chain={chain} />
      }}
    />
  )
}
