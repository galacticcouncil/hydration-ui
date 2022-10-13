import { FC, useState } from "react"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { PoolIncentives } from "sections/pools/pool/incentives/PoolIncentives"
import { SContainer } from "sections/pools/pool/Pool.styled"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolBase } from "@galacticcouncil/sdk"
import { PoolShares } from "sections/pools/pool/shares/PoolShares"
import { AnimatePresence, motion } from "framer-motion"
import { PoolFooter } from "sections/pools/pool/footer/PoolFooter"

type Props = { pool: PoolBase }

export const Pool: FC<Props> = ({ pool }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <SContainer>
      <div sx={{ flex: "row", justify: "space-between", p: 24, gap: 10 }}>
        <PoolDetails pool={pool} />
        <PoolIncentives poolId={pool.address} />
        <PoolActions
          pool={pool}
          isExpanded={isExpanded}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
        />
      </div>
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
      <PoolFooter pool={pool} />
    </SContainer>
  )
}
