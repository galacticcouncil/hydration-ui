import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { ModalHorizontalSeparator } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { FC, useMemo, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { useRemoveDepositForm } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { RemoveDepositSummary } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositSummary"
import { RemoveDepositAmount } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAmount"
import { RemoveDepositAsset } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAsset"
import { useHealthFactorChange, useUserBorrowSummary } from "api/borrow"
import { useAssets } from "providers/assets"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useBestTradeSell } from "api/trade"
import { useStore } from "state/store"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { createToastMessages } from "state/toasts"
import { ProtocolAction } from "@aave/contract-helpers"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { Text } from "components/Typography/Text/Text"
import { useStablepoolLiquidityOut } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidity.utils"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import { LiquidityLimitField } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { useLiquidityLimit } from "state/liquidityLimit"
import { STradingPairContainer } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity.styled"
import { RemoveLiquidityReward } from "sections/pools/modals/RemoveLiquidity/components/RemoveLiquidityReward"
import { scale, scaleHuman } from "utils/balance"
import {
  AAVE_EXTRA_GAS,
  BN_0,
  HOLLAR_ID,
  STABLEPOOL_TOKEN_DECIMALS,
} from "utils/constants"
import { SummaryRow } from "components/Summary/SummaryRow"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { useRpcProvider } from "providers/rpcProvider"
import { SplitSwitcher } from "sections/pools/stablepool/components/SplitSwitcher"
import { TradeAlert } from "sections/pools/stablepool/components/TradeAlert"
import { getAddressFromAssetId } from "utils/evm"
import BN from "bignumber.js"
import { useWithdrawAndSellAll } from "sections/lending/components/transactions/Withdraw/utils"

const MAX_WITHDRAW_TX_ENABLED = false

type Props = {
  readonly assetId: string
  readonly maxBalance: string
  readonly removeAssets?: string[]
  readonly onClose: () => void
  readonly setRemoveAsset?: (id: string) => void
  readonly description?: string
}

enum PAGES {
  FORM,
  GET_ASSET,
  TRADE_LIMIT,
  REMOVE_ASSET,
}

