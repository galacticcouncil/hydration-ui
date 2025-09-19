import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { CurrentDepositBalance } from "./CurrentDepositBalance"
import { useTranslation } from "react-i18next"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { useState } from "react"
import { useAssetsPrice } from "state/displayPrice"
import { CurrentDepositEmptyState } from "./CurrentDepositEmptyState"
import {
  SCurrentHollarDepositValues,
  SCurrentHollarDepositGrid,
} from "./CurrentDeposit.styled"
import { Separator } from "components/Separator/Separator"
import { CurrentHollarDepositModal } from "./CurrentHollarDepositModal"
import { BN_0 } from "utils/constants"
import { useMedia } from "react-use"
import { theme } from "theme"

export const CurrentHollarDeposit = ({ pools }: { pools: THollarPool[] }) => {
  const { t } = useTranslation()
  const isMobile = useMedia(theme.viewport.lt.sm)
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
    <SCurrentHollarDepositGrid>
      <div sx={{ display: ["column", "flex"], width: ["100%", "auto"] }}>
        <CurrentDepositBalance
          label={`${t("totalBalance")}:`}
          balance={t("value.usd", {
            amount: total,
          })}
        />
        {isMobile ? (
          <Separator
            color="white"
            sx={{ opacity: 0.06, width: "100%", mt: 20 }}
          />
        ) : (
          <Separator
            orientation="vertical"
            color="white"
            sx={{ opacity: 0.06, height: "100%", ml: "25%" }}
          />
        )}
      </div>

      <SCurrentHollarDepositValues>
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
      </SCurrentHollarDepositValues>

      <Button
        size="compact"
        variant="outline"
        disabled={!userBalances.length}
        onClick={() => setIsRemoveModalOpen(true)}
        sx={{ ml: [0, "auto"], mt: 10 }}
      >
        {t("withdraw")}
      </Button>

      {isRemoveModalOpen && (
        <CurrentHollarDepositModal
          userBalances={userBalances}
          userBalancesIds={userBalancesIds}
          onClose={() => setIsRemoveModalOpen(false)}
        />
      )}
    </SCurrentHollarDepositGrid>
  )
}
