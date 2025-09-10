import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { CurrentDepositBalance } from "./CurrentDepositBalance"
import { useTranslation } from "react-i18next"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { useState } from "react"
import { useAssetsPrice } from "state/displayPrice"
import { CurrentDepositEmptyState } from "./CurrentDepositEmptyState"
import { SCurrentHollarDeposit } from "./CurrentDeposit.styled"
import { Separator } from "components/Separator/Separator"
import { CurrentHollarDepositModal } from "./CurrentHollarDepositModal"
import { BN_0 } from "utils/constants"

export const CurrentHollarDeposit = ({ pools }: { pools: THollarPool[] }) => {
  const { t } = useTranslation()
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  const userBalances = pools.filter((pool) => BN(pool.userShiftedBalance).gt(0))
  const userBalancesIds = userBalances.map((userBalance) => userBalance.meta.id)

  const { getAssetPrice } = useAssetsPrice(userBalancesIds)

  if (!userBalances.length) {
    return (
      <CurrentDepositEmptyState
        emptyState={t("wallet.strategy.hollar.emptyState")}
      />
    )
  }

  const userDisplayBalances = userBalances.map((userBalance) => {
    const { meta, userShiftedBalance } = userBalance
    const assetPrice = getAssetPrice(meta.id)

    const balance = BN(userShiftedBalance)

    return { ...userBalance, balanceDisplay: balance.times(assetPrice.price) }
  })

  const total = userDisplayBalances.reduce(
    (acc, userBalance) => acc.plus(userBalance.balanceDisplay),
    BN_0,
  )

  return (
    <>
      <CurrentDepositBalance
        label={t("totalBalance")}
        balance={t("value.usd", {
          amount: total,
        })}
      />
      <Separator
        color="white"
        sx={{ height: 1, width: "100%", opacity: 0.06 }}
      />
      <SCurrentHollarDeposit>
        {userDisplayBalances.map(
          ({ userShiftedBalance, balanceDisplay, meta }, index) => {
            return (
              <CurrentDepositBalance
                key={meta.id}
                label={
                  index === 0
                    ? t("wallet.strategy.deposit.myDeposit", {
                        count: userBalances.length,
                      })
                    : undefined
                }
                balance={t("value.tokenWithSymbol", {
                  value: BN(userShiftedBalance),
                  symbol: meta.symbol,
                })}
                value={t("value.usd", {
                  amount: balanceDisplay,
                })}
              />
            )
          },
        )}
        <Button
          size="compact"
          variant="outline"
          disabled={!userBalances.length}
          css={{
            borderColor: "rgba(255,255,255,0.2)",
            alignSelf: "center",
            width: "fit-content",
          }}
          onClick={() => setIsRemoveModalOpen(true)}
        >
          {t("withdraw")}
        </Button>
      </SCurrentHollarDeposit>

      {isRemoveModalOpen && (
        <CurrentHollarDepositModal
          userBalances={userBalances}
          userBalancesIds={userBalancesIds}
          onClose={() => setIsRemoveModalOpen(false)}
        />
      )}
    </>
  )
}
