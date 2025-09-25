import {
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { isSS58Address } from "@galacticcouncil/utils"
import { UseMutationResult } from "@tanstack/react-query"
import { FormProvider, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetType, TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { DynamicFee } from "@/components/DynamicFee"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useAssets, XYKPoolMeta } from "@/providers/assetsProvider"
import { RemoveLiquidityType } from "@/routes/liquidity/$id.remove"

import { RecieveAssets, TReceiveAsset } from "./RecieveAssets"
import {
  TRemoveLiquidityFormValues,
  useRemoveIsolatedLiquidity,
  useRemoveLiquidity,
} from "./RemoveLiquidity.utils"
import { RemoveLiquiditySkeleton } from "./RemoveLiquiditySkeleton"
import { RemoveStablepoolLiquidity } from "./RemoveStablepoolLiquidity"

type RemoveLiquidityProps = RemoveLiquidityType & {
  poolId: string
  closable?: boolean
}

export const RemoveLiquidity = (props: RemoveLiquidityProps) => {
  const { getAssetWithFallback } = useAssets()
  const isIsolatedPool = isSS58Address(props.poolId)

  if (isIsolatedPool) {
    return <RemoveIsolatedLiquidity {...props} />
  } else if (getAssetWithFallback(props.poolId).type === AssetType.STABLESWAP) {
    return <RemoveStablepoolLiquidity {...props} />
  } else {
    return <RemoveOmnipoolLiquidity {...props} />
  }
}

export const RemoveIsolatedLiquidity = ({
  positionId,
  poolId,
  shareTokenId,
  all,
  closable,
}: RemoveLiquidityProps) => {
  const isRemoveAll = !!all
  const removeLiquidity = useRemoveIsolatedLiquidity({
    poolId,
    positionId,
    shareTokenId,
    isRemoveAll,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton />

  const { form, ...props } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityJSX
        isIsolatedPool
        isRemoveAll={isRemoveAll}
        closable={closable}
        {...props}
      />
    </FormProvider>
  )
}

export const RemoveOmnipoolLiquidity = ({
  positionId,
  poolId,
  all,
  closable,
}: RemoveLiquidityProps) => {
  const isRemoveAll = !!all
  const removeLiquidity = useRemoveLiquidity({
    poolId,
    positionId,
    isRemoveAll,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton />

  const { form, ...props } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityJSX
        isRemoveAll={isRemoveAll}
        closable={closable}
        {...props}
      />
    </FormProvider>
  )
}

const RemoveLiquidityJSX = ({
  fee,
  balance,
  receiveAssets,
  totalValue,
  isRemoveAll,
  mutation,
  logoId,
  isIsolatedPool,
  meta,
  closable,
}: {
  fee?: string
  totalValue: string
  balance: string
  receiveAssets: TReceiveAsset[]
  isRemoveAll: boolean
  mutation: UseMutationResult<void, Error, void>
  logoId: string | string[]
  isIsolatedPool?: boolean
  meta: TAssetData | XYKPoolMeta
  closable?: boolean
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    formState: { isValid },
    handleSubmit,
  } = useFormContext<TRemoveLiquidityFormValues>()

  const onSubmit = () => {
    mutation.mutate()
  }

  return (
    <>
      <ModalHeader title={t("removeLiquidity")} closable={closable} />
      <ModalBody>
        <Flex
          direction="column"
          gap={getTokenPx("containers.paddings.secondary")}
          asChild
        >
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            {isRemoveAll ? (
              <Flex
                align="center"
                gap={getTokenPx("containers.paddings.quart")}
              >
                <AssetLogo id={logoId} size="large" />
                <Text
                  fs="h5"
                  fw={500}
                  color={getToken("text.high")}
                  font="primary"
                >
                  {t("common:currency", {
                    value: totalValue,
                    symbol: meta.symbol,
                  })}
                </Text>
              </Flex>
            ) : (
              <AssetSelectFormField<TRemoveLiquidityFormValues>
                assetFieldName="asset"
                amountFieldName="amount"
                maxBalance={balance}
                ignoreDollarValue={isIsolatedPool}
                assets={[]}
                disabledAssetSelector
                sx={{ pt: 0 }}
              />
            )}

            <ModalContentDivider />

            <RecieveAssets assets={receiveAssets} />

            {fee && (
              <SummaryRow
                label={t("liquidity.remove.modal.withdrawalFees")}
                sx={{ m: 0 }}
                content={
                  <DynamicFee
                    rangeLow={0.34}
                    rangeHigh={0.66}
                    value={Number(fee)}
                    displayValue
                  />
                }
              />
            )}

            <ModalContentDivider />

            <Button type="submit" size="large" width="100%" disabled={!isValid}>
              {t("removeLiquidity")}
            </Button>
          </form>
        </Flex>
      </ModalBody>
    </>
  )
}
