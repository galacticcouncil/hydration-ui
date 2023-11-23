import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { SContainer, SGridContainer } from "sections/pools/pool/Pool.styled"
import { PoolDetails } from "sections/pools/pool/details/PoolDetails"
import { PoolValue } from "sections/pools/pool/details/PoolValue"
import { PoolActions } from "sections/pools/pool/actions/PoolActions"
import { XYKPosition } from "./position/XYKPosition"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

type Props = { pool: TXYKPool }

export const XYKPool = ({ pool }: Props) => {
  const { account } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const queryClient = useQueryClient()

  const hasExpandContent = !!pool.shareTokenUserPosition

  const handleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  const refetchPositions = () => {
    queryClient.refetchQueries(
      QUERY_KEYS.accountOmnipoolPositions(account?.address),
    )
    queryClient.refetchQueries(
      QUERY_KEYS.tokenBalance(pool.assets[0], account?.address),
    )
    queryClient.refetchQueries(
      QUERY_KEYS.tokenBalance(pool.assets[1], account?.address),
    )
  }

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails pool={pool} css={{ gridArea: "details" }} />
        <div css={{ gridArea: "incentives" }} />
        <PoolValue pool={pool} css={{ gridArea: "values" }} />
        <PoolActions
          pool={pool}
          canExpand={hasExpandContent}
          isExpanded={isExpanded}
          onExpandClick={handleExpand}
          refetchPositions={refetchPositions}
          css={{ gridArea: "actions" }}
        />
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
              {pool.shareTokenUserPosition && <XYKPosition pool={pool} />}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </SContainer>
  )
}
