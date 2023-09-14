import { default as BigNumber } from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { getFloatingPointAmount, normalizeBigNumber } from "utils/balance"
import {
  BN_100,
  SLIPPAGE_LIMIT,
  STABLEPOOL_TOKEN_DECIMALS,
} from "utils/constants"
import { theme } from "theme"
import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { u32 } from "@polkadot/types-codec"
import { useAssetMeta } from "api/assetMeta"
import { useStablepoolLiquidityOut } from "./RemoveLiquidity.utils"
import { RemoveLiquidityReward } from "sections/pools/modals/RemoveLiquidity/components/RemoveLiquidityReward"
import { STradingPairContainer } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity.styled"
import { RemoveLiquidityInput } from "sections/pools/modals/RemoveLiquidity/components/RemoveLiquidityInput"

type RemoveLiquidityProps = {
  assetId?: string
  onClose: () => void
  position: {
    reserves: { asset_id: number; amount: string }[]
    poolId: u32
    amount: BigNumber
    fee: BigNumber
  }
  onSuccess: () => void
  onAssetOpen: () => void
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

  const liquidityOut = useStablepoolLiquidityOut({
    shares: removeSharesValue,
    reserves: position.reserves,
    poolId: position.poolId,
    asset: meta.data,
    fee: position.fee,
  })

  const fee = position.fee.times(liquidityOut)

  const feeDisplay = useMemo(
    () => position.fee.times(BN_100).toString(),
    [position.fee],
  )

  const slippage = SLIPPAGE_LIMIT.times(liquidityOut).div(100)
  const minAmountOut = normalizeBigNumber(liquidityOut)
    .minus(fee)
    .minus(slippage)

  const handleSubmit = async () => {
    await createTransaction(
      {
        tx: api.tx.stableswap.removeLiquidityOneAsset(
          position.poolId,
          assetId,
          removeSharesValue.dp(0).toString(),
          minAmountOut.dp(0).toString(),
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
              i18nKey="liquidity.stablepool.remove.onLoading"
              tOptions={{
                out: liquidityOut,
                amount: removeSharesValue,
                fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                symbol: meta?.data?.symbol,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.stablepool.remove.onSuccess"
              tOptions={{
                out: liquidityOut,
                amount: removeSharesValue,
                fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                symbol: meta?.data?.symbol,
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
                    balance={t("value.token", {
                      value: getFloatingPointAmount(
                        position.amount,
                        STABLEPOOL_TOKEN_DECIMALS,
                      ),
                    })}
                  />
                )}
              />

              <STradingPairContainer>
                <Text color="brightBlue300">
                  {t("liquidity.remove.modal.receive")}
                </Text>
                {meta.data && (
                  <RemoveLiquidityReward
                    id={meta.data.id}
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
                {t("value.percentage", { value: feeDisplay })}
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
