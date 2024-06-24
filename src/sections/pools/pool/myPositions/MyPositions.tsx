import { useTokenBalance } from "api/balances"
import { SSeparator } from "components/Separator/Separator.styled"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { TPoolFullData, TXYKPoolFullData } from "sections/pools/PoolsPage.utils"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { XYKPosition } from "sections/pools/pool/xykPosition/XYKPosition"
import { StablepoolPosition } from "sections/pools/stablepool/positions/StablepoolPosition"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_0 } from "utils/constants"

export const MyPositions = ({ pool }: { pool: TPoolFullData }) => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const { t } = useTranslation()
  const meta = assets.getAsset(pool.id)

  const stablepoolBalance = useTokenBalance(
    pool.isStablePool ? pool.id : undefined,
    account?.address,
  )

  const spotPrice = pool.spotPrice
  const stablepoolAmount = stablepoolBalance.data?.freeBalance ?? BN_0
  const stablepoolAmountPrice = spotPrice
    ? stablepoolAmount.shiftedBy(-meta.decimals).multipliedBy(spotPrice)
    : BN_0

  if (
    !pool.miningNftPositions.length &&
    !pool.omnipoolNftPositions.length &&
    !stablepoolBalance.data?.freeBalance
  )
    return null

  return (
    <>
      <Text
        fs={18}
        font="GeistMono"
        tTransform="uppercase"
        sx={{ px: 30, pt: 12 }}
      >
        {t("liquidity.pool.positions.title")}
      </Text>

      {pool.isStablePool && (
        <StablepoolPosition
          pool={pool}
          amount={stablepoolAmount}
          amountPrice={stablepoolAmountPrice}
        />
      )}
      <LiquidityPositionWrapper pool={pool} />
      <FarmingPositionWrapper pool={pool} />
    </>
  )
}

export const MyXYKPositions = ({ pool }: { pool: TXYKPoolFullData }) => {
  const { t } = useTranslation()

  const totalFarms = useMemo(() => {
    return pool.miningPositions.reduce((memo, share) => {
      return memo.plus(share.amountUSD ?? 0)
    }, BN_0)
  }, [pool.miningPositions])

  return (
    <div sx={{ flex: "column", gap: 12, p: ["30px 12px", 30], bg: "gray" }}>
      <Text fs={15} font="GeistMono">
        {t("liquidity.pool.positions.title")}
      </Text>
      {!totalFarms.isZero() && (
        <>
          <SSeparator color="white" opacity={0.06} orientation="vertical" />
          <div sx={{ flex: "column", gap: 6 }}>
            <Text color="basic400" fs={[12, 13]}>
              {t("liquidity.pool.positions.farming")}
            </Text>
            <Text color="white" fs={[14, 16]} fw={600}>
              {t("value.usd", { amount: totalFarms })}
            </Text>
          </div>
          <SSeparator color="darkBlue401" sx={{ my: 16 }} />
        </>
      )}
      <XYKPosition pool={pool} />
      <FarmingPositionWrapper pool={pool} />
    </div>
  )
}
