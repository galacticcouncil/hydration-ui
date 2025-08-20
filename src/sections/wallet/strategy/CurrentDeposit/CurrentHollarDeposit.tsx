import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { CurrentDepositBalance } from "./CurrentDepositBalance"
import { useTranslation } from "react-i18next"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useAssetsPrice } from "state/displayPrice"
import { Text } from "components/Typography/Text/Text"
import { CurrentDepositEmptyState } from "./CurrentDepositEmptyState"

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
      <div sx={{ flex: "column", gap: 8 }}>
        <Text fw={500} fs={14} lh="1">
          {t("wallet.strategy.deposit.myDeposit")}
        </Text>
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          {userBalances.map(({ userShiftedBalance, meta }, index) => {
            const assetPrice = getAssetPrice(meta.id)

            const balance = BN(userShiftedBalance)

            return (
              <CurrentDepositBalance
                key={meta.id}
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
            css={{ borderColor: "rgba(255,255,255,0.2)", alignSelf: "start" }}
            onClick={() => setIsRemoveModalOpen(true)}
          >
            {t("withdraw")}
          </Button>
        </div>
      </div>

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
