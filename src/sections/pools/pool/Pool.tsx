import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
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
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { PoolCapacity } from "sections/pools/pool/capacity/PoolCapacity"
import { LiquidityPositionWrapper } from "./positions/LiquidityPositionWrapper"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { useAccountDeposits } from "api/deposits"
import { PoolFooterWithNoFarms } from "./footer/PoolFooterWithNoFarms"
import { NATIVE_ASSET_ID } from "utils/api"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"

type Props = { pool: OmnipoolPool }

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

export const Pool = ({ pool }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { warnings, setWarnings } = useWarningsStore()

  const positions = usePoolPositions(pool.id)
  const accountDeposits = useAccountDeposits(enabledFarms ? pool.id : undefined)

  const hasExpandContent =
    !!positions.data?.length || !!accountDeposits.data?.length

  const poolId = pool.id.toString()

  const handleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  useEffect(() => {
    if (poolId === NATIVE_ASSET_ID) {
      if (positions.data.length && warnings.hdxLiquidity.visible == null) {
        setWarnings("hdxLiquidity", true)
      }
    }
  }, [
    poolId,
    warnings.hdxLiquidity.visible,
    setWarnings,
    positions.data?.length,
  ])

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails id={pool.id} css={{ gridArea: "details" }} />
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
          onExpandClick={handleExpand}
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
              <LiquidityPositionWrapper
                disableRemoveLiquidity={!pool.tradability.canRemoveLiquidity}
                poolId={pool.id}
                positions={positions}
              />
              {enabledFarms && (
                <FarmingPositionWrapper
                  poolId={pool.id}
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
