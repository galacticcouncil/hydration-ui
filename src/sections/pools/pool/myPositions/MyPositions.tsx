import { useQueryClient } from "@tanstack/react-query"
import { useTokenBalance } from "api/balances"
import { SSeparator } from "components/Separator/Separator.styled"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { TPoolFullData, TXYKPool } from "sections/pools/PoolsPage.utils"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { XYKPosition } from "sections/pools/pool/xykPosition/XYKPosition"
import { StablepoolPosition } from "sections/pools/stablepool/positions/StablepoolPosition"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_0 } from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"

export const MyPositions = ({ pool }: { pool: TPoolFullData }) => {
  const { account } = useAccount()
  const { t } = useTranslation()
  const miningPositions = useAllUserDepositShare()

  const stablepoolBalance = useTokenBalance(
    pool.isStablePool ? pool.id : undefined,
    account?.address,
  )

  const queryClient = useQueryClient()

  const totalOmnipool = useMemo(() => {
    if (pool.omnipoolNftPositions) {
      return pool.omnipoolNftPositions.reduce(
        (acc, position) => acc.plus(position.valueDisplay),
        BN_0,
      )
    }
    return BN_0
  }, [pool.omnipoolNftPositions])

  const totalFarms = useMemo(() => {
    if (!miningPositions.data[pool.id]) return BN_0
    return miningPositions.data[pool.id].reduce((memo, share) => {
      return memo.plus(share.valueDisplay)
    }, BN_0)
  }, [miningPositions.data, pool.id])

  if (
    !pool.miningNftPositions.length &&
    !pool.omnipoolNftPositions.length &&
    !stablepoolBalance.data?.freeBalance
  )
    return null

  const refetchPositions = () => {
    queryClient.refetchQueries(
      QUERY_KEYS.accountOmnipoolPositions(account?.address),
    )
  }

  return (
    <div sx={{ flex: "column", gap: 12, p: ["30px 12px", 30], bg: "gray" }}>
      <Text fs={15} font="FontOver">
        {t("liquidity.pool.positions.title")}
      </Text>

      <div sx={{ flex: "row", gap: 104, py: 16 }}>
        <div sx={{ flex: "column", gap: 6 }}>
          <Text fs={12} color="basic400">
            {t("liquidity.pool.positions.omnipool")}
          </Text>
          <Text color="white">{t("value.usd", { amount: totalOmnipool })}</Text>
        </div>
        {!totalFarms.isZero() && (
          <>
            <SSeparator color="white" opacity={0.06} orientation="vertical" />
            <div sx={{ flex: "column", gap: 6 }}>
              <Text fs={12} color="basic400">
                {t("liquidity.pool.positions.farming")}
              </Text>
              <Text color="white">
                {t("value.usd", { amount: totalFarms })}
              </Text>
            </div>
          </>
        )}
      </div>

      <SSeparator color="darkBlue401" />

      {pool.isStablePool && (
        <StablepoolPosition pool={pool} refetchPositions={refetchPositions} />
      )}

      <LiquidityPositionWrapper
        pool={pool}
        positions={pool.omnipoolNftPositions}
        refetchPositions={refetchPositions}
      />
      <FarmingPositionWrapper pool={pool} positions={pool.miningNftPositions} />
    </div>
  )
}

export const MyXYKPositions = ({ pool }: { pool: TXYKPool }) => {
  return <XYKPosition pool={pool} />
}
