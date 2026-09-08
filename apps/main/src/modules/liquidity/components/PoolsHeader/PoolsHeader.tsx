import { Flex } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"

import { ENV } from "@/config/env"

import { AllPools } from "./AllPools"
import { Isolated } from "./Isolated"
import { MyLiquidity } from "./MyLiquidity"
import { Omnipool } from "./Omnipool"
import { VaultsValueTile } from "./Vaults"

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
      ) : type === "vaults" && ENV.VITE_UNIV3_GAMMA_ENABLED ? (
        <VaultsValueTile withPoolValue />
      ) : isIsolated ? (
        <Isolated />
      ) : (
        <Omnipool />
      )}
    </Flex>
  )
}
