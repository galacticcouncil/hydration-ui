import BN from "bignumber.js"
import { Button, ButtonTransparent } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { FormValues } from "utils/helpers"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import { useStablepoolShares } from "./AddStablepoolLiquidity.utils"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { required, maxBalance } from "utils/validators"
import { ISubmittableResult } from "@polkadot/types/types"
import { TAsset, useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { CurrencyReserves } from "sections/pools/stablepool/components/CurrencyReserves"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  AAVE_EXTRA_GAS,
  BN_100,
  BN_MILL,
  GDOT_ERC20_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  STABLEPOOL_TOKEN_DECIMALS,
} from "utils/constants"
import { useEstimatedFees } from "api/transaction"
import { createToastMessages } from "state/toasts"
import {
  getAddToOmnipoolFee,
  useAddToOmnipoolZod,
} from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { scale, scaleHuman } from "utils/balance"
import { Alert } from "components/Alert/Alert"
import { useEffect, useState } from "react"
import { Separator } from "components/Separator/Separator"
import { useAccountBalances } from "api/deposits"
import { JoinFarmsSection } from "sections/pools/modals/AddLiquidity/components/JoinFarmsSection/JoinFarmsSection"
import { usePoolData } from "sections/pools/pool/Pool"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { useAssetsPrice } from "state/displayPrice"
import { useBestTradeSell } from "api/trade"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useSpotPrice } from "api/spotPrice"
import { useStableswapPool } from "api/stableswap"
import { REVERSE_A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useLiquidityLimit } from "state/liquidityLimit"
import { AddOmnipoolLiquiditySummary } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { useHealthFactorChange, useMaxWithdrawAmount } from "api/borrow"
import { ProtocolAction } from "@aave/contract-helpers"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { Switch } from "components/Switch/Switch"

type Props = {
  asset: TAsset
  onSuccess: (result: ISubmittableResult, shares: string) => void
  onClose: () => void
  onAssetOpen: () => void
  onSubmitted: (shares?: string) => void
  isStablepoolOnly: boolean
  isJoinFarms: boolean
  setIsJoinFarms: (value: boolean) => void
  initialAmount?: string
  setLiquidityLimit: () => void
}

const createFormSchema = (balance: string, decimals: number) =>
  z.object({
    value: required.pipe(maxBalance(balance, decimals)),
  })

