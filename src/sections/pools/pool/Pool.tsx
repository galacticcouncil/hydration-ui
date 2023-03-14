import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { SContainer, SGridContainer } from "./Pool.styled"
import { PoolDetails } from "./details/PoolDetails"
import { PoolValue } from "./details/PoolValue"
import { useState } from "react"
import { PoolActions } from "./actions/PoolActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { PoolFooter } from "./footer/PoolFooter"
import { PoolIncentives } from "./details/PoolIncentives"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { PoolCapacity } from "sections/pools/pool/capacity/PoolCapacity"
import { LiquidityPositionWrapper } from "./positions/LiquidityPositionWrapper"
import { FarmingPositionWrapper } from "../farms/FarmingPositionWrapper"
import { useAccountDeposits } from "api/deposits"
import { PoolFooterWithNoFarms } from "./footer/PoolFooterWithNoFarms"

type Props = { pool: OmnipoolPool }

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

export const Pool = ({ pool }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const positions = usePoolPositions(pool)
  const accountDeposits = useAccountDeposits(pool.id)

  const hasExpandContent =
    !!positions.data?.length || !!accountDeposits.data?.length

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails pool={pool} css={{ gridArea: "details" }} />
        {enabledFarms ? (
          <PoolIncentives poolId={pool.id} css={{ gridArea: "incentives" }} />
        ) : (
          <div css={{ gridArea: "incentives" }} />
        )}
        <PoolValue pool={pool} css={{ gridArea: "values" }} />
        <PoolActions
          pool={pool}
          refetch={positions.refetch}
          canExpand={!positions.isLoading && hasExpandContent}
          isExpanded={isExpanded}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
          css={{ gridArea: "actions" }}
        />
        <PoolCapacity pool={pool} css={{ gridArea: "capacity" }} />
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
              <LiquidityPositionWrapper pool={pool} positions={positions} />
              {enabledFarms && (
                <FarmingPositionWrapper
                  pool={pool}
                  deposits={accountDeposits.data}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {isDesktop &&
        (enabledFarms ? (
          <PoolFooter pool={pool} />
        ) : (
          <PoolFooterWithNoFarms pool={pool} />
        ))}
    </SContainer>
  )
}
