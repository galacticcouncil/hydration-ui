import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Summary,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { RecieveAssets } from "@/modules/liquidity/components/RemoveLiquidity/RecieveAssets"
import { RemoveLiquiditySkeleton } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquiditySkeleton"
import {
  TStablepoolDetails,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { useAccountBalances } from "@/states/account"

import {
  LIQUIDITY_LIMIT,
  TRemoveStablepoolLiquidityFormValues,
  useStablepoolRemoveLiquidity,
} from "./RemoveStablepoolLiquidity.utils"

export const RemoveStablepoolLiquidity = ({ poolId }: { poolId: string }) => {
  const { data: stablepolData } = useStablepoolReserves(poolId)
  const { isBalanceLoading } = useAccountBalances()

  const initialReceiveAsset = stablepolData?.reserves[0]?.meta

  if (!stablepolData || isBalanceLoading || !initialReceiveAsset)
    return <RemoveLiquiditySkeleton />

  return (
    <RemoveStablepoolLiquidityJSX
      pool={stablepolData}
      initialReceiveAsset={initialReceiveAsset}
    />
  )
}

const RemoveStablepoolLiquidityJSX = ({
  pool,
  initialReceiveAsset,
}: {
  pool: TStablepoolDetails
  initialReceiveAsset: TAssetData
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { pool: poolData, reserves } = pool
  const { form, balance, receiveAssets, fee, split, onSubmit } =
    useStablepoolRemoveLiquidity({
      pool: poolData,
      reserves,
      initialReceiveAsset,
    })

  const {
    formState: { isValid },
    handleSubmit,
  } = form

  return (
    <FormProvider {...form}>
      <ModalHeader title={t("removeLiquidity")} closable={false} />
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
                <RecieveAssets assets={receiveAssets ?? []} />
              </Flex>
            )}

            <ModalContentDivider />

            <Summary
              separator={<ModalContentDivider />}
              rows={[
                {
                  label: t("liquidity.add.modal.tradeLimit"),
                  content: t("common:percent", { value: LIQUIDITY_LIMIT }),
                },
                {
                  label: t("liquidity.remove.modal.withdrawalFees"),
                  content: t("common:percent", { value: fee }),
                },
              ]}
            />

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