export const AddStablepoolLiquidity = ({
  asset,
  onSuccess,
  onAssetOpen,
  onSubmitted,
  onClose,
  isStablepoolOnly,
  isJoinFarms,
  setIsJoinFarms,
  initialAmount,
  setLiquidityLimit,
}: Props) => {
  const { api, sdk } = useRpcProvider()
  const { createTransaction } = useStore()
  const { addLiquidityLimit } = useLiquidityLimit()
  const [splitRemove, setSplitRemove] = useState(true)

  const { account } = useAccount()

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const { data: accountBalances } = useAccountBalances()
  const { reserves, farms, isGDOT, poolId, isGETH, id, symbol } = usePoolData()
    .pool as TStablepool

  const { t } = useTranslation()

  const walletBalance = accountBalances?.accountAssetsMap.get(asset.id)?.balance
    ?.transferable

  const omnipoolZod = useAddToOmnipoolZod(id, farms, true)

  const estimationTxs = [
    api.tx.stableswap.addLiquidity(poolId, [
      { assetId: asset.id, amount: "1" },
    ]),
    ...(!isStablepoolOnly ? getAddToOmnipoolFee(api, isJoinFarms, farms) : []),
  ]

  const isGETHSelected = isGETH && asset.id === GETH_ERC20_ASSET_ID
  const isSwap = isGDOT || (isGETH && !isGETHSelected)

  const estimatedFees = useEstimatedFees(estimationTxs)
  const maxBalanceToWithdraw = useMaxWithdrawAmount(asset.id)

  const balance = walletBalance ?? "0"
  const balanceMax = isGETHSelected
    ? BN.min(
        BN(maxBalanceToWithdraw).shiftedBy(asset.decimals),
        balance,
      ).toString()
    : estimatedFees.accountCurrencyId === asset.id
      ? BN(balance)
          .minus(estimatedFees.accountCurrencyFee)
          .minus(asset.existentialDeposit)
          .toString()
      : balance

  const stablepoolZod = createFormSchema(balanceMax, asset?.decimals)

  const resolver = isStablepoolOnly
    ? stablepoolZod
    : omnipoolZod
      ? omnipoolZod.merge(stablepoolZod)
      : undefined

  const form = useForm<{ value: string; amount: string }>({
    mode: "onChange",
    defaultValues: { value: initialAmount },
    resolver: resolver ? zodResolver(resolver) : undefined,
  })
  const { formState } = form
  const { getAssetPrice } = useAssetsPrice([asset.id])

  const shares = form.watch("amount")
  const value = form.watch("value")

  const [debouncedValue] = useDebouncedValue(value, 300)

  const { getSwapTx } = useBestTradeSell(
    isSwap ? asset.id : "",
    isGDOT ? GDOT_ERC20_ASSET_ID : isGETH && !!resolver ? id : "",
    debouncedValue ?? "0",
    isGETH
      ? (minAmount) => {
          form.setValue(
            "amount",
            scaleHuman(minAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
            { shouldValidate: true, shouldTouch: true },
          )
        }
      : undefined,
  )

  const { getShares, totalShares } = useStablepoolShares({
    poolId,
    asset,
    reserves,
    isGETHSelected,
  })

  const hfChange = useHealthFactorChange({
    assetId: asset.id,
    amount: debouncedValue,
    action: ProtocolAction.withdraw,
  })

  const handleShares = (value: string) => {
    const shares = getShares(value)

    if (shares) {
      form.setValue("amount", shares, {
        shouldValidate: true,
      })
    }
  }

  const onSubmit = async () => {
    if (asset.decimals == null) {
      throw new Error("Missing asset meta")
    }

    const values = form.getValues()

    const shiftedShares = scale(
      values.amount,
      STABLEPOOL_TOKEN_DECIMALS,
    ).toString()

    const limitShares = BN(shiftedShares)
      .times(BN_100.minus(addLiquidityLimit).div(BN_100))
      .toFixed(0)

    const secondStepperLabel = t(
      `liquidity.add.modal.geth.stepper.second${isJoinFarms ? ".joinFarms" : ""}`,
    )

    const addToOmnipoolToasts = createToastMessages(
      `liquidity.add.modal.${isJoinFarms ? "andJoinFarms." : ""}toast`,
      {
        t,
        tOptions: {
          value: BN(values.amount),
          symbol,
          where: "Omnipool",
        },
        components: ["span", "span.highlight"],
      },
    )

    if (isGETHSelected) {
      const secondTx = api.tx.dispatcher.dispatchWithExtraGas(
        isJoinFarms
          ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
              farms.map<[string, string]>((farm) => [
                farm.globalFarmId,
                farm.yieldFarmId,
              ]),
              id,
              scale(values.value, STABLEPOOL_TOKEN_DECIMALS).toString(),
              limitShares,
            )
          : api.tx.omnipool.addLiquidityWithLimit(
              id,
              shiftedShares,
              limitShares,
            ),
        AAVE_EXTRA_GAS,
      )

      createTransaction(
        {
          tx: secondTx,
          title: secondStepperLabel,
        },
        {
          onSuccess: (result) => onSuccess(result, shiftedShares),
          onSubmitted: () => {
            onSubmitted(shiftedShares)
            form.reset()
          },
          onError: () => onClose(),
          onClose,
          onBack: () => {},
          toast: addToOmnipoolToasts,
        },
      )

      return
    }

    const toast = createToastMessages("liquidity.add.modal.toast", {
      t,
      tOptions: {
        value: values.value,
        symbol: asset.symbol,
        where: "Stablepool",
      },
      components: ["span", "span.highlight"],
    })

    const tx = isStablepoolOnly
      ? api.tx.stableswap.addAssetsLiquidity(
          poolId,
          [
            {
              assetId: asset.id,
              amount: scale(values.value, asset.decimals).toString(),
            },
          ],
          limitShares,
        )
      : api.tx.omnipoolLiquidityMining.addLiquidityStableswapOmnipoolAndJoinFarms(
          poolId,
          [
            {
              assetId: asset.id,
              amount: scale(values.value, asset.decimals).toString(),
            },
          ],
          isJoinFarms
            ? farms.map<[string, string]>((farm) => [
                farm.globalFarmId,
                farm.yieldFarmId,
              ])
            : null,
        )

    const initialBalance =
      accountBalances?.accountAssetsMap.get(id)?.balance?.transferable ?? "0"

    const isTwoStepsTx = isGETH && !isStablepoolOnly

    const swapTx = await getSwapTx()

    await createTransaction(
      {
        tx: isSwap ? swapTx : tx,
        title: isGETH ? t("liquidity.add.modal.geth.stepper.first") : undefined,
      },
      {
        onSuccess: (result) => onSuccess(result, shiftedShares),
        onSubmitted: () => {
          if (!isTwoStepsTx) {
            onSubmitted(shares)
            form.reset()
          }
        },
        onError: () => onClose(),
        onClose,
        onBack: () => {},
        steps: isTwoStepsTx
          ? [
              {
                label: t("liquidity.add.modal.geth.stepper.first"),
                state: "active",
              },
              {
                label: secondStepperLabel,
                state: "todo",
              },
            ]
          : undefined,
        toast,
        disableAutoClose: isGETH,
      },
    )

    if (!isTwoStepsTx) return

    const balanceApi = (
      await sdk.client.balance.getBalance(account?.address ?? "", id)
    ).toString()

    const diffBalance = BN(balanceApi).minus(initialBalance).toString()

    const limitGETHShares = BN(diffBalance)
      .times(BN_100.minus(addLiquidityLimit).div(BN_100))
      .toFixed(0)

    const secondTx = api.tx.dispatcher.dispatchWithExtraGas(
      isJoinFarms
        ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
            farms.map<[string, string]>((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
            id,
            diffBalance,
            limitGETHShares,
          )
        : api.tx.omnipool.addLiquidityWithLimit(
            id,
            diffBalance,
            limitGETHShares,
          ),
      AAVE_EXTRA_GAS,
    )

    await createTransaction(
      {
        tx: secondTx,
        title: secondStepperLabel,
      },
      {
        onSuccess: (result) => onSuccess(result, shiftedShares),
        onSubmitted: () => {
          onSubmitted(shares)
          form.reset()
        },
        onError: () => onClose(),
        onClose,
        onBack: () => {},
        steps: [
          {
            label: t("liquidity.add.modal.geth.stepper.first"),
            state: "done",
          },
          {
            label: secondStepperLabel,
            state: "active",
          },
        ],
        toast: addToOmnipoolToasts,
      },
    )
  }

  const onInvalidSubmit = (errors: FieldErrors<FormValues<typeof form>>) => {
    if (
      !isJoinFarms &&
      (errors.amount as { farm?: { message: string } })?.farm
    ) {
      onSubmit()
    }
  }

  const customErrors = form.formState.errors.amount as unknown as
    | {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      }
    | undefined

  const isJoinFarmDisabled = !!customErrors?.farm
  const isSubmitDisabled =
    farms.length > 0 && isJoinFarms
      ? !!Object.keys(formState.errors).length
      : !!Object.keys(formState.errors.amount ?? {}).filter(
          (key) => key !== "farm",
        ).length

  const isHFDisabled = isGETH
    ? !!hfChange?.isHealthFactorBelowThreshold && !healthFactorRiskAccepted
    : false

  useEffect(() => {
    if (!farms.length || isStablepoolOnly) return
    if (isJoinFarmDisabled) {
      setIsJoinFarms(false)
    } else {
      setIsJoinFarms(true)
    }
  }, [farms.length, isJoinFarmDisabled, isStablepoolOnly, setIsJoinFarms])

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div sx={{ flex: "column" }}>
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mx: -24,
            mb: 16,
            px: 24,
            py: 8,
          }}
          css={{
            borderTop: "1px solid #1C2038",
            borderBottom: "1px solid #1C2038",
          }}
        >
          <Text fs={14} color="brightBlue300">
            {t("liquidity.add.modal.split")}
          </Text>
          <Switch
            value={splitRemove}
            onCheckedChange={setSplitRemove}
            label={t("yes")}
            name={t("liquidity.add.modal.split")}
          />
        </div>
        <Controller
          name="value"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onChange={(v) => {
                onChange(v)
                if (!isGETH || isGETHSelected) handleShares(v)
              }}
              balance={BN(balanceMax)}
              balanceMax={BN(balanceMax)}
              asset={asset.id}
              error={error?.message}
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <Spacer size={20} />

        <SummaryRow
          label={t("liquidity.add.modal.tradeLimit")}
          content={
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
          }
        />

        <Separator
          color="darkBlue401"
          sx={{
            my: 4,
            width: "auto",
          }}
        />

        <FeeRow poolId={poolId} />

        <Separator
          color="darkBlue401"
          sx={{
            my: 4,
            width: "auto",
          }}
        />
        {farms.length > 0 ? (
          <JoinFarmsSection
            farms={farms}
            isJoinFarms={isJoinFarms}
            setIsJoinFarms={setIsJoinFarms}
            error={customErrors?.farm?.message}
            isJoinFarmDisabled={isJoinFarmDisabled}
          />
        ) : null}
        <Spacer size={20} />
        <CurrencyReserves reserves={reserves} />
        <Spacer size={20} />
        <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
          {t("liquidity.add.modal.positionDetails")}
        </Text>
        {isGETHSelected ? (
          <AddOmnipoolLiquiditySummary
            asset={asset}
            sharesToGet={scale(shares, STABLEPOOL_TOKEN_DECIMALS).toString()}
            totalShares={totalShares ?? "0"}
          />
        ) : isGDOT || isGETH ? (
          <GigaDotSummary
            selectedAsset={asset}
            minAmountOut={shares}
            poolId={poolId}
          />
        ) : (
          <Summary
            rows={[
              {
                label: t("liquidity.add.modal.shareTokens"),
                content: t("value", {
                  value: shares,
                  type: "token",
                }),
              },
              {
                label: t("liquidity.remove.modal.price"),
                content: (
                  <Text fs={14} color="white" tAlign="right">
                    <Trans
                      t={t}
                      i18nKey="liquidity.add.modal.row.spotPrice"
                      tOptions={{
                        firstAmount: 1,
                        firstCurrency: asset.symbol,
                      }}
                    >
                      <DisplayValue value={BN(getAssetPrice(asset.id).price)} />
                    </Trans>
                  </Text>
                ),
              },
            ]}
          />
        )}

        {hfChange && (
          <>
            <SummaryRow
              label={t("healthFactor")}
              content={
                <HealthFactorChange
                  healthFactor={hfChange.currentHealthFactor}
                  futureHealthFactor={hfChange.futureHealthFactor}
                />
              }
            />
            <HealthFactorRiskWarning
              accepted={healthFactorRiskAccepted}
              onAcceptedChange={setHealthFactorRiskAccepted}
              isBelowThreshold={hfChange.isHealthFactorBelowThreshold}
              sx={{ mb: 16 }}
            />
          </>
        )}

        {customErrors?.cap ? (
          <Alert variant="warning" css={{ marginBottom: 8 }}>
            {customErrors.cap.message}
          </Alert>
        ) : null}
        {customErrors?.circuitBreaker ? (
          <Alert variant="warning" css={{ marginBottom: 8 }}>
            {customErrors.circuitBreaker.message}
          </Alert>
        ) : null}

        <Spacer size={20} />
        <PoolAddLiquidityInformationCard />
        <Spacer size={20} />
      </div>
      <Separator
        color="darkBlue401"
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          mb: 20,
          width: "auto",
        }}
      />
      <Button variant="primary" disabled={isSubmitDisabled || isHFDisabled}>
        {isJoinFarms
          ? t("liquidity.add.modal.button.joinFarms")
          : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}

