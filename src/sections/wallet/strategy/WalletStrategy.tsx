import { useRpcProvider } from "providers/rpcProvider"
import { FC } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { StrategyTile } from "sections/wallet/strategy/StrategyTile/StrategyTile"
import { useMoneyMarketInit } from "sections/lending/utils/marketsAndNetworksConfig"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import { useGigadotAssetIds } from "sections/wallet/strategy/WalletStrategy.utils"
import {
  BN_0,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  HOLLAR_ASSETS,
} from "utils/constants"
import { useTranslation } from "react-i18next"
import { StrategyTileVariant } from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { HollarTile } from "./StrategyTile/HollarTile"
import { useRootStore } from "sections/lending/store/root"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { ProtocolAction } from "@aave/contract-helpers"
import { ClaimStrategyRewardsArgs } from "sections/lending/store/poolSlice"
import { Separator } from "components/Separator/Separator"
import { getAddressFromAssetId } from "utils/evm"
import BN from "bignumber.js"
import { getDeploymentType } from "utils/helpers"

const ClaimButton = ({
  reward,
  accrued,
  unclaimed,
  rewardTokenSymbol,
}: {
  reward: ClaimStrategyRewardsArgs
  accrued: string
  unclaimed: string
  rewardTokenSymbol: string
}) => {
  const { t } = useTranslation()
  const claimStrategyRewards = useRootStore(
    (state) => state.claimStrategyRewards,
  )
  const { action } = useTransactionHandler({
    protocolAction: ProtocolAction.claimRewards,
    tryPermit: false,
    handleGetTxns: async () => {
      return claimStrategyRewards(reward)
    },
    deps: [reward],
  })

  return (
    <div sx={{ flex: "row", gap: 10, align: "center" }}>
      <div sx={{ flex: "column" }}>
        <div sx={{ flex: "row" }}>
          <Text sx={{ width: 100 }} fs={14} font="GeistMono">
            Accrued
          </Text>
          <Text fs={14} font="GeistMono">
            {t("value.tokenWithSymbol", {
              value: accrued,
              decimalPlaces: 6,
              symbol: rewardTokenSymbol,
            })}
          </Text>
        </div>
        <div sx={{ flex: "row" }}>
          <Text sx={{ width: 100 }} fs={14} font="GeistMono">
            Unclaimed
          </Text>
          <Text fs={14} font="GeistMono">
            {t("value.tokenWithSymbol", {
              value: unclaimed,
              decimalPlaces: 6,
              symbol: rewardTokenSymbol,
            })}
          </Text>
        </div>
        <div sx={{ flex: "row" }}>
          <Text
            sx={{ width: 100 }}
            fs={14}
            font="GeistMono"
            color="brightBlue300"
          >
            Total
          </Text>
          <Text fs={14} font="GeistMono" color="brightBlue300">
            {t("value.tokenWithSymbol", {
              value: BN(unclaimed).plus(accrued),
              decimalPlaces: 6,
              symbol: rewardTokenSymbol,
            })}
          </Text>
        </div>
      </div>
      <Button
        size="micro"
        onClick={() => action()}
        variant="primary"
        sx={{ ml: 40 }}
      >
        Claim
      </Button>
    </div>
  )
}

const HOLLAR_RESERVES = HOLLAR_ASSETS.map((id) => getAddressFromAssetId(id))

const ClaimDebug = () => {
  const { reserves, userReserveIncentives } = useAppDataContext()

  const hollarReserves = reserves.filter(({ underlyingAsset }) =>
    HOLLAR_RESERVES.includes(underlyingAsset),
  )

  const gdotIncentive = userReserveIncentives.find(
    ({ rewardTokenSymbol }) => rewardTokenSymbol === "GDOT",
  )

  const hollarIncentives = userReserveIncentives.filter(
    ({ reserveUnderlyingAsset }) =>
      hollarReserves.find(
        (reserve) => reserve.underlyingAsset === reserveUnderlyingAsset,
      ),
  )

  return (
    <div sx={{ flex: "column", gap: 10, mb: 20 }}>
      {MONEY_MARKET_GIGA_RESERVES.map((address) => {
        const reserve = reserves.find((r) => r.underlyingAsset === address)
        if (!reserve) return null

        const incentive = userReserveIncentives.find(
          (i) => i.reserveSymbol === reserve.symbol,
        )

        if (!incentive) return null

        return (
          <div key={address}>
            <Text sx={{ mb: 10 }}>{reserve.symbol}</Text>
            <ClaimButton
              rewardTokenSymbol={incentive.rewardTokenSymbol}
              accrued={incentive.accruedRewardsHuman}
              unclaimed={incentive.unclaimedRewardsHuman}
              reward={{
                assets: [reserve.aTokenAddress],
                incentivesControllerAddress: incentive.incentiveController,
                rewardTokenAddress: incentive.rewardTokenAddress,
              }}
            />
            <Separator sx={{ my: 20 }} color="basic600" />
          </div>
        )
      })}

      {gdotIncentive && (
        <div>
          <Text sx={{ mb: 10 }}>
            {hollarIncentives
              .map(({ reserveSymbol }) => reserveSymbol)
              .join(" + ")}
          </Text>
          <ClaimButton
            rewardTokenSymbol={gdotIncentive.rewardTokenSymbol}
            accrued={hollarIncentives
              .reduce((prev, curr) => prev.plus(curr.accruedRewardsHuman), BN_0)
              .toString()}
            unclaimed={gdotIncentive.unclaimedRewardsHuman}
            reward={{
              assets: hollarReserves.map(({ aTokenAddress }) => aTokenAddress),
              incentivesControllerAddress: gdotIncentive.incentiveController,
              rewardTokenAddress: gdotIncentive.rewardTokenAddress,
            }}
          />
        </div>
      )}
    </div>
  )
}

export const WalletStrategy: FC = () => {
  const { t } = useTranslation()
  const { gdotAssetId, underlyingGdotAssetId } = useGigadotAssetIds()
  const { isLoaded } = useRpcProvider()

  const { isLoading: isMoneyMarketLoading } = useMoneyMarketInit()

  if (!isLoaded || isMoneyMarketLoading) {
    return <WalletStrategySkeleton />
  }

  return (
    <WalletStrategyProviders>
      {getDeploymentType() !== "hollarnet" && <ClaimDebug />}
      <SWalletStrategy>
        <WalletStrategyHeader />
        <HollarTile />
        <StrategyTile
          stableswapId={gdotAssetId}
          aTokenId={underlyingGdotAssetId}
          emptyState={t("wallet.strategy.gigadot.emptyState")}
          riskTooltip={t("wallet.strategy.gigadot.risk.tooltip")}
          variant={StrategyTileVariant.One}
        />
        <StrategyTile
          stableswapId={GETH_STABLESWAP_ASSET_ID}
          aTokenId={GETH_ERC20_ASSET_ID}
          emptyState={t("wallet.strategy.geth.emptyState")}
          riskTooltip={t("wallet.strategy.geth.risk.tooltip")}
          variant={StrategyTileVariant.Two}
        />
      </SWalletStrategy>
    </WalletStrategyProviders>
  )
}
