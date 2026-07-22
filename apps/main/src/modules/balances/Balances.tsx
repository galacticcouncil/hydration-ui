import {
  Box,
  Flex,
  SectionHeader,
  Spinner,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, useMemo } from "react"

import {
  useXcBalances,
  useXcBalancesSubscription,
} from "@/modules/balances/api/useXcBalances"
import { XcBalance, XcOcnUrn } from "@/modules/balances/api/xcBalanceTypes"
import { BalancesChainTable } from "@/modules/balances/components/BalancesChainTable"

type Props = {
  address: string
}

type ChainGroup = {
  chainId: XcOcnUrn
  balances: XcBalance[]
}

const groupByChain = (balances: ReadonlyArray<XcBalance>): ChainGroup[] => {
  const groups = new Map<XcOcnUrn, XcBalance[]>()

  for (const balance of balances) {
    const group = groups.get(balance.chainId)
    if (group) {
      group.push(balance)
    } else {
      groups.set(balance.chainId, [balance])
    }
  }

  return Array.from(groups, ([chainId, chainBalances]) => ({
    chainId,
    balances: chainBalances,
  }))
}

export const Balances: FC<Props> = ({ address }) => {
  useXcBalancesSubscription(address)
  const { data, isLoading } = useXcBalances(address)

  const groups = useMemo(() => groupByChain(data), [data])

  return (
    <Box>
      <SectionHeader noTopPadding title="Balances" />
      {isLoading ? (
        <Flex justify="center" py={40}>
          <Spinner />
        </Flex>
      ) : groups.length === 0 ? (
        <Text>No balances found</Text>
      ) : (
        <Flex direction="column" gap={20}>
          {groups.map((group) => (
            <BalancesChainTable
              key={group.chainId}
              chainId={group.chainId}
              balances={group.balances}
            />
          ))}
        </Flex>
      )}
    </Box>
  )
}
