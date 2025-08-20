import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { CurrentDepositBalance } from "./CurrentDepositBalance"
import { useTranslation } from "react-i18next"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useAssetsPrice } from "state/displayPrice"
import { CurrentDepositEmptyState } from "./CurrentDepositEmptyState"
import { SCurrentHollarDeposit } from "./CurrentDeposit.styled"

export const CurrentHollarDeposit = ({ pools }: { pools: THollarPool[] }) => {
  const { t } = useTranslation()
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  const userBalances = pools.filter((pool) => BN(pool.userShiftedBalance).gt(0))
  const userBalancesIds = userBalances.map((userBalance) => userBalance.meta.id)

  const { getAssetPrice } = useAssetsPrice(userBalancesIds)

  const [removeAsset, setRemoveAsset] = useState(userBalances[0]?.meta.id)

  if (!userBalances.length) {
    return (
      <CurrentDepositEmptyState
        emptyState={t("wallet.strategy.hollar.emptyState")}
      />
    )
  }

  return (
    <>
      <SCurrentHollarDeposit>
        {userBalances.map(({ userShiftedBalance, meta }, index) => {
          const assetPrice = getAssetPrice(meta.id)

          const balance = BN(userShiftedBalance)

          return (
            <CurrentDepositBalance
              key={meta.id}
              label={
                index === 0 ? t("wallet.strategy.deposit.myDeposit") : undefined
              }
              balance={t("value.tokenWithSymbol", {
                value: balance,
                symbol: meta.symbol,
              })}
              value={t("value.usd", {
                amount: balance.times(assetPrice.price),
              })}
            />
          )
        })}
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
        <Modal
          open={isRemoveModalOpen}
          onClose={() => setIsRemoveModalOpen(false)}
        >
          <RemoveDepositModal
            assetId={removeAsset}
            maxBalance={
              userBalances.find((pool) => pool.meta.id === removeAsset)
                ?.userShiftedBalance ?? "0"
            }
            setRemoveAsset={setRemoveAsset}
            removeAssets={userBalancesIds}
            onClose={() => setIsRemoveModalOpen(false)}
          />
        </Modal>
      )}
    </>
  )
}
