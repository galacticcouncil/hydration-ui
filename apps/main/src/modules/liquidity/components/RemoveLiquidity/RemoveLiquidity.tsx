import {
  Button,
  Flex,
  ModalBody,
  ModalContainer,
  ModalContentDivider,
  ModalHeader,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { isSS58Address } from "@galacticcouncil/utils"
import { UseMutationResult } from "@tanstack/react-query"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { DynamicFee } from "@/components/DynamicFee"
import { XYKPoolMeta } from "@/providers/assetsProvider"
import { RemoveLiquidityType } from "@/routes/liquidity/$id.remove"

import { RecieveAssets, TReceiveAsset } from "./RecieveAssets"
import {
  TRemoveLiquidityFormValues,
  useRemoveIsolatedLiquidity,
  useRemoveLiquidity,
} from "./RemoveLiquidity.utils"
import { RemoveLiquiditySkeleton } from "./RemoveLiquiditySkeleton"

type RemoveLiquidityProps = RemoveLiquidityType & { poolId: string }

export const RemoveLiquidity = (props: RemoveLiquidityProps) => {
  const isIsolatedPool = isSS58Address(props.poolId)

  if (isIsolatedPool) {
    return <RemoveIsolatedLiquidity {...props} />
  }

  return <RemoveOmnipoolLiquidity {...props} />
}

export const RemoveIsolatedLiquidity = ({
  positionId,
  poolId,
  shareTokenId,
  all,
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
      <RemoveLiquidityJSX isIsolatedPool isRemoveAll={isRemoveAll} {...props} />
    </FormProvider>
  )
}

export const RemoveOmnipoolLiquidity = ({
  positionId,
  poolId,
  all,
}: RemoveLiquidityProps) => {
  const isRemoveAll = !!all
  const removeLiquidity = useRemoveLiquidity({
    poolId,
    positionId,
    isRemoveAll,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton />
  console.log("removeLiquidity", removeLiquidity)
  const { form, ...props } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityJSX isRemoveAll={isRemoveAll} {...props} />
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
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useFormContext<TRemoveLiquidityFormValues>()

  const onSubmit = () => {
    mutation.mutate()
  }

  return (
    <Flex justify="center" mt={getTokenPx("containers.paddings.primary")}>
      <ModalContainer open>
        <ModalHeader title={t("removeLiquidity")} closable={false} />
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
                <Flex direction="column" gap={12}>
                  <Controller
                    name="amount"
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <AssetSelect
                        assets={[]}
                        selectedAsset={meta}
                        maxBalance={balance}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        ignoreDollarValue={isIsolatedPool}
                        sx={{ pt: 0 }}
                      />
                    )}
                  />
                </Flex>
              )}

              <ModalContentDivider />

              <Text
                color={getToken("text.tint.secondary")}
                font="primary"
                fw={700}
              >
                {t("liquidity.remove.modal.receive")}
              </Text>

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

              <Button
                type="submit"
                size="large"
                width="100%"
                disabled={!isValid}
              >
                {t("removeLiquidity")}
              </Button>
            </form>
          </Flex>
        </ModalBody>
      </ModalContainer>
    </Flex>
  )
}
