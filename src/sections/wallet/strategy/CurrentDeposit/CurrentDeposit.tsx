import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { useAssets } from "providers/assets"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { Reward } from "sections/lending/helpers/types"
import {
  SCurrentDeposit,
  SCurrentDepositContainer,
} from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit.styled"
import { CurrentDepositBalance } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositBalance"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAssetsPrice } from "state/displayPrice"
import { BN_0, GETH_ERC20_ASSET_ID } from "utils/constants"
import { useUserRewards } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"
import { TDeposit, useAccountBalances, useAccountPositions } from "api/deposits"
import { CurrentDepositEmptyState } from "./CurrentDepositEmptyState"
import { CurrentDepositFarmsClaimReward } from "./CurrentDepositFarmsClaimReward"
import Skeleton from "react-loading-skeleton"
import { useAllOmnipoolDeposits } from "sections/pools/farms/position/FarmingPosition.utils"
import { TRemoveFarmingPosition } from "sections/wallet/strategy/RemoveDepositModal/RemoveDeposit.utils"
import { useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

export type CurrentDepositData = {
  readonly depositBalance: string
  readonly reward: Reward
}

type Props = {
  readonly stableswapId: string
  readonly aTokenId: string
  readonly emptyState: string
}

export const CurrentDeposit: FC<Props> = ({
  aTokenId,
  stableswapId,
  emptyState,
}) => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(aTokenId)

  const { data: accountAssets, isLoading: isAccountAssetsLoading } =
    useAccountBalances()
  const { data: accountPositions } = useAccountPositions()

  const accountAsset = accountAssets?.accountAssetsMap.get(aTokenId)
  const positions = accountPositions?.accountAssetsMap.get(aTokenId)

  const depositBalance = new BigNumber(
    accountAsset?.balance?.total || "0",
  ).shiftedBy(-asset.decimals)

  const maxBalance = new BigNumber(
    accountAsset?.balance?.transferable || "0",
  ).shiftedBy(-asset.decimals)

  const miningPositions = positions?.omnipoolDeposits ?? []
  const isMiningPositions = !!miningPositions.length

  const reward = useUserRewards([stableswapId])

  const hasBalance =
    depositBalance.gt(0) || BigNumber(reward.balance).gt(0) || isMiningPositions

  const isGETH = aTokenId && aTokenId === GETH_ERC20_ASSET_ID

  if (isAccountAssetsLoading)
    return (
      <div sx={{ pb: [0, 30] }}>
        <Skeleton width="100%" height={20} />
        <Skeleton width="70%" height={20} sx={{ mt: 4 }} />
      </div>
    )

  if (!hasBalance) return <CurrentDepositEmptyState emptyState={emptyState} />

  return (
    <SCurrentDeposit>
      {isGETH ? (
        <FarmsDepositBalance
          assetId={aTokenId}
          symbol={asset.symbol}
          miningPositions={miningPositions}
        />
      ) : (
        <DepositBalance
          assetId={aTokenId}
          symbol={asset.symbol}
          balance={depositBalance.toString()}
          maxBalance={maxBalance.toString()}
        />
      )}

      {isGETH ? (
        <>
          <CurrentDepositSeparator />
          <CurrentDepositFarmsClaimReward assetId={aTokenId} />
        </>
      ) : null}
    </SCurrentDeposit>
  )
}

const DepositBalance = ({
  assetId,
  symbol,
  balance,
  maxBalance,
}: {
  assetId: string
  symbol: string
  balance: string
  maxBalance: string
}) => {
  const { t } = useTranslation()
  const { getAssetPrice, isLoading } = useAssetsPrice([assetId])
  const spotPrice = getAssetPrice(assetId).price || "0"

  const depositValue = new BigNumber(spotPrice).times(balance || "0").toString()

  return (
    <SCurrentDepositContainer>
      <CurrentDepositBalance
        label={t("wallet.strategy.deposit.myDeposit", { count: 1 })}
        balance={t("value.tokenWithSymbol", {
          value: BigNumber(balance),
          symbol,
        })}
        isLoading={isLoading}
        value={t("value.usd", { amount: depositValue })}
      />
      <CurrentDepositRemoveButton
        assetId={assetId}
        depositBalance={balance}
        maxBalance={maxBalance}
      />
    </SCurrentDepositContainer>
  )
}

const FarmsDepositBalance = ({
  assetId,
  symbol,
  miningPositions,
}: {
  assetId: string
  symbol: string
  miningPositions: TDeposit[]
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const omnipoolDepositValues = useAllOmnipoolDeposits(account?.address)
  const assetDeposits = omnipoolDepositValues[assetId] ?? []

  const { totalValue, display, positions } = assetDeposits.reduce<{
    positions: TRemoveFarmingPosition[]
    totalValue: BigNumber
    display: BigNumber
  }>(
    (acc, position) => {
      const miningPosition = miningPositions.find(
        (miningPosition) => miningPosition.id === position.depositId,
      )

      if (miningPosition) {
        return {
          totalValue: acc.totalValue.plus(position.totalValueShifted),
          display: acc.display.plus(position.valueDisplay),
          positions: [...acc.positions, { ...miningPosition, ...position }],
        }
      }

      return acc
    },
    { totalValue: BN_0, display: BN_0, positions: [] },
  )

  return (
    <SCurrentDepositContainer>
      <CurrentDepositBalance
        label={t("wallet.strategy.deposit.myDeposit", { count: 1 })}
        balance={t("value.tokenWithSymbol", {
          value: totalValue,
          symbol,
        })}
        value={t("value.usd", { amount: display })}
      />
      <CurrentDepositRemoveButton
        assetId={assetId}
        depositBalance={totalValue.toString()}
        maxBalance={totalValue.toString()}
        positions={positions}
      />
    </SCurrentDepositContainer>
  )
}

const CurrentDepositRemoveButton = ({
  assetId,
  depositBalance,
  positions,
  maxBalance,
}: {
  assetId: string
  depositBalance: string
  positions?: TRemoveFarmingPosition[]
  maxBalance: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  return (
    <>
      <Button
        size="compact"
        variant="outline"
        disabled={new BigNumber(depositBalance).lte(0)}
        onClick={() =>
          positions
            ? navigate({ to: LINKS.allPools, search: { id: assetId } })
            : setIsRemoveModalOpen(true)
        }
      >
        {t("withdraw")}
      </Button>
      <Modal
        open={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
      >
        <RemoveDepositModal
          assetId={assetId}
          maxBalance={maxBalance}
          onClose={() => setIsRemoveModalOpen(false)}
        />
      </Modal>
    </>
  )
}

const CurrentDepositSeparator: FC = () => {
  return (
    <>
      <Separator
        orientation="vertical"
        color="white"
        sx={{ height: "100%", display: ["none", "initial"], opacity: 0.06 }}
      />
      <Separator
        sx={{ display: ["initial", "none"] }}
        color="white"
        css={{ gridColumn: "1/-1", opacity: 0.06 }}
      />
    </>
  )
}
