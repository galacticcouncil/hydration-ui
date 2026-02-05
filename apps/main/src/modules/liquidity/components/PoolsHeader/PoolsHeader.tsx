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
      gap={["l", isIsolated ? "5.625rem" : "xl"]}
      justify={isIsolated ? "flex-start" : "space-between"}
      sx={{ pb: "xxl", overflowX: "auto" }}
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
