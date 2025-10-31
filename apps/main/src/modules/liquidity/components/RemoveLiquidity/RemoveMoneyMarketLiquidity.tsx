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
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { spotPriceQuery } from "@/api/spotPrice"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
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

import { RecieveAssets } from "./RecieveAssets"
import { RemoveLiquidityProps } from "./RemoveLiquidity"
import { RemoveLiquiditySkeleton } from "./RemoveLiquiditySkeleton"
import { useRemoveMoneyMarketLiquidity } from "./RemoveMoneyMarketLiquidity.utils"
import { TRemoveStablepoolLiquidityFormValues } from "./RemoveStablepoolLiquidity.utils"

export const RemoveMoneyMarketLiquidity = (
  props: RemoveLiquidityProps & { erc20Id: string; stableswapId: string },
) => {
  const { data: stablepolData } = useStablepoolReserves(props.stableswapId)
  const initialReceiveAsset = stablepolData?.reserves[0]?.meta
  const { isBalanceLoading } = useAccountBalances()

  if (!stablepolData || !initialReceiveAsset || isBalanceLoading)
    return <RemoveLiquiditySkeleton />

  return (
    <RemoveMoneyMarketLiquidityForm
      {...props}
      initialReceiveAsset={initialReceiveAsset}
      pool={stablepolData}
    />
  )
}

export const RemoveMoneyMarketLiquidityForm = (
  props: RemoveLiquidityProps & {
    erc20Id: string
    stableswapId: string
    initialReceiveAsset: TAssetData
    pool: TStablepoolDetails
  },
) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    form,
    reserves,
    balance,
    receiveAssetsProportionally,
    meta,
    minimumTradeAmountShifted,
    mutation,
    healthFactor,
  } = useRemoveMoneyMarketLiquidity({ ...props, ...props.pool })
  const { closable, onBack } = props

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
        title={t("removeLiquidity")}
        closable={closable}
        onBack={onBack}
      />
      <ModalBody>
        <Flex
          direction="column"
          gap={getTokenPx("containers.paddings.tertiary")}
          asChild
        >
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <AssetSelectFormField<TRemoveStablepoolLiquidityFormValues>
              assetFieldName="asset"
              amountFieldName="amount"
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
                label={t("common:minimumReceive")}
                assetFieldName="receiveAsset"
                amountFieldName="receiveAmount"
                maxBalance={balance}
                assets={reserves.map((reserves) => reserves.meta)}
                ignoreBalance
                disabledInput
                sx={{ p: 0 }}
              />
            ) : (
              <Flex
                direction="column"
                gap={getTokenPx("containers.paddings.quint")}
              >
                <RecieveAssets assets={receiveAssetsProportionally ?? []} />
              </Flex>
            )}

            <ModalContentDivider />

            {split ? (
              <div>
                <TradeLimitRow type={TradeLimitType.Liquidity} />
                <ModalContentDivider />
                <SummaryRow
                  label={t("common:healthFactor")}
                  content={
                    healthFactor ? (
                      <HealthFactorChange
                        healthFactor={healthFactor.current}
                        futureHealthFactor={healthFactor.future}
                      />
                    ) : null
                  }
                />
              </div>
            ) : (
              <TradeSummary
                receiveAsset={receiveAsset}
                minimunReceive={minimumTradeAmountShifted}
                erc20={meta}
                healthFactor={healthFactor}
              />
            )}

            <ModalContentDivider />

            <Button type="submit" size="large" width="100%" disabled={!isValid}>
              {t("removeLiquidity")}
            </Button>
          </form>
        </Flex>
      </ModalBody>
    </FormProvider>
  )
}

const TradeSummary = ({
  receiveAsset,
  minimunReceive,
  erc20,
  healthFactor,
}: {
  receiveAsset: TSelectedAsset
  minimunReceive: string
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
            label: t("minimumReceive"),
            content: t("currency", {
              value: minimunReceive,
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
          {
            label: t("healthFactor"),
            content: healthFactor ? (
              <HealthFactorChange
                healthFactor={healthFactor.current}
                futureHealthFactor={healthFactor.future}
              />
            ) : null,
          },
        ]}
      />
    </div>
  )
}
