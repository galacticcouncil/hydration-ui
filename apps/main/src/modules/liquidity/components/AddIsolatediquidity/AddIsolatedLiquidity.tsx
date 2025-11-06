import { calculate_liquidity_in } from "@galacticcouncil/math-xyk"
import { Alert, Button, Summary, Text } from "@galacticcouncil/ui/components"
import {
  ModalBody,
  ModalContentDivider,
} from "@galacticcouncil/ui/components/Modal"
import { ModalHeader } from "@galacticcouncil/ui/components/Modal"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useRouter } from "@tanstack/react-router"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { PoolBase, useXykPools } from "@/api/pools"
import { TXYKConsts, useXYKConsts } from "@/api/xyk"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { RewardsAPR } from "@/modules/liquidity/components/AddLiquidity/RewardsAPR"
import { calculatePoolFee } from "@/modules/liquidity/Liquidity.utils"
import { XYKPoolMeta } from "@/providers/assetsProvider"
import { scale } from "@/utils/formatting"
import { scaleHuman } from "@/utils/formatting"

import {
  orders,
  TAddIsolatedLiquidityFormValues,
  useAddIsolatedLiquidity,
} from "./AddIsolatedLiquidity.utils"
import { AddIsolatedLiquiditySkeleton } from "./AddIsolatedLiquiditySkeleton"

export const AddIsolatedLiquidity = ({
  poolAddress,
  closable,
}: {
  poolAddress: string
  closable?: boolean
}) => {
  const { data: pools, isLoading } = useXykPools()
  const { data: consts } = useXYKConsts()

  const pool = pools?.find((pool) => pool.address === poolAddress)

  return isLoading || !pool || !consts ? (
    <AddIsolatedLiquiditySkeleton closable={closable} />
  ) : (
    <AddIsolatedLiquidityForm pool={pool} consts={consts} closable={closable} />
  )
}

export const AddIsolatedLiquidityForm = ({
  pool,
  consts,
  closable = false,
}: {
  pool: PoolBase
  consts: TXYKConsts
  closable?: boolean
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { history } = useRouter()

  const {
    form,
    reserveA,
    reserveB,
    ratio,
    meta,
    mutation,
    isLoading,
    assetABalance,
    assetBBalance,
    assetAMeta,
    assetBMeta,
    shares,
    getShares,
    price,
    isPriceLoading,
    activeFarms,
    joinFarmErrorMessage,
    isJoinFarms,
  } = useAddIsolatedLiquidity(pool, consts)

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
            <AssetSelectFormField<TAddIsolatedLiquidityFormValues>
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
                    scale(value, assetAMeta.decimals),
                  ),
                  assetBMeta.decimals,
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
              assetInId={assetAMeta.id}
              assetOutId={assetBMeta.id}
              fallbackPrice={price}
              isFallbackPriceLoading={isPriceLoading}
            />

            <AssetSelectFormField<TAddIsolatedLiquidityFormValues>
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
                    scale(value, assetBMeta.decimals),
                  ),
                  assetAMeta.decimals,
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

            <AddLiquiditySummary
              meta={meta}
              poolShare={ratio ?? "0"}
              sharesToGet={shares ?? "0"}
              farms={activeFarms}
              consts={consts}
              isLoading={isLoading}
            />

            {sharesError && (
              <Alert
                variant="error"
                description={sharesError.message}
                sx={{ mb: getTokenPx("containers.paddings.secondary") }}
              />
            )}

            {joinFarmErrorMessage ? (
              <Alert
                variant="warning"
                description={joinFarmErrorMessage}
                sx={{ my: getTokenPx("containers.paddings.primary") }}
              />
            ) : null}

            <ModalContentDivider />

            <Button
              type="submit"
              size="large"
              width="100%"
              mt={getTokenPx("containers.paddings.primary")}
              disabled={!form.formState.isValid}
            >
              {isJoinFarms
                ? t("liquidity.add.modal.submitAndjoinFarms")
                : t("liquidity.add.modal.submit")}
            </Button>
          </form>
        </FormProvider>
      </ModalBody>
    </>
  )
}

const AddLiquiditySummary = ({
  meta,
  poolShare,
  sharesToGet,
  farms,
  consts,
  isLoading,
}: {
  meta: XYKPoolMeta
  poolShare: string
  sharesToGet: string
  farms: Farm[]
  consts: TXYKConsts
  isLoading: boolean
}) => {
  const { t } = useTranslation(["liquidity", "common"])

  const tradeFee = calculatePoolFee(consts.fee)

  return (
    <Summary
      separator={<ModalContentDivider />}
      rows={[
        {
          label: t("common:minimalReceived"),
          content: t("liquidity.add.modal.sharesToGet", {
            value: scaleHuman(sharesToGet, meta.decimals),
            percentage: poolShare,
          }),
          loading: isLoading,
        },
        {
          label: t("liquidity.add.modal.rewardsAPR"),
          content: <RewardsAPR farms={farms} />,
          loading: isLoading,
        },
        {
          label: t("common:apy"),
          content: (
            <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
              {t("common:percent", {
                value: tradeFee,
              })}
            </Text>
          ),
          loading: isLoading,
        },
      ]}
    />
  )
}