export const RemoveDepositModal: FC<Props> = ({
  assetId,
  maxBalance,
  removeAssets,
  description,
  onClose,
  setRemoveAsset,
}) => {
  const { createTransaction } = useStore()
  const [splitRemove, setSplitRemove] = useState(true)
  const { addLiquidityLimit } = useLiquidityLimit()
  const { getErc20, getAsset, getAssetWithFallback, hub } = useAssets()
  const { data: user } = useUserBorrowSummary()
  const { t } = useTranslation()
  const { api } = useRpcProvider()

  const asset = getAssetWithFallback(assetId)

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const underlyingAssetId = getErc20(assetId)?.underlyingAssetId ?? ""

  const { data: pool } = useStableSwapReserves(underlyingAssetId)

  const uderlyingAsset = getAsset(underlyingAssetId)
  const firstAssetIdInPool = uderlyingAsset?.isStableSwap
    ? Object.keys(uderlyingAsset?.meta ?? {})[0]
    : ""

  const defaultAssetReceivedId =
    pool?.biggestPercentage?.assetId || // prioritize asset with biggest percentage in pool
    getErc20(firstAssetIdInPool)?.underlyingAssetId || // if first asset is aToken, fallback to its underlying asset
    firstAssetIdInPool // fallback to first asset in pool

  const form = useRemoveDepositForm({
    maxBalance,
    assetReceiveId: defaultAssetReceivedId,
  })

  const selectableAssets = useNewDepositAssets(underlyingAssetId, {
    blacklist: [assetId, hub.id],
    firstAssetId: defaultAssetReceivedId,
    lowPriorityAssetIds: [underlyingAssetId],
    underlyingAssetsFirst: true,
  })

  const [assetReceived, assetAmount] = form.watch(["assetReceived", "amount"])

  const [debouncedAmount] = useDebouncedValue(assetAmount, 300)

  const underlyingUserReserve = user?.userReservesData.find(
    ({ underlyingAsset }) =>
      underlyingAsset === getAddressFromAssetId(underlyingAssetId),
  )

  const balance = underlyingUserReserve
    ? BN(underlyingUserReserve.scaledATokenBalance).shiftedBy(
        -underlyingUserReserve.reserve.decimals,
      )
    : BN_0

  const isWithdrawingMax = BN(assetAmount ?? "0").gte(balance)

  const {
    isLoading: isLoadingWithdrawAndSellAll,
    mutateAsync: getWithdrawAndSellAllTx,
  } = useWithdrawAndSellAll(
    underlyingUserReserve?.underlyingAsset ?? "",
    underlyingUserReserve?.reserve?.aTokenAddress ?? "",
    assetReceived?.id ?? "",
    debouncedAmount,
  )

  const {
    minAmountOut,
    getSwapTx,
    amountOut,
    isLoading: isLoadingSell,
  } = useBestTradeSell(
    assetId,
    splitRemove ? underlyingAssetId : assetReceived?.id ?? "",
    debouncedAmount,
  )

  const { getAssetOutProportionally } = useStablepoolLiquidityOut({
    reserves: pool.reserves,
    poolId: underlyingAssetId,
  })

  const { page, direction, paginateTo } = useModalPagination()

  const minAssetsOut = useMemo(() => {
    if (!splitRemove) return []

    return pool.reserves.map((reserve) => {
      const meta = getAssetWithFallback(reserve.asset_id.toString())
      const assetOutValue = getAssetOutProportionally(
        reserve.amount,
        scale(debouncedAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
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
  }, [
    splitRemove,
    pool.reserves,
    getAssetWithFallback,
    getAssetOutProportionally,
    debouncedAmount,
    addLiquidityLimit,
  ])

  const amountOutFormatted = new BigNumber(amountOut)
    .shiftedBy(-(assetReceived?.decimals ?? 0))
    .toString()

  const minAmountOutFormatted = new BigNumber(minAmountOut)
    .shiftedBy(-(assetReceived?.decimals ?? 0))
    .toString()

  const onSubmit = async () => {
    const getTx = async () => {
      const swapTx = await getSwapTx()
      if (!swapTx) throw new Error("Missing swap tx")
      if (splitRemove) {
        return api.tx.dispatcher.dispatchWithExtraGas(
          api.tx.utility.batchAll([
            swapTx,
            api.tx.stableswap.removeLiquidity(
              underlyingAssetId,
              scale(debouncedAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
              minAssetsOut.map((minAssetOut) => ({
                assetId: minAssetOut.meta.id,
                amount: minAssetOut.minValue,
              })),
            ),
          ]),
          AAVE_EXTRA_GAS,
        )
      }

      if (MAX_WITHDRAW_TX_ENABLED && isWithdrawingMax) {
        return getWithdrawAndSellAllTx()
      }

      return swapTx
    }

    createTransaction(
      { tx: await getTx() },
      {
        toast: splitRemove
          ? createToastMessages("wallet.strategy.remove.proportionally.toast", {
              t,
              tOptions: {
                assets: minAssetsOut
                  .map((minAssetOut) => {
                    const value = scaleHuman(
                      minAssetOut.minValue,
                      minAssetOut.meta.decimals,
                    )
                    const symbol = minAssetOut.meta.symbol

                    return `${t("value.tokenWithSymbol", { value, symbol })}`
                  })
                  .join(", "),
                pool: asset.name,
              },
              components: ["span.highlight"],
            })
          : createToastMessages("wallet.strategy.remove.toast", {
              t,
              tOptions: {
                strategy: asset.name,
                amount: amountOutFormatted,
                symbol: assetReceived?.symbol,
              },
              components: ["span.highlight"],
            }),
      },
    )
  }

  const firstNonHollarSplitAsset = splitRemove
    ? minAssetsOut.find((minAssetOut) => minAssetOut.meta.id !== HOLLAR_ID)
    : null

  const hfChange = useHealthFactorChange({
    assetId,
    amount: assetAmount,
    action: ProtocolAction.withdraw,
    swapAsset: firstNonHollarSplitAsset
      ? {
          assetId: firstNonHollarSplitAsset.meta.id,
          amount: scaleHuman(
            firstNonHollarSplitAsset.assetOutValue,
            firstNonHollarSplitAsset.meta.decimals,
          ).toString(),
        }
      : assetReceived
        ? {
            assetId: assetReceived.id,
            amount: amountOutFormatted,
          }
        : undefined,
  })

  const displayTradeAlert = useMemo(
    () =>
      assetReceived?.isErc20 &&
      underlyingAssetId !== assetReceived.id &&
      !pool.balances.some(
        (reserve) =>
          reserve.id === assetReceived?.id ||
          getErc20(reserve.id)?.underlyingAssetId === asset.id,
      ),
    [asset.id, getErc20, underlyingAssetId, pool.balances, assetReceived],
  )

  const displayRiskCheckbox = !!hfChange?.isHealthFactorBelowThreshold

  const isLoading = isWithdrawingMax
    ? isLoadingWithdrawAndSellAll
    : isLoadingSell

  const isSubmitDisabled = displayRiskCheckbox
    ? !healthFactorRiskAccepted
    : false

  return (
    <ModalContents
      page={page}
      direction={direction}
      onClose={onClose}
      onBack={() => paginateTo(PAGES.FORM)}
      contents={[
        {
          title: t("lending.withdraw.modal.title", {
            symbol: asset.symbol,
          }),
          description,
          content: (
            <FormProvider {...form}>
              <form
                sx={{ display: "grid" }}
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div sx={{ flex: "column", gap: 8 }}>
                  <RemoveDepositAmount
                    assetId={assetId}
                    maxBalance={maxBalance}
                    onSelectorOpen={
                      removeAssets
                        ? () => paginateTo(PAGES.REMOVE_ASSET)
                        : undefined
                    }
                  />

                  <SplitSwitcher
                    value={splitRemove}
                    title={t("liquidity.remove.modal.split")}
                    onChange={setSplitRemove}
                    css={{ border: "none", marginBottom: 0 }}
                  />

                  {splitRemove ? (
                    <>
                      <STradingPairContainer>
                        <Text color="brightBlue300">
                          {t("liquidity.remove.modal.receive")}
                        </Text>
                        {minAssetsOut.map(({ assetOutValue, meta }) => (
                          <RemoveLiquidityReward
                            key={meta.id}
                            meta={meta}
                            amount={assetOutValue}
                            withDollarPrice
                          />
                        ))}
                      </STradingPairContainer>
                      <LiquidityLimitField
                        setLiquidityLimit={() => paginateTo(PAGES.TRADE_LIMIT)}
                        withSeparator
                        type="liquidity"
                      />
                    </>
                  ) : (
                    <>
                      <RemoveDepositAsset
                        assetId={assetReceived?.id ?? ""}
                        amountOut={amountOutFormatted}
                        onSelectorOpen={() => paginateTo(PAGES.GET_ASSET)}
                      />
                      <RemoveDepositSummary
                        assetId={assetId}
                        hfChange={hfChange}
                        minReceived={minAmountOutFormatted}
                        assetReceived={assetReceived}
                        setLiquidityLimit={() => paginateTo(PAGES.TRADE_LIMIT)}
                      />
                      {displayTradeAlert && <TradeAlert />}
                    </>
                  )}
                </div>

                {hfChange && (
                  <SummaryRow
                    label={t("healthFactor")}
                    content={
                      <HealthFactorChange
                        healthFactor={hfChange.currentHealthFactor}
                        futureHealthFactor={hfChange.futureHealthFactor}
                      />
                    }
                  />
                )}
                {hfChange?.isHealthFactorSignificantChange && (
                  <HealthFactorRiskWarning
                    accepted={healthFactorRiskAccepted}
                    onAcceptedChange={setHealthFactorRiskAccepted}
                    isBelowThreshold={hfChange.isHealthFactorBelowThreshold}
                    sx={{ mb: 16 }}
                  />
                )}
                <ModalHorizontalSeparator mb={16} />
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isSubmitDisabled || isLoading}
                >
                  {t("wallet.strategy.remove.confirm")}
                </Button>
              </form>
            </FormProvider>
          ),
        },
        {
          title: t("selectAsset.title"),
          noPadding: true,
          content: (
            <AssetsModalContent
              hideInactiveAssets
              naturallySorted
              displayZeroBalance
              allowedAssets={selectableAssets}
              onSelect={(asset) => {
                form.setValue("assetReceived", asset, { shouldValidate: true })
                paginateTo(PAGES.FORM)
              }}
            />
          ),
        },
        {
          title: t("liquidity.add.modal.limit.title"),
          noPadding: true,
          headerVariant: "GeistMono",
          content: (
            <LimitModal
              onConfirm={() => paginateTo(PAGES.FORM)}
              type={splitRemove ? "liquidity" : "swap"}
            />
          ),
        },
        {
          title: t("selectAsset.title"),
          noPadding: true,
          content: (
            <AssetsModalContent
              hideInactiveAssets
              displayZeroBalance
              allowedAssets={removeAssets}
              onSelect={(asset) => {
                setRemoveAsset?.(asset.id)
                paginateTo(PAGES.FORM)
              }}
            />
          ),
        },
      ]}
    />
  )
}
