import { calculate_liquidity_in } from "@galacticcouncil/math-xyk"
import { Alert, Button, Summary } from "@galacticcouncil/ui/components"
import {
  ModalBody,
  ModalContentDivider,
} from "@galacticcouncil/ui/components/Modal"
import { ModalHeader } from "@galacticcouncil/ui/components/Modal"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { AddLiquidityAlert } from "@/modules/liquidity/components/AddLiquidity/AddLiquidityAlert"
import { PositionDetailsLabel } from "@/modules/liquidity/components/AddLiquidity/PositionDetailsLabel"
import { IsolatedPoolTable } from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useXYKPool } from "@/states/liquidity"
import { scale } from "@/utils/formatting"
import { scaleHuman } from "@/utils/formatting"

import {
  useAddIsolatedLiquidityData,
  useAddIsolatedLiquidityZod,
} from "./AddIsolatedLiquidity.utils"
import { AddIsolatedLiquiditySkeleton } from "./AddIsolatedLiquiditySkeleton"

const orders = ["assetA", "assetB"] as const
type Order = (typeof orders)[number]

type FormValues = {
  lastUpdated: Order
  shares: string
  amountA: string
  amountB: string
  assetA: TAssetData
  assetB: TAssetData
}

export const AddIsolatedLiquidity = ({
  poolAddress,
  closable,
}: {
  poolAddress: string
  closable?: boolean
}) => {
  const { data: pool, isLoading } = useXYKPool(poolAddress)

  return isLoading || !pool ? (
    <AddIsolatedLiquiditySkeleton closable={closable} />
  ) : (
    <AddIsolatedLiquidityForm pool={pool} closable={closable} />
  )
}

export const AddIsolatedLiquidityForm = ({
  pool,
  closable = false,
}: {
  pool: IsolatedPoolTable
  closable?: boolean
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const { history } = useRouter()
  const assetA = getAssetWithFallback(pool.tokens[0].id.toString())
  const assetB = getAssetWithFallback(pool.tokens[1].id.toString())
  const reserveA = pool.tokens[0].balance.toString()
  const reserveB = pool.tokens[1].balance.toString()

  const assetABalance = scaleHuman(
    getTransferableBalance(assetA.id),
    assetA.decimals,
  )
  const assetBBalance = scaleHuman(
    getTransferableBalance(assetB.id),
    assetB.decimals,
  )

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, assetA.id, assetB.id),
  )

  const zodSchema = useAddIsolatedLiquidityZod(
    assetABalance,
    assetBBalance,
    pool.minTradingLimit,
  )

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      lastUpdated: "assetA",
      shares: "0",
      amountA: "",
      amountB: "",
      assetA,
      assetB,
    },
    resolver: zodSchema ? standardSchemaResolver(zodSchema) : undefined,
  })
  const shares = form.watch("shares")

  const { getShares, ratio, fee, mutation, isLoading } =
    useAddIsolatedLiquidityData(pool, shares)

  const onSubmit = async () => {
    const values = form.getValues()
    const mainAsset = values.lastUpdated
    const secondaryAsset = orders.find((order) => order !== mainAsset)!

    const assetsMap = {
      assetA: {
        asset: values.assetA,
        amount: values.amountA,
      },
      assetB: {
        asset: values.assetB,
        amount: values.amountB,
      },
    }

    mutation.mutate({
      assetA: assetsMap[mainAsset].asset,
      assetB: assetsMap[secondaryAsset].asset,
      amountA: assetsMap[mainAsset].amount,
      amountB: assetsMap[secondaryAsset].amount,
    })
  }

  const sharesError = form.formState.errors.shares

  return (
    <>
      <ModalHeader
        title={t("addLiquidity")}
        closable={closable}
        onBack={!closable ? () => history.back() : undefined}
      />
      <ModalBody>
        <FormProvider {...form}>
          <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
            <AssetSelectFormField<FormValues>
              label={t("liquidity.createPool.modal.assetA")}
              assetFieldName="assetA"
              amountFieldName="amountA"
              assets={[]}
              maxBalance={assetABalance}
              disabledAssetSelector
              onAmountChange={(value) => {
                form.setValue("lastUpdated", "assetA")

                const amountB = scaleHuman(
                  calculate_liquidity_in(
                    reserveA,
                    reserveB,
                    scale(value, assetA.decimals),
                  ),
                  assetB.decimals,
                )

                form.setValue("amountB", amountB, {
                  shouldValidate: true,
                  shouldTouch: true,
                })

                form.setValue("shares", getShares(value), {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }}
            />

            <AssetSwitcher
              assetInId={assetA.id}
              assetOutId={assetB.id}
              priceIn=""
              priceOut=""
              fallbackPrice={spotPriceData?.spotPrice?.toString()}
              isFallbackPriceLoading={isSpotPricePending}
            />

            <AssetSelectFormField<FormValues>
              label={t("liquidity.createPool.modal.assetB")}
              assetFieldName="assetB"
              amountFieldName="amountB"
              assets={[]}
              maxBalance={assetBBalance}
              disabledAssetSelector
              onAmountChange={(value) => {
                form.setValue("lastUpdated", "assetB")

                const amountA = scaleHuman(
                  calculate_liquidity_in(
                    reserveB,
                    reserveA,
                    scale(value, assetB.decimals),
                  ),
                  assetA.decimals,
                )

                form.setValue("shares", getShares(amountA), {
                  shouldValidate: true,
                  shouldTouch: true,
                })

                form.setValue("amountA", amountA, {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }}
            />

            <ModalContentDivider />

            <PositionDetailsLabel />

            <Summary
              separator={<ModalContentDivider />}
              rows={[
                {
                  label: t("liquidity.add.modal.shareOfPool"),
                  content: t("common:percent", { value: ratio }),
                  loading: isLoading,
                },
                {
                  label: t("liquidity.add.modal.receivedAmountOfPoolShares"),
                  content: t("common:number", {
                    value: scaleHuman(shares ?? 0, pool.meta.decimals),
                  }),
                  loading: isLoading,
                },
                {
                  label: t("liquidity.add.modal.rewardsFromFees.label"),
                  content: t("common:percent", { value: fee }),
                  loading: isLoading,
                },
              ]}
            />

            <ModalContentDivider />

            <AddLiquidityAlert />

            {sharesError && (
              <Alert
                variant="error"
                description={sharesError.message}
                sx={{ mb: getTokenPx("containers.paddings.secondary") }}
              />
            )}

            <ModalContentDivider />

            <Button
              type="submit"
              size="large"
              width="100%"
              mt={getTokenPx("containers.paddings.primary")}
              disabled={!form.formState.isValid}
            >
              {t("liquidity.add.modal.submit")}
            </Button>
          </form>
        </FormProvider>
      </ModalBody>
    </>
  )
}
