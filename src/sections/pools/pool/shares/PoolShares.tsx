import { FC } from "react"
import {
  SContainer,
  SDetails,
} from "sections/pools/pool/shares/PoolShares.styled"
import { useTranslation } from "react-i18next"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Box } from "components/Box/Box"
import { useDeposits } from "api/deposits"
import { PoolPositionList } from "sections/pools/pool/position/list/PoolPositionList"
import { PoolBase } from "@galacticcouncil/sdk"
import { usePoolShareToken } from "api/pools"
import { PoolSharesValue } from "sections/pools/pool/shares/value/PoolSharesValue"
import { PoolSharesUnstaked } from "sections/pools/pool/shares/unstaked/PoolSharesUnstaked"
import { useStore } from "state/store"
import { useTokenBalance } from "api/balances"
import { PoolSharesApr } from "sections/pools/pool/shares/apr/PoolSharesAPR"

type Props = { pool: PoolBase }

export const PoolShares: FC<Props> = ({ pool }) => {
  const { t } = useTranslation()

  const { account } = useStore()
  const deposits = useDeposits(pool.address) // TODO: filter deposits belonging to current account
  const shareToken = usePoolShareToken(pool.address)
  const balance = useTokenBalance(shareToken.data?.token, account?.address)

  return (
    <SContainer>
      <GradientText fs={16} lh={22} mb={12}>
        {t("pools.pool.liquidity.title")}
      </GradientText>
      {balance.data && (
        <SDetails>
          <PoolSharesUnstaked balance={balance.data.balance} />
          <PoolSharesValue
            shareToken={shareToken.data?.token}
            pool={pool}
            shareTokenBalance={balance.data.balance}
          />
          <PoolSharesApr poolId={pool.address} />
        </SDetails>
      )}
      {!!deposits.data?.length && (
        <Box flex column gap={12} mt={32}>
          {deposits.data.map(({ id, deposit }, i) => (
            <PoolPositionList
              key={id.toString()}
              deposit={deposit}
              index={i + 1}
            />
          ))}
        </Box>
      )}
    </SContainer>
  )
}
