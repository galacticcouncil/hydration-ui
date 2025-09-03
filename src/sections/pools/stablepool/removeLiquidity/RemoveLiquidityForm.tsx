import BigNumber from "bignumber.js"
import { Button, ButtonTransparent } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { BN_100, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { useStablepoolLiquidityOut } from "./RemoveLiquidity.utils"
import { RemoveLiquidityReward } from "sections/pools/modals/RemoveLiquidity/components/RemoveLiquidityReward"
import { STradingPairContainer } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useAssets } from "providers/assets"
import { createToastMessages } from "state/toasts"
import { scaleHuman } from "utils/balance"
import { useLiquidityLimit } from "state/liquidityLimit"
import { Summary } from "components/Summary/Summary"
import { SplitSwitcher } from "sections/pools/stablepool/components/SplitSwitcher"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { scale } from "utils/balance"
import { z } from "zod"
import { maxBalance, required } from "utils/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"

type RemoveLiquidityProps = {
  assetId: string
  onClose: () => void
  position: {
    reserves: { asset_id: number; amount: string }[]
    poolId: string
    amount: string
    fee: string
  }
  onSuccess: () => void
  onAssetOpen: () => void
  splitRemove: boolean
  setSplitRemove: (enabled: boolean) => void
  setLiquidityLimit: () => void
}

export const RemoveStablepoolLiquidityForm = ({
  assetId,
  onClose,
  onSuccess,
  position,
  onAssetOpen,
  splitRemove,
  setSplitRemove,
  setLiquidityLimit,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { addLiquidityLimit } = useLiquidityLimit()
  const { createTransaction } = useStore()
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(position.poolId)

  const form = useForm<{ amount: string }>({
    defaultValues: { amount: "" },
    mode: "onChange",
    resolver: zodResolver(
      z.object({
        amount: required.pipe(maxBalance(position.amount, meta.decimals)),
      }),
    ),
  })

  const value = form.watch("amount")
  const removeSharesValue = scale(value, meta.decimals).toString()

  const { getAssetOutValue, getAssetOutProportionally } =
    useStablepoolLiquidityOut({
      reserves: position.reserves,
      poolId: position.poolId,
    })

  const feeDisplay = useMemo(
    () => BigNumber(position.fee).times(BN_100).toString(),
    [position.fee],
  )

  const minAssetsOut = useMemo(() => {
    if (splitRemove) {
      return position.reserves.map((reserve) => {
        const meta = getAssetWithFallback(reserve.asset_id.toString())
        const assetOutValue = getAssetOutProportionally(
          reserve.amount,
          removeSharesValue,
        )

        const minValue = BigNumber(assetOutValue)
          .minus(BigNumber(addLiquidityLimit).times(assetOutValue).div(100))
          .dp(0)
          .toString()

        return {
          minValue,
          assetOutValue,
          meta,
        }
      })
    }

    const meta = getAssetWithFallback(assetId)
    const assetOutValue = getAssetOutValue(Number(assetId), removeSharesValue)
    const minValue = BigNumber(assetOutValue)
      .minus(
        BigNumber(addLiquidityLimit)
          .plus(feeDisplay)
          .times(assetOutValue)
          .div(100),
      )
      .dp(0)
      .toString()

    return [{ minValue, assetOutValue, meta }]
  }, [
    assetId,
    getAssetOutValue,
    getAssetWithFallback,
    position,
    removeSharesValue,
    feeDisplay,
    splitRemove,
    addLiquidityLimit,
    getAssetOutProportionally,
  ])

  const handleSubmit = async () => {
    await createTransaction(
      {
        tx: splitRemove
          ? api.tx.stableswap.removeLiquidity(
              position.poolId,
              removeSharesValue,
              minAssetsOut.map((minAssetOut) => ({
                assetId: minAssetOut.meta.id,
                amount: minAssetOut.minValue,
              })),
            )
          : api.tx.stableswap.removeLiquidityOneAsset(
              position.poolId,
              assetId,
              removeSharesValue,
              minAssetsOut[0].minValue,
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
        toast: createToastMessages("liquidity.stablepool.remove", {
          t,
          tOptions: {
            out: scaleHuman(removeSharesValue, STABLEPOOL_TOKEN_DECIMALS)
              .dp(4)
              .toString(),
            symbol: t("liquidity.stablepool.position.token"),
          },
          components: ["span", "span.highlight"],
        }),
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
      <div>
        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <AssetSelect
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              id={position.poolId}
              title={t("amount")}
              error={fieldState?.error?.message}
              balance={BigNumber(position.amount)}
              balanceMax={BigNumber(position.amount)}
              balanceLabel={t("lending.withdraw.balance")}
            />
          )}
        />

        <SplitSwitcher
          value={splitRemove}
          title={t("liquidity.remove.modal.split")}
          onChange={setSplitRemove}
          css={{ border: "none", margin: "16px 0", padding: 0 }}
        />

        <STradingPairContainer>
          <Text color="brightBlue300">
            {t("liquidity.remove.modal.receive")}
          </Text>
          {splitRemove ? (
            minAssetsOut.map(({ assetOutValue, meta }) => (
              <RemoveLiquidityReward
                key={meta.id}
                meta={meta}
                amount={assetOutValue}
                withDollarPrice
              />
            ))
          ) : (
            <div
              sx={{ flex: "row", justify: "space-between", align: "center" }}
            >
              <AssetSelectButton assetId={assetId} onClick={onAssetOpen} />

              {minAssetsOut.map(({ assetOutValue, meta }) => (
                <div sx={{ flex: "column", align: "flex-end" }}>
                  <Text fs={[16, 18]} fw={[500, 700]}>
                    {t("value.tokenWithSymbol", {
                      value: assetOutValue
                        ? scaleHuman(assetOutValue, meta.decimals)
                        : "-",
                      symbol: meta.symbol,
                    })}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </STradingPairContainer>
      </div>
      <Spacer size={17} />

      <Summary
        rows={[
          {
            label: t("liquidity.add.modal.tradeLimit"),
            content: (
              <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
                <Text fs={14} color="white" tAlign="right">
                  {t("value.percentage", { value: addLiquidityLimit })}
                </Text>
                <ButtonTransparent onClick={() => setLiquidityLimit()}>
                  <Text color="brightBlue200" fs={14}>
                    {t("edit")}
                  </Text>
                </ButtonTransparent>
              </div>
            ),
          },
          ...(splitRemove
            ? []
            : [
                {
                  label: t("liquidity.remove.modal.tokenFee.label"),
                  content: (
                    <Text color="white" fs={14}>
                      {t("value.percentage", { value: feeDisplay })}
                    </Text>
                  ),
                },
              ]),
        ]}
      />

      <Spacer size={20} />
      <Button fullWidth variant="primary" disabled={removeSharesValue === "0"}>
        {t("liquidity.stablepool.remove.confirm")}
      </Button>
    </form>
  )
}
