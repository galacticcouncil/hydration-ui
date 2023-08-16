import { default as BN, default as BigNumber } from "bignumber.js"
import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Button } from "components/Button/Button"
import { Input } from "components/Input/Input"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Slider } from "components/Slider/Slider"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { FormValues } from "utils/helpers"
import { SSlippage, STradingPairContainer } from "./RemoveLiquidity.styled"
import { RemoveLiquidityReward } from "./components/RemoveLiquidityReward"
import { theme } from "theme"
import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { u32 } from "@polkadot/types-codec"
import { useAssetMeta } from "api/assetMeta"
import { useStablepoolLiquidiyOut } from "./RemoveLiquidity.utils"

type RemoveLiquidityProps = {
  assetId?: string
  onClose: () => void
  position: {
    reserves: { asset_id: number; amount: string }[]
    poolId: u32
    amount: BigNumber
    shares: BigNumber
    price: BigNumber
    providedAmount: BigNumber
    withdrawFee: BigNumber
  }
  onSuccess: () => void
  onAssetOpen: () => void
}

type RemoveLiquidityInputProps = {
  value: number
  onChange: (value: number) => void
  amount: BN
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
  amount,
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
          label={t("custom")}
          placeholder={t("custom")}
          unit="%"
        />
        <div
          sx={{ flex: "row", justify: "end", gap: 4, mt: 9 }}
          css={{ gridColumn: "span 2" }}
        >
          <Text fs={11} css={{ opacity: 0.7 }}>
            {t("balance")} {t("value.token", { value: amount.toString() })}
          </Text>
        </div>
      </SSlippage>
    </>
  )
}

export const RemoveLiquidity = ({
  assetId,
  onClose,
  onSuccess,
  position,
  onAssetOpen,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({ defaultValues: { value: 25 } })
  const meta = useAssetMeta(assetId)

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const value = form.watch("value")

  const removeSharesValue = useMemo(() => {
    return position.amount.div(100).times(value)
  }, [value, position])

  const liquidityOut = useStablepoolLiquidiyOut({
    shares: removeSharesValue,
    reserves: position.reserves,
    poolId: position.poolId,
    asset: meta.data,
    withdrawFee: position.withdrawFee,
  })

  const handleSubmit = async (values: FormValues<typeof form>) => {
    const value = position.shares.div(100).times(values.value)

    await createTransaction(
      {
        tx: api.tx.stableswap.removeLiquidity(
          position.poolId,
          assetId,
          value.toFixed(0),
        ),
      },
      {
        onSuccess,
        onClose,
        onBack: () => {},
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
                // amount: removeLiquidityValues.tokensToGet,
                // fixedPointScale: meta.decimals ?? 12,
                // symbol: position.symbol,
                // withLrna: lrnaAsBigNumber.isGreaterThan(0)
                //   ? t("liquidity.remove.modal.toast.withLrna", {
                //       lrna: lrnaAsBigNumber,
                //       fixedPointScale: lrnaMeta.decimals.toString() ?? 12,
                //     })
                //   : "",
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
                // amount: removeLiquidityValues.tokensToGet,
                // fixedPointScale: meta.decimals ?? 12,
                // symbol: position.symbol,
                // withLrna: lrnaAsBigNumber.isGreaterThan(0)
                //   ? t("liquidity.remove.modal.toast.withLrna", {
                //       lrna: lrnaAsBigNumber,
                //       fixedPointScale: lrnaMeta.decimals.toString() ?? 12,
                //     })
                //   : "",
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

  // const isFeeExceeded = removeLiquidityValues?.withdrawalFee.gt(0.99)

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <ModalScrollableContent
        content={
          <>
            <div>
              <div sx={{ flex: "row", justify: "space-between" }}>
                <div>
                  <Text
                    fs={13}
                    lh={13}
                    sx={{ mb: 15 }}
                    css={{
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                      color: `rgba(${theme.rgbColors.whiteish500}, 0.6)`,
                    }}
                  >
                    {t("selectAsset.title")}
                  </Text>
                  <AssetSelectButton assetId={assetId} onClick={onAssetOpen} />
                </div>
                <div>
                  <Text fs={32} font="FontOver" sx={{ mt: 24 }}>
                    {t("liquidity.remove.modal.value", {
                      value: getFloatingPointAmount(
                        removeSharesValue,
                        STABLEPOOL_TOKEN_DECIMALS,
                      ),
                    })}
                  </Text>
                  <Text
                    fs={18}
                    font="FontOver"
                    color="pink500"
                    sx={{ mb: 20 }}
                    tAlign="right"
                  >
                    {t("value.percentage", { value })}
                  </Text>
                </div>
              </div>
              <Controller
                name="value"
                control={form.control}
                render={({ field }) => (
                  <RemoveLiquidityInput
                    value={field.value}
                    onChange={field.onChange}
                    amount={getFloatingPointAmount(
                      position.amount,
                      STABLEPOOL_TOKEN_DECIMALS,
                    )}
                  />
                )}
              />

              <STradingPairContainer>
                <Text color="brightBlue300">
                  {t("liquidity.remove.modal.receive")}
                </Text>
                {meta.data && (
                  <RemoveLiquidityReward
                    name={meta.data.symbol}
                    symbol={meta.data.symbol}
                    amount={t("value", {
                      value: liquidityOut,
                      type: "token",
                      numberSuffix: ` ${meta.data.symbol}`,
                    })}
                  />
                )}
              </STradingPairContainer>
            </div>
            <Spacer size={17} />
            <div sx={{ flex: "row", justify: "space-between" }}>
              <Text color="basic400">
                {t("liquidity.remove.modal.tokenFee.label")}
              </Text>
              <Text color="white">
                {t("value.percentage", { value: position.withdrawFee })}
              </Text>
            </div>
          </>
        }
        footer={
          <>
            <Spacer size={20} />
            <Button
              fullWidth
              variant="primary"
              disabled={removeSharesValue.isZero()}
            >
              {t("liquidity.stablepool.remove.confirm")}
            </Button>
          </>
        }
      />
    </form>
  )
}
