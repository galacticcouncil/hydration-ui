import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { useAssets } from "providers/assets"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { Reward } from "sections/lending/helpers/types"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { SCurrentDeposit } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit.styled"
import { CurrentDepositBalance } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositBalance"
import { CurrentDepositBindAccount } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositBindAccount"
import { CurrentDepositClaimReward } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositClaimReward"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAssetsPrice } from "state/displayPrice"
import { GETH_ERC20_ASSET_ID, GETH_STABLESWAP_ASSET_ID } from "utils/constants"
import { useAssetReward } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"
import { useAccountAssets } from "api/deposits"
import { CurrentDepositEmptyState } from "./CurrentDepositEmptyState"
import { CurrentDepositFarmsClaimReward } from "./CurrentDepositFarmsClaimReward"
import Skeleton from "react-loading-skeleton"

export type CurrentDepositData = {
  readonly depositBalance: string
  readonly reward: Reward
}

type Props = {
  readonly assetId: string
  readonly emptyState: string
}

export const CurrentDeposit: FC<Props> = ({ assetId, emptyState }) => {
  const { t } = useTranslation()
  const { isBound, isLoading: isLoadingEvmAccount } = useEvmAccount()

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets, isLoading: isAccountAssetsLoading } =
    useAccountAssets()

  const accountAsset = accountAssets?.accountAssetsMap.get(assetId)

  const depositBalance = new BigNumber(
    accountAsset?.balance?.balance || "0",
  ).shiftedBy(-asset.decimals)

  const isMiningPositions = !!accountAsset?.omnipoolDeposits?.length

  const reward = useAssetReward(assetId)

  const hasBalance =
    depositBalance.gt(0) || BigNumber(reward.balance).gt(0) || isMiningPositions

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  const { getAssetPrice, isLoading } = useAssetsPrice([assetId])
  const spotPrice = getAssetPrice(assetId).price || "0"

  const depositValue = new BigNumber(spotPrice)
    .times(depositBalance || "0")
    .toString()

  const isGETH = assetId && assetId === GETH_ERC20_ASSET_ID

  const { data: gethReserves } = useStableSwapReserves(
    isGETH ? GETH_STABLESWAP_ASSET_ID : "",
  )

  if (isAccountAssetsLoading || isLoading)
    return (
      <div sx={{ pb: [0, 30] }}>
        <Skeleton width="100%" height={20} />
        <Skeleton width="70%" height={20} sx={{ mt: 4 }} />
      </div>
    )

  if (!hasBalance) return <CurrentDepositEmptyState emptyState={emptyState} />

  const isAccountBindingRequired = !isLoadingEvmAccount && !isBound

  return (
    <SCurrentDeposit>
      <CurrentDepositBalance
        label={t("wallet.strategy.deposit.myDeposit")}
        balance={t("value.tokenWithSymbol", {
          value: depositBalance,
          symbol: asset.symbol,
        })}
        value={t("value.usd", { amount: depositValue })}
      />
      <Button
        size="small"
        variant="outline"
        css={{ borderColor: "rgba(255,255,255,0.2)" }}
        disabled={new BigNumber(depositBalance).lte(0)}
        onClick={() => setIsRemoveModalOpen(true)}
      >
        {t("remove")}
      </Button>
      <CurrentDepositSeparator />
      {isAccountBindingRequired ? (
        <CurrentDepositBindAccount />
      ) : isGETH ? (
        <CurrentDepositFarmsClaimReward assetId={assetId} />
      ) : (
        <CurrentDepositClaimReward reward={reward} />
      )}
      <Modal
        open={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
      >
        <RemoveDepositModal
          assetId={assetId}
          balance={depositBalance.toString()}
          onClose={() => setIsRemoveModalOpen(false)}
          assetReceiveId={gethReserves.biggestPercentage?.assetId}
        />
      </Modal>
    </SCurrentDeposit>
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