const FeeRow = ({ poolId }: { poolId: string }) => {
  const { t } = useTranslation()
  const { data } = useStableswapPool(poolId)

  return (
    <SummaryRow
      label={t("liquidity.add.modal.tradeFee")}
      content={t("value.percentage", {
        value: BN(data?.fee.toString() ?? 0)
          .div(BN_MILL)
          .multipliedBy(100),
      })}
      description={t("liquidity.add.modal.tradeFee.description")}
    />
  )
}

const GigaDotSummary = ({
  selectedAsset,
  minAmountOut,
  poolId,
}: {
  selectedAsset: TAsset
  minAmountOut: string
  poolId: string
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const aTokenId = REVERSE_A_TOKEN_UNDERLYING_ID_MAP[poolId]
  const meta = getAssetWithFallback(aTokenId)
  const { data } = useSpotPrice(aTokenId, selectedAsset.id)

  return (
    <Summary
      rows={[
        {
          label: t("liquidity.stablepool.add.minimalReceived"),
          content: t("value.tokenWithSymbol", {
            value: BN(minAmountOut),
            type: "token",
            symbol: meta.name,
          }),
        },
        {
          label: t("liquidity.remove.modal.price"),
          content: (
            <Text fs={14} color="white" tAlign="right">
              <Trans
                t={t}
                i18nKey="liquidity.add.modal.row.spotPrice"
                tOptions={{
                  firstAmount: 1,
                  firstCurrency: meta.symbol,
                }}
              >
                {t("value.tokenWithSymbol", {
                  value: data?.spotPrice.toString(),
                  symbol: selectedAsset.symbol,
                })}
              </Trans>
            </Text>
          ),
        },
      ]}
    />
  )
}
