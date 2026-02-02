import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Summary,
  SummaryRow,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { spotPriceQuery } from "@/api/spotPrice"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TradeLimitRow,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import {
  TStablepoolDetails,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"

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

export const RemoveMoneyMarketLiquidityForm = (
  props: TRemoveMoneyMarketLiquidityProps & {
    initialReceiveAsset: TAssetWithBalance
    receiveAssets: TAssetWithBalance[]
    pool: TStablepoolDetails
  },
) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    form,
    balance,
    receiveAssetsProportionally,
    meta,
    tradeMinReceive,
    mutation,
    healthFactor,
  } = useRemoveMoneyMarketLiquidity({ ...props, ...props.pool })
  const { closable, onBack, receiveAssets, title } = props

  const {
    formState: { isValid },
    handleSubmit,
    watch,
  } = form

  const [receiveAsset, split] = watch(["receiveAsset", "split"])

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
      <ModalBody>
        <Flex direction="column" gap="m" asChild>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <AssetSelectFormField<TRemoveStablepoolLiquidityFormValues>
              assetFieldName="asset"
              amountFieldName="amount"
              label={t("common:amount")}
              maxBalance={balance}
              assets={[]}
              sx={{ py: 0 }}
              disabledAssetSelector
            />

            <ModalContentDivider />

            <Controller
              control={form.control}
              name="split"
              render={({ field: { value, onChange } }) => (
                <Flex align="center" justify="space-between">
                  <Text>
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
                maxBalance={balance}
                assets={[]}
                sortedAssets={receiveAssets}
                ignoreBalance
                disabledInput
                sx={{ p: 0 }}
              />
            ) : (
              <Flex direction="column" gap="s">
                <ReceiveAssets assets={receiveAssetsProportionally ?? []} />
              </Flex>
            )}

            <ModalContentDivider />

            {split ? (
              <div>
                <TradeLimitRow type={TradeLimitType.Liquidity} />

                {healthFactor ? (
                  <>
                    <ModalContentDivider />
                    <SummaryRow
                      label={t("common:healthFactor")}
                      content={
                        <HealthFactorChange
                          healthFactor={healthFactor.current}
                          futureHealthFactor={healthFactor.future}
                        />
                      }
                    />
                  </>
                ) : null}
              </div>
            ) : (
              <TradeSummary
                receiveAsset={receiveAsset}
                minReceive={tradeMinReceive}
                erc20={meta}
                healthFactor={healthFactor}
              />
            )}

            <ModalContentDivider />

            <Button type="submit" size="large" width="100%" disabled={!isValid}>
              {title ?? t("removeLiquidity")}
            </Button>
          </form>
        </Flex>
      </ModalBody>
    </FormProvider>
  )
}

const TradeSummary = ({
  receiveAsset,
  minReceive,
  erc20,
  healthFactor,
}: {
  receiveAsset: TSelectedAsset
  minReceive: string
  erc20: TAssetData
  healthFactor: HealthFactorResult | undefined
}) => {
  const { t } = useTranslation("common")
  const rpc = useRpcProvider()

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, receiveAsset.id, erc20.id),
  )

  return (
    <div>
      <TradeLimitRow type={TradeLimitType.Trade} />
      <ModalContentDivider />
      <Summary
        separator={<ModalContentDivider />}
        rows={[
          {
            label: t("minimumReceived"),
            content: t("currency", {
              value: minReceive,
              symbol: receiveAsset.symbol,
            }),
          },
          {
            label: t("price"),
            content: isSpotPricePending ? (
              <Skeleton width={100} sx={{ height: 18 }} />
            ) : (
              `${t("currency", { value: 1, symbol: receiveAsset.symbol })}≈${t("currency", { value: spotPriceData?.spotPrice, symbol: erc20.symbol })}`
            ),
          },
          ...(healthFactor
            ? [
                {
                  label: t("healthFactor"),
                  content: (
                    <HealthFactorChange
                      healthFactor={healthFactor.current}
                      futureHealthFactor={healthFactor.future}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  )
}
