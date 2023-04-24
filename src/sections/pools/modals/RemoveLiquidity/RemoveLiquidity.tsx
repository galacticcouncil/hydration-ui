import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Button } from "components/Button/Button"
import { Input } from "components/Input/Input"
import { Modal } from "components/Modal/Modal"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { FormValues } from "utils/helpers"
import { RemoveLiquidityReward } from "./components/RemoveLiquidityReward"
import { SSlippage, STradingPairContainer } from "./RemoveLiquidity.styled"
import { HydraPositionsTableData } from "../../../wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"

import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useOmnipoolAssets } from "../../../../api/omnipool"
import { useTokenBalance } from "../../../../api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS, useApiPromise } from "../../../../utils/api"
import { BN_10 } from "../../../../utils/constants"
import { useAssetMetaList } from "../../../../api/assetMeta"
import { useApiIds } from "../../../../api/consts"
import BN from "bignumber.js"
import { getFloatingPointAmount } from "utils/balance"
import { useStore } from "../../../../state/store"
import BigNumber from "bignumber.js"
import { Spacer } from "components/Spacer/Spacer"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position: HydraPositionsTableData
  onSuccess: () => void
}

type RemoveLiquidityInputProps = {
  value: number
  onChange: (value: number) => void
  shares: BN
}

const options = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]

const RemoveLiquidityInput = ({
  value,
  onChange,
  shares,
}: RemoveLiquidityInputProps) => {
  const { t } = useTranslation()
  const [input, setInput] = useState("")

  const handleOnChange = (value: string) => {
    setInput(value)

    const parsedValue = Number.parseFloat(value)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      onChange(parsedValue)
    }
  }

  const onSelect = (value: number) => {
    setInput("")
    onChange(value)
  }

  return (
    <>
      <Slider
        value={[value]}
        onChange={([val]) => onSelect(val)}
        min={0}
        max={100}
        step={1}
      />

      <SSlippage>
        <BoxSwitch options={options} selected={value} onSelect={onSelect} />
        <Input
          value={input}
          onChange={handleOnChange}
          name="custom"
          label="Custom"
          placeholder="Custom"
          unit="%"
        />
        <div
          sx={{ flex: "row", justify: "end", gap: 4, mt: 9 }}
          css={{ gridColumn: "span 2" }}
        >
          <Text fs={11} css={{ opacity: 0.7 }}>
            {t("balance")}
          </Text>
          <Text fs={11}>{t("liquidity.remove.modal.shares", { shares })}</Text>
        </div>
      </SSlippage>
    </>
  )
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  onSuccess,
  position,
}: RemoveLiquidityProps) => {
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
      withoutOutsideClose
      title={t("liquidity.remove.modal.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          height: "calc(100% - var(--modal-header-title-height))",
        }}
      >
        <div>
          <Text fs={32} font="FontOver" sx={{ mt: 24 }}>
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
              !BN(removeLiquidityValues.lrna).isZero() && (
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
        <Button variant="primary">{t("liquidity.remove.modal.confirm")}</Button>
      </form>
    </Modal>
  )
}
