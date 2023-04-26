import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useAssetMetaList } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS, useApiPromise } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { STradingPairContainer } from "./RemoveLiquidity.styled"
import { RemoveLiquidityInput } from "./components/RemoveLiquidityInput"
import { RemoveLiquidityReward } from "./components/RemoveLiquidityReward"

type Props = {
  isOpen: boolean
  onClose: () => void
  position: HydraPositionsTableData
  onSuccess: () => void
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  onSuccess,
  position,
}: Props) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({ defaultValues: { value: 25 } })

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const apiIds = useApiIds()
  const metas = useAssetMetaList([apiIds.data?.hubId, position.assetId])

  const meta = metas.data?.find((m) => m.id.toString() === position.assetId)
  const lrnaMeta = metas.data?.find(
    (m) => m.id.toString() === apiIds.data?.hubId,
  )

  const value = form.watch("value")

  const removeSharesValue = useMemo(() => {
    return position.shares.div(100).times(value)
  }, [value, position])

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalance = useTokenBalance(
    position.assetId,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const omnipoolAsset = omnipoolAssets.data?.find(
    (a) => a.id.toString() === position.assetId,
  )

  const removeLiquidityValues = useMemo(() => {
    const positionPrice = position.price.times(BN_10.pow(18))
    if (omnipoolBalance.data && omnipoolAsset?.data) {
      const params: Parameters<typeof calculate_liquidity_out> = [
        omnipoolBalance.data.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.providedAmount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        removeSharesValue.toFixed(0),
      ]
      return {
        token: calculate_liquidity_out.apply(this, params),
        lrna: calculate_liquidity_lrna_out.apply(this, params),
      }
    }
  }, [omnipoolBalance, omnipoolAsset, position, removeSharesValue])

  const handleSubmit = async (values: FormValues<typeof form>) => {
    const value = position.shares.div(100).times(values.value)

    if (!(removeLiquidityValues && lrnaMeta && meta)) return

    const lrnaAsBigNumber = new BigNumber(removeLiquidityValues.lrna)

    await createTransaction(
      {
        tx: api.tx.omnipool.removeLiquidity(position.id, value.toFixed(0)),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="liquidity.remove.modal.toast.onLoading"
              tOptions={{
                value: value,
                amount: removeLiquidityValues.token,
                fixedPointScale: meta.decimals ?? 12,
                symbol: position.symbol,
                withLrna: lrnaAsBigNumber.isGreaterThan(0)
                  ? t("liquidity.remove.modal.toast.withLrna", {
                      lrna: lrnaAsBigNumber,
                      fixedPointScale: lrnaMeta.decimals.toString() ?? 12,
                    })
                  : "",
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.remove.modal.toast.onSuccess"
              tOptions={{
                value: value,
                amount: removeLiquidityValues.token,
                fixedPointScale: meta.decimals ?? 12,
                symbol: position.symbol,
                withLrna: lrnaAsBigNumber.isGreaterThan(0)
                  ? t("liquidity.remove.modal.toast.withLrna", {
                      lrna: lrnaAsBigNumber,
                      fixedPointScale: lrnaMeta.decimals.toString() ?? 12,
                    })
                  : "",
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <Modal
      open={isOpen}
      title={t("liquidity.remove.modal.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{ flex: "column", justify: "space-between" }}
      >
        <div>
          <Text fs={32} font="FontOver">
            {t("liquidity.remove.modal.value", {
              value: getFloatingPointAmount(
                removeSharesValue,
                meta?.decimals.toNumber() ?? 12,
              ),
            })}
          </Text>
          <Text fs={18} font="FontOver" color="pink500" sx={{ mb: 20 }}>
            {t("value.percentage", { value })}
          </Text>
          <Controller
            name="value"
            control={form.control}
            render={({ field }) => (
              <RemoveLiquidityInput
                value={field.value}
                onChange={field.onChange}
                shares={getFloatingPointAmount(
                  position.shares,
                  meta?.decimals.toNumber() ?? 12,
                )}
              />
            )}
          />

          <STradingPairContainer>
            <Text color="brightBlue300">
              {t("liquidity.remove.modal.receive")}
            </Text>

            <RemoveLiquidityReward
              name={position.name}
              symbol={position.symbol}
              amount={t("value", {
                value: removeLiquidityValues?.token,
                fixedPointScale: meta?.decimals.toString() ?? 12,
                type: "token",
              })}
            />
            {removeLiquidityValues &&
              !BigNumber(removeLiquidityValues.lrna).isZero() && (
                <RemoveLiquidityReward
                  name="Lerna"
                  symbol="LRNA"
                  amount={t("value", {
                    value: removeLiquidityValues?.lrna,
                    fixedPointScale: lrnaMeta?.decimals.toString() ?? 12,
                    type: "token",
                  })}
                />
              )}
          </STradingPairContainer>
        </div>
        <Spacer size={20} />
        <Button variant="primary" type="submit">
          {t("liquidity.remove.modal.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
