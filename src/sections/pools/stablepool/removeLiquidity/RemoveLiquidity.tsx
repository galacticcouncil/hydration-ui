import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
  calculate_lrna_spot_price,
  calculate_withdrawal_fee,
} from "@galacticcouncil/math-omnipool"
import { useAssetMetaList } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { useApiIds, useMinWithdrawalFee } from "api/consts"
import { useOraclePrice } from "api/farms"
import { useOmnipoolAssets } from "api/omnipool"
import { useSpotPrice } from "api/spotPrice"
import { ReactComponent as IconWarning } from "assets/icons/WarningIcon.svg"
import { default as BN, default as BigNumber } from "bignumber.js"
import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Input } from "components/Input/Input"
import { Modal, ModalScrollableContent } from "components/Modal/Modal"
import { Slider } from "components/Slider/Slider"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS, useApiPromise } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_10, BN_100, BN_QUINTILL } from "utils/constants"
import { FormValues } from "utils/helpers"
import { HydraPositionsTableData } from "../../../wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { SSlippage, STradingPairContainer } from "./RemoveLiquidity.styled"
import { FeeRange } from "./components/FeeRange/FeeRange"
import { RemoveLiquidityReward } from "./components/RemoveLiquidityReward"
import { WalletTransferAssetSelect } from "../../../wallet/transfer/WalletTransferAssetSelect"
import { SSelectAssetButton } from "../../../../components/AssetSelect/AssetSelect.styled"
import { theme } from "../../../../theme"
import { getAssetName } from "../../../../components/AssetIcon/AssetIcon"
import { AssetSelectButton } from "../../../../components/AssetSelect/AssetSelectButton"

type RemoveLiquidityProps = {
  assetId?: string
  onClose: () => void
  position: HydraPositionsTableData
  onSuccess: () => void
  onAssetOpen: () => void
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
          label={t("custom")}
          placeholder={t("custom")}
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
  assetId,
  onClose,
  onSuccess,
  position,
  onAssetOpen,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({ defaultValues: { value: 25 } })

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const apiIds = useApiIds()
  const metas = useAssetMetaList([apiIds.data?.hubId, position.assetId])

  const spotPrice = useSpotPrice(apiIds.data?.hubId, position.assetId)
  const oracle = useOraclePrice(position.assetId, apiIds.data?.hubId)
  // TODO: remove, related to omnipool
  const minWithdrawalFee = useMinWithdrawalFee()
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
    if (
      omnipoolBalance.data &&
      omnipoolAsset?.data &&
      spotPrice.data &&
      oracle.data &&
      minWithdrawalFee.data &&
      apiIds.data
    ) {
      const oraclePrice = oracle.data.oraclePrice

      const spotPrice = calculate_lrna_spot_price(
        omnipoolBalance?.data?.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
      )

      const withdrawalFee = calculate_withdrawal_fee(
        spotPrice,
        oraclePrice.toString(),
        minWithdrawalFee.data.toString(),
      )

      if (removeSharesValue.isZero()) {
        return {
          tokensToGet: "0",
          lrnaToGet: "0",
          lrnaPayWith: "0",
          tokensPayWith: "0",
          withdrawalFee: BN(withdrawalFee).div(BN_QUINTILL).multipliedBy(100),
        }
      }

      const paramsWithFee: Parameters<typeof calculate_liquidity_out> = [
        omnipoolBalance.data.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.providedAmount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        removeSharesValue.toFixed(0),
        withdrawalFee,
      ]

      const paramsWithoutFee: Parameters<typeof calculate_liquidity_out> = [
        omnipoolBalance.data.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.providedAmount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        removeSharesValue.toFixed(0),
        "0",
      ]

      const tokensToGet = calculate_liquidity_out.apply(this, paramsWithFee)
      const tokensPayWith = BN(
        calculate_liquidity_out.apply(this, paramsWithoutFee),
      ).minus(tokensToGet)
      const lrnaToGet = calculate_liquidity_lrna_out.apply(this, paramsWithFee)
      const lrnaPayWith = BN(
        calculate_liquidity_lrna_out.apply(this, paramsWithoutFee),
      ).minus(lrnaToGet)

      return {
        tokensToGet,
        lrnaToGet,
        lrnaPayWith,
        tokensPayWith,
        withdrawalFee: BN(withdrawalFee).div(BN_QUINTILL).multipliedBy(100),
      }
    }
  }, [
    apiIds.data,
    minWithdrawalFee.data,
    omnipoolAsset?.data,
    omnipoolBalance.data,
    oracle.data,
    position.price,
    position.providedAmount,
    position.shares,
    removeSharesValue,
    spotPrice.data,
  ])

  const handleSubmit = async (values: FormValues<typeof form>) => {
    const value = position.shares.div(100).times(values.value)

    if (!(removeLiquidityValues && lrnaMeta && meta)) return

    const lrnaAsBigNumber = new BigNumber(removeLiquidityValues.lrnaToGet)

    await createTransaction(
      {
        tx: api.tx.omnipool.removeLiquidity(position.id, value.toFixed(0)),
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
                amount: removeLiquidityValues.tokensToGet,
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
                amount: removeLiquidityValues.tokensToGet,
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

  const isFeeExceeded = removeLiquidityValues?.withdrawalFee.gt(0.99)

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
                        meta?.decimals.toNumber() ?? 12,
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
                    value: BN_100,
                    type: "token",
                    numberSuffix: ` ${position.symbol}`,
                  })}
                />
              </STradingPairContainer>
            </div>
            <Spacer size={6} />
            <FeeRange
              minFee={minWithdrawalFee.data?.multipliedBy(100)}
              currentFee={removeLiquidityValues?.withdrawalFee}
              lrnaFeeValue={
                !BN(removeLiquidityValues?.lrnaPayWith ?? 0).isZero()
                  ? t("value.token", {
                      value: removeLiquidityValues?.lrnaPayWith,
                      fixedPointScale: lrnaMeta?.decimals.toString() ?? 12,
                    })
                  : undefined
              }
              assetFeeValue={t("value.token", {
                value: removeLiquidityValues?.tokensPayWith,
                fixedPointScale: meta?.decimals.toString() ?? 12,
              })}
              assetSymbol={meta?.symbol}
            />
          </>
        }
        footer={
          <>
            <Spacer size={20} />
            <Button
              fullWidth
              variant="primary"
              disabled={removeSharesValue.isZero() || isFeeExceeded}
            >
              {t("liquidity.stablepool.remove.confirm")}
            </Button>
          </>
        }
      />
    </form>
  )
}
