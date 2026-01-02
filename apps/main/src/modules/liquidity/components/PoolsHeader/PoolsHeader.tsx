import { Flex } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"

import { AllPools } from "./AllPools"
import { Isolated } from "./Isolated"
import { MyLiquidity } from "./MyLiquidity"
import { Omnipool } from "./Omnipool"

export const PoolsHeader = () => {
  const { myLiquidity, type } = useSearch({
    from: "/liquidity/",
  })
  const isIsolated = type === "isolated"

  return (
    <Flex
      gap={[15, isIsolated ? 90 : 20]}
      justify={isIsolated ? "flex-start" : "space-between"}
      sx={{ py: 20, overflowX: "auto", height: 85 }}
    >
      {myLiquidity ? (
        <MyLiquidity />
      ) : type === "all" ? (
        <AllPools />
      ) : isIsolated ? (
        <Isolated />
      ) : (
        <Omnipool />
      )}
    </Flex>
  )
}
