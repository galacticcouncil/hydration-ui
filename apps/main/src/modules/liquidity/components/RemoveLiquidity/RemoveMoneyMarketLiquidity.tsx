import { useAccountSummary } from "@galacticcouncil/money-market/react"
import {
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Skeleton,
  Summary,
  SummaryRow,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { spotPriceQuery } from "@/api/spotPrice"
import { Trade } from "@/api/trade"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { TradeFee } from "@/components/TradeFee/TradeFee"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TradeLimitRow,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import {
  TStablepoolDetails,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { HealthFactorRiskWarning } from "@/modules/money-market/HealthFactorRiskWarning"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useRpcProvider } from "@/providers/rpcProvider"

import { ReceiveAssets } from "./ReceiveAssets"
import { RemoveLiquidityProps } from "./RemoveLiquidity"
import { useAssetsToRemoveFromMoneyMarket } from "./RemoveLiquidity.utils"
import { RemoveLiquiditySkeleton } from "./RemoveLiquiditySkeleton"
import { useRemoveMoneyMarketLiquidity } from "./RemoveMoneyMarketLiquidity.utils"
import { TRemoveStablepoolLiquidityFormValues } from "./RemoveStablepoolLiquidity.utils"

export type TRemoveMoneyMarketLiquidityProps = RemoveLiquidityProps & {
  erc20Id: string
  stableswapId: string
  title?: string
}

export const RemoveMoneyMarketLiquidity = (
  props: TRemoveMoneyMarketLiquidityProps,
) => {
  const { data: stablepolData } = useStablepoolReserves(props.stableswapId)
  const { isBalanceLoading } = useAccountBalances()

  const receiveAssets = useAssetsToRemoveFromMoneyMarket({
    stableswapId: props.stableswapId,
    reserves: stablepolData?.reserves ?? [],
    options: { blacklist: [props.erc20Id, props.stableswapId] },
  })

  const initialReceiveAsset = receiveAssets[0]

  if (!stablepolData || !initialReceiveAsset || isBalanceLoading)
    return <RemoveLiquiditySkeleton />

  return (
    <RemoveMoneyMarketLiquidityForm
      {...props}
      initialReceiveAsset={initialReceiveAsset}
      receiveAssets={receiveAssets}
      pool={stablepolData}
    />
  )
}

const RemoveMoneyMarketLiquidityForm = (
  props: TRemoveMoneyMarketLiquidityProps & {
    initialReceiveAsset: TAssetWithBalance
    receiveAssets: TAssetWithBalance[]
    pool: TStablepoolDetails
  },
) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    form,
    maxBalanceWithFee,
    receiveAssetsProportionally,
    meta,
    tradeMinReceive,
    swap,
    isTradePending,
    mutation,
    healthFactor,
    intermediateHealthFactor,
    isLoadingMaxBalance,
  } = useRemoveMoneyMarketLiquidity({ ...props, ...props.pool })
  const { closable, onBack, receiveAssets, title } = props
  const accountSummary = useAccountSummary(useUserAddress())

  const {
    formState: { isValid },
    handleSubmit,
    watch,
  } = form

  const [receiveAsset, split, amount] = watch([
    "receiveAsset",
    "split",
    "amount",
  ])

  // Open once there is a quote to show; stay open while a new amount re-quotes.
  const isTradeOpen = !split && Number(amount) > 0 && (!!swap || isTradePending)

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  useEffect(() => {
    const subscription = watch((_, args) => {
      if (args.type !== "change") return

      setHealthFactorRiskAccepted(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch])

  const isHealthFactorCheckSatisfied =
    intermediateHealthFactor?.isUserConsentRequired
      ? healthFactorRiskAccepted
      : true

  const onSubmit = () => {
    mutation.mutate()
  }

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={title ?? t("removeLiquidity")}
        closable={closable}
        onBack={onBack}
      />
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <ModalBody sx={{ pb: 0 }}>
          <Flex direction="column" gap="m" pb="m">
            <AssetSelectFormField<TRemoveStablepoolLiquidityFormValues>
              assetFieldName="asset"
              amountFieldName="amount"
              label={t("common:amount")}
              balance={{
                value: maxBalanceWithFee,
                isLoading: isLoadingMaxBalance,
              }}
              assets={[]}
              disabledAssetSelector
            />

            <ModalContentDivider />

            <Controller
              control={form.control}
              name="split"
              render={({ field: { value, onChange } }) => (
                <Flex align="center" justify="space-between">
                  <Text fs="p4" fw={500}>
                    {t("liquidity.remove.stablepool.modal.proportionally")}
                  </Text>
                  <Toggle
                    size="large"
                    checked={value}
                    onCheckedChange={onChange}
                  />
                </Flex>
              )}
            />

            <ModalContentDivider />

            {!split ? (
              <AssetSelectFormField<TRemoveStablepoolLiquidityFormValues>
                label={t("common:get")}
                assetFieldName="receiveAsset"
                amountFieldName="receiveAmount"
                assets={[]}
                sortedAssets={receiveAssets}
                balance={false}
                isReadOnly
              />
            ) : (
              <Flex direction="column" gap="s">
                <ReceiveAssets assets={receiveAssetsProportionally ?? []} />
              </Flex>
            )}
          </Flex>
          <Summary separator={<ModalContentDivider />} withLeadingSeparator>
            {split && <TradeLimitRow type={TradeLimitType.Liquidity} />}
            <SummaryRow
              label={t("common:healthFactor")}
              content={
                <HealthFactorChange
                  current={
                    healthFactor?.current ??
                    accountSummary.data?.account.healthFactor
                  }
                  intermediate={intermediateHealthFactor?.future}
                  projected={healthFactor?.future}
                />
              }
            />
          </Summary>
          {!split && (
            <CollapsibleRoot open={isTradeOpen}>
              <CollapsibleContent>
                <TradeSummary
                  receiveAsset={receiveAsset}
                  minReceive={tradeMinReceive}
                  erc20={meta}
                  swap={swap}
                  isTradePending={isTradePending}
                />
              </CollapsibleContent>
            </CollapsibleRoot>
          )}
        </ModalBody>
        <Separator />
        <ModalFooter>
          <Flex direction="column" width="100%" gap="m">
            {intermediateHealthFactor?.isUserConsentRequired && (
              <HealthFactorRiskWarning
                message={t("common:healthFactor.warning")}
                accepted={healthFactorRiskAccepted}
                onAcceptedChange={setHealthFactorRiskAccepted}
                isUserConsentRequired={
                  intermediateHealthFactor.isUserConsentRequired
                }
              />
            )}
            <LoadingButton
              type="submit"
              size="large"
              width="100%"
              isLoading={mutation.isPending}
              disabled={
                !isValid ||
                !isHealthFactorCheckSatisfied ||
                isLoadingMaxBalance ||
                isTradePending ||
                mutation.isPending
              }
            >
              {title ?? t("removeLiquidity")}
            </LoadingButton>
          </Flex>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}

const TradeSummary = ({
  receiveAsset,
  minReceive,
  erc20,
  swap,
  isTradePending,
}: {
  receiveAsset: TSelectedAsset
  minReceive: string
  erc20: TAssetData
  swap?: Trade
  isTradePending: boolean
}) => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, receiveAsset.id, erc20.id),
  )

  return (
    <Summary separator={<ModalContentDivider />} withLeadingSeparator>
      <SummaryRow
        label={t("minimumReceived")}
        loading={isTradePending}
        content={t("currency", {
          value: minReceive,
          symbol: receiveAsset.symbol,
        })}
      />
      <SummaryRow
        label={t("price")}
        content={
          isSpotPricePending ? (
            <Skeleton width={100} sx={{ height: 18 }} />
          ) : (
            `${t("currency", { value: 1, symbol: receiveAsset.symbol })}≈${t("currency", { value: spotPriceData?.spotPrice, symbol: erc20.symbol })}`
          )
        }
      />
      <TradeLimitRow type={TradeLimitType.Trade} />
      <SummaryRow
        label={t("trade:market.summary.estTradeFees")}
        content={
          <TradeFee
            swap={swap}
            receiveAsset={receiveAsset}
            isLoading={isTradePending}
          />
        }
      />
    </Summary>
  )
}
