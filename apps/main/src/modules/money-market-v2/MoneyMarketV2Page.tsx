import { getMarket } from "@galacticcouncil/money-market-v2/core"
import {
  MoneyMarketProvider,
  useAccountSummary,
  useReserveSummaries,
  useWalletBalances,
} from "@galacticcouncil/money-market-v2/react"
import type {
  Account,
  IncentiveApr,
  PositionSummary,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import {
  Alert,
  Flex,
  Paper,
  Separator,
  Spinner,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { FC, ReactNode, useMemo } from "react"
import { Address, isAddress } from "viem"

import { createMoneyMarketConfig } from "@/modules/money-market-v2/config"
import { useRpcProvider } from "@/providers/rpcProvider"

const MARKET = getMarket("hydration_v3")

/**
 * A developer-only surface for comparing money-market-v2's numbers against the
 * live borrow UI. It reads exclusively from `@galacticcouncil/money-market-v2`
 * and is deliberately built from plain UI primitives - no styling work, no new
 * components, and nothing here is meant to ship to users. Strings stay inline
 * rather than going through i18n for the same reason.
 */
export const MoneyMarketV2Page: FC = () => {
  const { papiClient, isReady } = useRpcProvider()

  const config = useMemo(
    () => (isReady ? createMoneyMarketConfig(papiClient) : null),
    [papiClient, isReady],
  )

  if (!config) {
    return (
      <Flex justify="center" p="xl">
        <Spinner />
      </Flex>
    )
  }

  return (
    <MoneyMarketProvider config={config} market={MARKET}>
      <MoneyMarketV2Debug />
    </MoneyMarketProvider>
  )
}

const MoneyMarketV2Debug: FC = () => {
  const evmAddress = useEvmAddress()
  const user: Address | undefined = isAddress(evmAddress ?? "")
    ? (evmAddress as Address)
    : undefined

  const reserves = useReserveSummaries()
  const account = useAccountSummary(user)
  const balances = useWalletBalances(user)

  return (
    <Flex direction="column" gap="xl" p="base" maxWidth={1200} mx="auto">
      <Flex direction="column" gap="s">
        <Text fs="h4" fw={600}>
          Money Market v2 — debug
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {MARKET.marketTitle} ({MARKET.market}) · pool {MARKET.addresses.POOL}
        </Text>
      </Flex>

      <Alert
        variant="warning"
        title="Some numbers are expected to differ from the live borrow UI"
        description={
          "Incentive APRs and any base APY the live UI overrides are computed here " +
          "straight from chain state, with no overrides applied. A difference in " +
          "those two places is expected and is not a bug. Everything else — total " +
          "liquidity, total debt, prices, health factor, borrowing power — should " +
          "match."
        }
      />

      <Section title="Account" state={account}>
        {account.data && (
          <AccountPanel account={account.data.account} user={user} />
        )}
      </Section>

      <Section title="Positions" state={account}>
        {account.data &&
          (account.data.positions.length === 0 ? (
            <Empty>No positions.</Empty>
          ) : (
            <Flex direction="column" gap="base">
              {account.data.positions.map((position) => (
                <PositionPanel
                  key={position.underlyingAsset}
                  position={position}
                />
              ))}
            </Flex>
          ))}
      </Section>

      <Section title="Wallet balances" state={balances}>
        {balances.data &&
          (balances.data.balances.length === 0 ? (
            <Empty>No wallet balances.</Empty>
          ) : (
            <Flex direction="column" gap="s">
              {balances.data.balances.map((balance) => (
                <Row
                  key={balance.underlyingAsset}
                  label={balance.underlyingAsset}
                  value={balance.amount}
                />
              ))}
            </Flex>
          ))}
      </Section>

      <Section title="Reserves" state={reserves}>
        {reserves.data && (
          <Flex direction="column" gap="base">
            {reserves.data.map((reserve) => (
              <ReservePanel key={reserve.underlyingAsset} reserve={reserve} />
            ))}
          </Flex>
        )}
      </Section>
    </Flex>
  )
}

type SectionState = {
  isPending: boolean
  isError: boolean
  error: Error | null
}

const Section: FC<{
  title: string
  state: SectionState
  children: ReactNode
}> = ({ title, state, children }) => (
  <Flex direction="column" gap="s">
    <Text fs="p2" fw={600}>
      {title}
    </Text>
    <Paper variant="bordered" p="base">
      {state.isPending ? (
        <Spinner />
      ) : state.isError ? (
        <Alert
          variant="error"
          title={state.error?.name ?? "Read failed"}
          description={state.error?.message}
        />
      ) : (
        children
      )}
    </Paper>
  </Flex>
)

const Empty: FC<{ children: ReactNode }> = ({ children }) => (
  <Text fs="p5" color={getToken("text.medium")}>
    {children}
  </Text>
)

const Row: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <Flex justify="space-between" gap="base">
    <Text fs="p6" color={getToken("text.medium")}>
      {label}
    </Text>
    <Text fs="p6" wordBreak="break-all" align="right">
      {value}
    </Text>
  </Flex>
)

const AccountPanel: FC<{ account: Account; user: Address | undefined }> = ({
  account,
  user,
}) => (
  <Flex direction="column" gap="s">
    <Row label="address" value={user ?? "not connected"} />
    <Row label="healthFactor" value={account.healthFactor} />
    <Row label="netWorthUsd" value={account.netWorthUsd} />
    <Row label="totalLiquidityUsd" value={account.totalLiquidityUsd} />
    <Row label="totalCollateralUsd" value={account.totalCollateralUsd} />
    <Row label="totalBorrowsUsd" value={account.totalBorrowsUsd} />
    <Row label="availableBorrowsUsd" value={account.availableBorrowsUsd} />
    <Row label="currentLoanToValue" value={account.currentLoanToValue} />
    <Row
      label="currentLiquidationThreshold"
      value={account.currentLiquidationThreshold}
    />
    <Row label="eModeCategoryId" value={account.eModeCategoryId} />
    <Row label="isInIsolationMode" value={String(account.isInIsolationMode)} />
    <Row label="isolatedReserve" value={account.isolatedReserve ?? "—"} />
  </Flex>
)

const PositionPanel: FC<{ position: PositionSummary }> = ({ position }) => (
  <Flex direction="column" gap="s">
    <Text fs="p5" fw={600}>
      {position.symbol}
    </Text>
    <Row label="underlyingBalance" value={position.underlyingBalance} />
    <Row label="underlyingBalanceUsd" value={position.underlyingBalanceUsd} />
    <Row label="variableBorrows" value={position.variableBorrows} />
    <Row label="variableBorrowsUsd" value={position.variableBorrowsUsd} />
    <Row
      label="usageAsCollateralEnabledOnUser"
      value={String(position.usageAsCollateralEnabledOnUser)}
    />
    <Rewards rewards={position.rewards} />
    <Separator />
  </Flex>
)

const Rewards: FC<{ rewards: PositionSummary["rewards"] }> = ({ rewards }) =>
  rewards.length === 0 ? (
    <Row label="rewards" value="none" />
  ) : (
    <>
      {rewards.map((reward) => (
        <Row
          key={reward.rewardTokenAddress}
          label={`reward ${reward.rewardTokenSymbol}`}
          value={`${reward.amount} (${reward.amountUsd} USD)`}
        />
      ))}
    </>
  )

const ReservePanel: FC<{ reserve: ReserveSummary }> = ({ reserve }) => (
  <Flex direction="column" gap="s">
    <Text fs="p5" fw={600}>
      {reserve.symbol}
    </Text>
    <Row label="underlyingAsset" value={reserve.underlyingAsset} />
    <Row label="priceInUsd" value={reserve.priceInUsd} />
    <Row label="supplyApy" value={reserve.supplyApy} />
    <Row label="supplyApr" value={reserve.supplyApr} />
    <Row label="variableBorrowApy" value={reserve.variableBorrowApy} />
    <Row label="variableBorrowApr" value={reserve.variableBorrowApr} />
    <Row label="totalLiquidity" value={reserve.totalLiquidity} />
    <Row label="totalLiquidityUsd" value={reserve.totalLiquidityUsd} />
    <Row label="availableLiquidityUsd" value={reserve.availableLiquidityUsd} />
    <Row label="totalDebt" value={reserve.totalDebt} />
    <Row label="totalDebtUsd" value={reserve.totalDebtUsd} />
    <Row label="supplyUsageRatio" value={reserve.supplyUsageRatio} />
    <Row label="borrowUsageRatio" value={reserve.borrowUsageRatio} />
    <Row label="ltv" value={reserve.ltv} />
    <Row label="liquidationThreshold" value={reserve.liquidationThreshold} />
    <Row label="eModeCategoryId" value={reserve.eModeCategoryId} />
    <IncentiveAprs label="supply" incentives={reserve.supplyIncentives} />
    <IncentiveAprs label="borrow" incentives={reserve.borrowIncentives} />
    <Separator />
  </Flex>
)

const IncentiveAprs: FC<{ label: string; incentives: IncentiveApr[] }> = ({
  label,
  incentives,
}) =>
  incentives.length === 0 ? (
    <Row label={`${label} incentives`} value="none" />
  ) : (
    <>
      {incentives.map((incentive) => (
        <Row
          key={incentive.rewardTokenAddress}
          label={`${label} incentive ${incentive.rewardTokenSymbol}`}
          value={`APR ${incentive.rewardApr} · price ${incentive.rewardPriceInUsd} USD`}
        />
      ))}
    </>
  )
