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

  return (
    <Flex
      gap={20}
      justify="space-between"
      sx={{ py: 20, overflowX: "auto", height: 85 }}
    >
      {myLiquidity ? (
        <MyLiquidity />
      ) : type === "all" ? (
        <AllPools />
      ) : type === "omnipoolStablepool" ? (
        <Omnipool />
      ) : (
        <Isolated />
      )}
    </Flex>
  )
}
