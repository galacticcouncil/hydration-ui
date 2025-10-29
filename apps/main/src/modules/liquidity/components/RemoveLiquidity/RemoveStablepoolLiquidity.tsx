import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  SummaryRow,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { LiquidityTradeLimitRow } from "@/modules/liquidity/components/LiquidityTradeLimitRow/LiquidityTradeLimitRow"
import { RecieveAssets } from "@/modules/liquidity/components/RemoveLiquidity/RecieveAssets"
import { RemoveLiquiditySkeleton } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquiditySkeleton"
import {
  TStablepoolDetails,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { useAccountBalances } from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"

import { RemoveLiquidityProps } from "./RemoveLiquidity"
import {
  TRemoveStablepoolLiquidityFormValues,
  useStablepoolRemoveLiquidity,
} from "./RemoveStablepoolLiquidity.utils"

export const RemoveStablepoolLiquidity = (props: RemoveLiquidityProps) => {
  const { data: stablepolData } = useStablepoolReserves(
    props.stableswapId ?? props.poolId,
  )
  const { isBalanceLoading } = useAccountBalances()

  const initialReceiveAsset = stablepolData?.reserves[0]?.meta

  if (!stablepolData || isBalanceLoading || !initialReceiveAsset)
    return <RemoveLiquiditySkeleton />

  return (
    <RemoveStablepoolLiquidityJSX
      pool={stablepolData}
      initialReceiveAsset={initialReceiveAsset}
      {...props}
    />
  )
}

const RemoveStablepoolLiquidityJSX = ({
  pool,
  onBack,
  closable,
  initialReceiveAsset,
}: RemoveLiquidityProps & {
  pool: TStablepoolDetails
  initialReceiveAsset: TAssetData
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { pool: poolData, reserves } = pool

  const { form, balance, receiveAssets, fee, removeAmountShifted, onSubmit } =
    useStablepoolRemoveLiquidity({
      ...pool,
      initialReceiveAsset,
    })

  const editable = false

  const {
    formState: { isValid },
    handleSubmit,
    watch,
  } = form

  const [asset, split] = watch(["asset", "split"])

  const { isValid: isValidPrice, price } = useAssetPrice(
    fee ? poolData.id.toString() : undefined,
  )

  const feeDisplay =
    fee && isValidPrice
      ? Big(removeAmountShifted).times(fee).div(100).times(price).toString()
      : undefined

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
            {editable ? (
              <Flex
                align="center"
                gap={getTokenPx("containers.paddings.quart")}
              >
                <AssetLogo id={asset.iconId ?? asset.id} size="large" />
                <Text
                  fs="h5"
                  fw={500}
                  color={getToken("text.high")}
                  font="primary"
                >
                  {t("common:currency", {
                    value: balance,
                    symbol: asset.symbol,
                  })}
                </Text>
              </Flex>
            ) : (
              <AssetSelectFormField<TRemoveStablepoolLiquidityFormValues>
                assetFieldName="asset"
                amountFieldName="amount"
                maxBalance={balance}
                assets={[]}
                sx={{ py: 0 }}
                disabledAssetSelector
              />
            )}

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

            <div>
              <LiquidityTradeLimitRow />

              {!split && (
                <>
                  <ModalContentDivider />
                  <SummaryRow
                    label={t("liquidity.remove.modal.withdrawalFees")}
                    content={`${t("common:currency", { value: feeDisplay })} (${t("common:percent", { value: fee })})`}
                  />
                </>
              )}
            </div>

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
