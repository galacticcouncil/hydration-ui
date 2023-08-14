import { SContainer, SGridContainer } from "sections/pools/pool/Pool.styled"
import { PoolDetails } from "./details/PoolDetails"
import { PoolValue } from "./details/PoolValue"
import { PoolActions } from "./actions/PoolActions"
import { PoolIncentives } from "./details/PoolIncentives"
import { useOmnipoolStablePools } from "../PoolsPage.utils"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { LiquidityPositionWrapper } from "./positions/LiquidityPositionWrapper"
import { useTokenBalance } from "api/balances"
import { useAccountStore } from "state/store"
import { BN_0 } from "utils/constants"

type Props = Exclude<
  ReturnType<typeof useOmnipoolStablePools>["data"],
  undefined
>[number]

const STABLEPOOL_INCENTIVES_ENABLED = false

export const StablePool = ({
  id,
  tradeFee,
  assets,
  total,
  balanceByAsset,
  assetMetaById,
  withdrawFee,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { account } = useAccountStore()
  const position = useTokenBalance(id.toString(), account?.address)

  const amount = position?.data?.freeBalance ?? BN_0
  const hasPosition = amount?.isGreaterThan(BN_0)

  return (
    <SContainer id={id.toString()}>
      <SGridContainer>
        <PoolDetails
          assets={assets}
          tradeFee={tradeFee}
          css={{ gridArea: "details" }}
        />
        {STABLEPOOL_INCENTIVES_ENABLED ? (
          <PoolIncentives poolId={id} css={{ gridArea: "incentives" }} />
        ) : (
          <div css={{ gridArea: "incentives" }} />
        )}
        <PoolValue total={total.value} css={{ gridArea: "values" }} />
        <PoolActions
          poolId={id}
          assets={assets}
          tradeFee={tradeFee}
          css={{ gridArea: "actions" }}
          balanceByAsset={balanceByAsset}
          assetMetaById={assetMetaById}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
          isExpanded={isExpanded}
          canExpand={hasPosition}
          refetchPositions={position.refetch}
        />
      </SGridContainer>
      {isDesktop && hasPosition && (
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
                poolId={id}
                assets={assets}
                amount={amount}
                withdrawFee={withdrawFee}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </SContainer>
  )
}
