import { FC, useState } from "react"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { PoolIncentives } from "sections/pools/pool/incentives/PoolIncentives"
import { SGridContainer, SContainer } from "sections/pools/pool/Pool.styled"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolBase } from "@galacticcouncil/sdk"
import { PoolShares } from "sections/pools/pool/shares/PoolShares"
import { AnimatePresence, motion } from "framer-motion"
import { PoolValue } from "./details/PoolValue"
import { PoolFooter } from "sections/pools/pool/footer/PoolFooter"
import { PositionChip } from "./position/chip/PoolPositionChip"
import { useMedia } from "react-use"
import { theme } from "theme"

type Props = { pool: PoolBase }

export const Pool: FC<Props> = ({ pool }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <SContainer id={pool.address}>
      <PositionChip
        sx={{ display: ["inline-block", "none"] }}
        poolId={pool.address}
      />
      <SGridContainer>
        <PoolDetails pool={pool} />
        <PoolIncentives poolId={pool.address} />
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
              <PoolShares pool={pool} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <PoolFooter pool={pool} />
    </SContainer>
  )
}
