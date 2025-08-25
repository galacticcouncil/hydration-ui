import { ProtocolAction } from "@aave/contract-helpers"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { Reward } from "sections/lending/helpers/types"
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { useRootStore } from "sections/lending/store/root"
import { CurrentDepositBalance } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositBalance"
import BN from "bignumber.js"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export type CurrentDepositClaimRewardProps = {
  reward: Reward
}

export const CurrentDepositClaimReward: React.FC<
  CurrentDepositClaimRewardProps
> = ({ reward }) => {
  const claimRewards = useRootStore((state) => state.claimStrategyRewards)
  const { externalApyData } = useAppDataContext()
  const { t } = useTranslation()

  const { action } = useTransactionHandler({
    protocolAction: ProtocolAction.claimRewards,
    eventTxInfo: {
      assetName: reward.symbol,
      amount: reward.balance,
    },
    tryPermit: false,
    handleGetTxns: async () => {
      return claimRewards({
        isWrongNetwork: false,
        blocked: false,
        selectedReward: reward,
        claimableUsd: reward.balanceUsd,
        externalApyData,
      })
    },
    deps: [reward],
  })

  return (
    <>
      <CurrentDepositBalance
        variant="highlight"
        label={t("wallet.strategy.deposit.myRewards")}
        balance={t("value.tokenWithSymbol", {
          value: reward.balance,
          symbol: reward.symbol,
        })}
        value={t("value.usd", { amount: reward.balanceUsd })}
      />

      <Button
        variant="primary"
        size="compact"
        disabled={new BN(reward.balance).lte(0)}
        onClick={() => action()}
      >
        {t("claim")}
      </Button>
    </>
  )
}
