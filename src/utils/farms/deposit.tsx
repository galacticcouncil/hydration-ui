import { useMutation } from "@tanstack/react-query"
import { Farm } from "api/farms"
import { StepProps } from "components/Stepper/Stepper"
import { Trans, useTranslation } from "react-i18next"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { TOAST_MESSAGES } from "state/toasts"
import { scale } from "utils/balance"

export type FarmDepositMutationType = ReturnType<typeof useFarmDepositMutation>

export const useFarmDepositMutation = (
  poolId: string,
  farms: Farm[],
  onClose: () => void,
  onSuccess: () => void,
) => {
  const { createTransaction } = useStore()
  const { api, assets } = useRpcProvider()
  const { t } = useTranslation()

  const meta = assets.getAsset(poolId)
  const isXYK = assets.isShareToken(meta)

  return useMutation(
    async ({ shares, positionId }: { shares: string; positionId: string }) => {
      const [firstFarm, ...restFarm] = farms ?? []
      if (firstFarm == null) throw new Error("Missing farm")

      const toast = TOAST_MESSAGES.reduce((memo, type) => {
        const msType = type === "onError" ? "onLoading" : type
        memo[type] = (
          <Trans
            t={t}
            i18nKey={`farms.modal.join.toast.${msType}`}
            tOptions={{
              amount: shares,
            }}
          >
            <span />
            <span className="highlight" />
          </Trans>
        )
        return memo
      }, {} as ToastMessage)

      const firstStep: StepProps[] = [
        {
          label: t("farms.modal.join.step", { number: 1 }),
          state: "active",
        },
        {
          label: t("farms.modal.join.step", { number: 2 }),
          state: "todo",
        },
      ]

      const firstDeposit = await createTransaction(
        {
          tx: isXYK
            ? api.tx.xykLiquidityMining.depositShares(
                firstFarm.globalFarm.id,
                firstFarm.yieldFarm.id,
                { assetIn: meta.assets[0], assetOut: meta.assets[1] },
                scale(shares, meta.decimals).toString(),
              )
            : api.tx.omnipoolLiquidityMining.depositShares(
                firstFarm.globalFarm.id,
                firstFarm.yieldFarm.id,
                positionId,
              ),
        },
        {
          toast,
          steps: restFarm.length ? firstStep : undefined,
          onSubmitted: onClose,
          onClose,
          onBack: () => {},
        },
      )

      for (const record of firstDeposit.events) {
        if (
          api.events.omnipoolLiquidityMining.SharesDeposited.is(record.event)
        ) {
          const depositId = record.event.data.depositId

          const secondStep: StepProps[] = [
            {
              label: t("farms.modal.join.step", { number: 1 }),
              state: "done",
            },
            {
              label: t("farms.modal.join.step", { number: 2 }),
              state: "active",
            },
          ]

          const txs = restFarm.map((farm) =>
            isXYK
              ? api.tx.xykLiquidityMining.redepositShares(
                  firstFarm.globalFarm.id,
                  firstFarm.yieldFarm.id,
                  { assetIn: meta.assets[0], assetOut: meta.assets[1] },
                  depositId,
                )
              : api.tx.omnipoolLiquidityMining.redepositShares(
                  farm.globalFarm.id,
                  farm.yieldFarm.id,
                  depositId,
                ),
          )

          if (txs.length > 0) {
            await createTransaction(
              {
                tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0],
              },
              { toast, steps: secondStep },
            )
          }
        }
      }
    },
    { onSuccess },
  )
}
