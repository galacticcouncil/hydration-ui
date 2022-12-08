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
import { LiquidityPositions } from "./positions/LiquidityPositions"
import { PoolIncentives } from "./details/PoolIncentives"

type Props = { pool: OmnipoolPool }

export const Pool = ({ pool }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails pool={pool} />
        <PoolIncentives />
        <PoolValue pool={pool} />
        <PoolActions
          pool={pool}
          isExpanded={isExpanded}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
        />
      </SGridContainer>
      {isDesktop && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              <LiquidityPositions pool={pool} />
              {/*TODO: Add Farm Positions */}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {isDesktop && <PoolFooter />}
    </SContainer>
  )
}
