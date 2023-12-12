import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"
import { SContainer, SGridContainer } from "./Pool.styled"
import { PoolDetails } from "./details/PoolDetails"
import { PoolValue } from "./details/PoolValue"
import { useEffect, useState } from "react"
import { PoolActions } from "./actions/PoolActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { PoolFooter } from "./footer/PoolFooter"
import { PoolIncentives } from "./details/PoolIncentives"
import { PoolCapacity } from "sections/pools/pool/capacity/PoolCapacity"
import { LiquidityPositionWrapper } from "./positions/LiquidityPositionWrapper"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { NATIVE_ASSET_ID } from "utils/api"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { StablepoolPosition } from "sections/pools/stablepool/positions/StablepoolPosition"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

type Props = { pool: TOmnipoolAsset }

export const Pool = ({ pool }: Props) => {
  const { account } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)
  const { warnings, setWarnings } = useWarningsStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const queryClient = useQueryClient()

  const hasExpandContent =
    !!pool.omnipoolNftPositions.length ||
    !!pool.miningNftPositions.length ||
    !!pool.stablepoolUserPosition?.gt(0)

  const handleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  useEffect(() => {
    if (pool.id === NATIVE_ASSET_ID) {
      if (
        pool.omnipoolNftPositions.length &&
        warnings.hdxLiquidity.visible == null
      ) {
        setWarnings("hdxLiquidity", true)
      }
    }
  }, [
    pool.id,
    warnings.hdxLiquidity.visible,
    setWarnings,
    pool.omnipoolNftPositions.length,
  ])

  const refetchPositions = () => {
    queryClient.refetchQueries(
      QUERY_KEYS.accountOmnipoolPositions(account?.address),
    )
  }

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails pool={pool} css={{ gridArea: "details" }} />
        <PoolIncentives poolId={pool.id} css={{ gridArea: "incentives" }} />
        <PoolValue pool={pool} css={{ gridArea: "values" }} />
        <PoolActions
          pool={pool}
          canExpand={hasExpandContent}
          isExpanded={isExpanded}
          onExpandClick={handleExpand}
          refetchPositions={refetchPositions}
          css={{ gridArea: "actions" }}
        />
        <PoolCapacity id={pool.id.toString()} css={{ gridArea: "capacity" }} />
      </SGridContainer>
      {isDesktop && hasExpandContent && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              {pool.isStablepool && (
                <StablepoolPosition
                  pool={pool}
                  refetchPositions={refetchPositions}
                />
              )}
              <LiquidityPositionWrapper
                pool={pool}
                refetchPositions={refetchPositions}
              />
              <FarmingPositionWrapper pool={pool} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {isDesktop && <PoolFooter pool={pool} />}
    </SContainer>
  )
}
