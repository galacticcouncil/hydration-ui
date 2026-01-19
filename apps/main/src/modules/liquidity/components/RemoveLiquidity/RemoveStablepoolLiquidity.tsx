import {
  Box,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  SliderTabs,
  SummaryRow,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { OmnipoolDepositFull } from "@/api/account"
import { AssetLogo } from "@/components/AssetLogo"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { ExpandableDynamicFee, FeeBreakdown } from "@/components/DynamicFee"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { ReceiveAssets } from "@/modules/liquidity/components/RemoveLiquidity/ReceiveAssets"
import { RemoveLiquiditySkeleton } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquiditySkeleton"
import { RemoveOmnipoolResult } from "@/modules/liquidity/components/RemoveLiquidity/RemoveOmnipoolLiquidity.utils"
import {
  TradeLimitRow,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import {
  TStablepoolDetails,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import {
  AccountOmnipoolPosition,
  useAccountBalances,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"

import { RemoveLiquidityProps } from "./RemoveLiquidity"
import { useAssetsToRemoveFromStablepool } from "./RemoveLiquidity.utils"
import {
  TRemoveStablepoolLiquidityFormValues,
  TRemoveStablepoolLiquidityProps,
  useRemoveOmnipoolLiquidity,
  useRemoveStablepoolLiquidity,
  useRemoveStablepoolOmnipoolLiquidity,
  useRemoveStableswapSharesLiquidity,
} from "./RemoveStablepoolLiquidity.utils"

export const options = [
  {
    id: "stablepool",
    label: "Remove full",
    value: "stablepool",
  },
  {
    id: "omnipool",
    label: "Remove to shares",
    value: "omnipool",
  },
]

export const RemoveSelectableStablepoolPositions = (
  props: RemoveLiquidityProps & {
    positions: AccountOmnipoolPosition[]
    stableswapId: string
  },
) => {
  const { data: stablepoolData } = useStablepoolReserves(props.stableswapId)
  const { isBalanceLoading } = useAccountBalances()

  const reservesToRemove = useAssetsToRemoveFromStablepool({
    reserves: stablepoolData?.reserves ?? [],
  })
  const initialReceiveAsset = reservesToRemove[0]

  if (!stablepoolData || isBalanceLoading || !initialReceiveAsset)
    return <RemoveLiquiditySkeleton />

  return (
    <RemoveStablepoolPositionsWrapper
      {...props}
      initialReceiveAsset={initialReceiveAsset}
      stablepoolData={stablepoolData}
      reservesToRemove={reservesToRemove}
    />
  )
}

export const RemoveStablepoolLiquidity = (props: RemoveLiquidityProps) => {
  const poolId = props.stableswapId ?? props.poolId
  const { data: stablepoolData } = useStablepoolReserves(poolId)
  const { isBalanceLoading } = useAccountBalances()
  const { getAssetPositions } = useAccountOmnipoolPositionsData()

  const reservesToRemove = useAssetsToRemoveFromStablepool({
    reserves: stablepoolData?.reserves ?? [],
  })
  const initialReceiveAsset = reservesToRemove[0]
  const positionId = props.positionId

  if (!stablepoolData || isBalanceLoading || !initialReceiveAsset)
    return <RemoveLiquiditySkeleton />

  if (positionId) {
    const { all: omnipoolPositions } = getAssetPositions(poolId)

    const position = positionId
      ? omnipoolPositions.find((position) => position.positionId === positionId)
      : undefined

    if (!position) return null

    return (
      <RemoveStablepoolPositionsWrapper
        {...props}
        positions={[position]}
        initialReceiveAsset={initialReceiveAsset}
        stablepoolData={stablepoolData}
        reservesToRemove={reservesToRemove}
      />
    )
  }

  return (
    <RemoveStablepoolShares
      stablepoolData={stablepoolData}
      initialReceiveAsset={initialReceiveAsset}
      reservesToRemove={reservesToRemove}
      {...props}
    />
  )
}

type RemoveStablepoolPositionsWrapperProps = RemoveLiquidityProps & {
  positions: AccountOmnipoolPosition[]
  initialReceiveAsset: TAssetWithBalance
  stablepoolData: TStablepoolDetails
  reservesToRemove: TAssetWithBalance[]
}

export type RemoveStablepoolSharesProps = Omit<
  RemoveStablepoolPositionsWrapperProps,
  "positions"
>

export type RemoveStablepoolPositionsProps =
  RemoveStablepoolPositionsWrapperProps & {
    fee: string
    feesBreakdown: FeeBreakdown[]
    omnipoolPositionsOutTotal: RemoveOmnipoolResult
    balance: string
    omnipoolPositionsOutValues: {
      position: AccountOmnipoolPosition
      valuesOut: RemoveOmnipoolResult
    }[]
    deposits: OmnipoolDepositFull[]
  }

const RemoveStablepoolShares = (props: RemoveStablepoolSharesProps) => {
  const { form, ...removeLiquidityProps } =
    useRemoveStableswapSharesLiquidity(props)

  return (
    <FormProvider {...form}>
      <RemoveStablepoolLiquidityForm {...props} {...removeLiquidityProps} />
    </FormProvider>
  )
}

const RemoveStablepoolPositionsWrapper = (
  props: RemoveStablepoolPositionsWrapperProps,
) => {
  const { positions, initialReceiveAsset, stablepoolData } = props

  const { form, isFullRemove, ...removeLiquidityProps } =
    useRemoveStablepoolLiquidity({
      poolDetails: stablepoolData,
      initialReceiveAsset,
      positions,
    })

  return (
    <FormProvider {...form}>
      {isFullRemove ? (
        <RemoveOmnipoolStablepoolPositions
          {...props}
          {...removeLiquidityProps}
        />
      ) : (
        <RemoveOmnipoolPositions {...props} {...removeLiquidityProps} />
      )}
    </FormProvider>
  )
}

const RemoveOmnipoolStablepoolPositions = (
  props: RemoveStablepoolPositionsProps,
) => {
  const removeLiquidityProps = useRemoveStablepoolOmnipoolLiquidity(props)
  return <RemoveStablepoolLiquidityForm {...removeLiquidityProps} />
}

const RemoveOmnipoolPositions = (props: RemoveStablepoolPositionsProps) => {
  const removeLiquidityProps = useRemoveOmnipoolLiquidity(props)
  return <RemoveStablepoolLiquidityForm {...removeLiquidityProps} />
}

const RemoveStablepoolLiquidityForm = (
  props: RemoveLiquidityProps &
    Omit<TRemoveStablepoolLiquidityProps, "form" | "positions">,
) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    formState: { isValid },
    handleSubmit,
    watch,
    control,
  } = useFormContext<TRemoveStablepoolLiquidityFormValues>()

  const {
    receiveAssets,
    closable,
    onBack,
    fee,
    onSubmit,
    balance,
    editable,
    isFullRemove,
    feesBreakdown,
    reservesToRemove,
    isRemoveShares,
    deposits,
  } = props

  const [asset, split, amountToRemove] = watch(["asset", "split", "amount"])

  return (
    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader
        title={t("removeLiquidity")}
        closable={closable}
        onBack={onBack}
        sx={{
          px: getTokenPx("containers.paddings.primary"),
          pt: getTokenPx("containers.paddings.primary"),
          pb: getTokenPx("scales.paddings.base"),
          borderBottom: "1px solid",
          borderColor: getToken("details.separators"),
        }}
        customHeader={
          isRemoveShares ? null : (
            <Flex
              align="center"
              mt={getTokenPx("containers.paddings.primary")}
              gap={getTokenPx("containers.paddings.tertiary")}
            >
              <Controller
                control={control}
                name="option"
                render={({ field: { value, onChange, disabled } }) => (
                  <SliderTabs
                    options={options}
                    selected={value}
                    onSelect={(option) => onChange(option.id)}
                    disabled={disabled}
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </Flex>
          )
        }
      />
      <ModalBody>
        <Flex
          direction="column"
          gap={getTokenPx("containers.paddings.tertiary")}
        >
          {!editable ? (
            <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
              <AssetLogo id={asset.iconId ?? asset.id} size="large" />
              <Text
                fs="h5"
                fw={500}
                color={getToken("text.high")}
                font="primary"
              >
                {/*Probably display hhub token as well*/}
                {t("common:currency", {
                  value: amountToRemove,
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
            control={control}
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
                  disabled={!isFullRemove}
                />
              </Flex>
            )}
          />
          <ModalContentDivider />
          {!split && (
            <AssetSelectFormField<TRemoveStablepoolLiquidityFormValues>
              label={t("common:minimumReceive")}
              assetFieldName="receiveAsset"
              amountFieldName="receiveAmount"
              maxBalance={balance}
              assets={[]}
              sortedAssets={reservesToRemove}
              ignoreBalance
              disabledInput
              sx={{ p: 0 }}
            />
          )}

          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quint")}
          >
            <ReceiveAssets
              title={split ? undefined : ""}
              assets={receiveAssets}
              positions={deposits}
            />
          </Flex>

          <ModalContentDivider />
          <Box>
            <TradeLimitRow type={TradeLimitType.Liquidity} />

            {fee && (
              <>
                <ModalContentDivider />
                <FeeColumn fee={fee} feesBreakdown={feesBreakdown} />
              </>
            )}
          </Box>
          <ModalContentDivider />
        </Flex>
      </ModalBody>
      <ModalFooter sx={{ pt: 0 }}>
        <Button type="submit" size="large" width="100%" disabled={!isValid}>
          {t("removeLiquidity")}
        </Button>
      </ModalFooter>
    </form>
  )
}

const FeeColumn = ({
  fee,
  feesBreakdown,
}: {
  fee: string
  feesBreakdown?: FeeBreakdown[]
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { watch } = useFormContext<TRemoveStablepoolLiquidityFormValues>()

  const [amountToRemove, asset] = watch(["amount", "asset"])

  const { isValid: isValidPrice, price } = useAssetPrice(
    fee ? asset.id : undefined,
  )

  const feeDisplay =
    fee && isValidPrice
      ? Big(amountToRemove).times(fee).div(100).times(price).toString()
      : undefined

  return feesBreakdown ? (
    <ExpandableDynamicFee
      label={t("liquidity.remove.modal.withdrawalFees")}
      rangeLow={0.34}
      rangeHigh={0.66}
      value={Number(fee)}
      valueDisplay={feeDisplay}
      range={[0.01, 0.34, 0.66, 1]}
      feesBreakdown={feesBreakdown}
    />
  ) : (
    <SummaryRow
      label={t("liquidity.remove.modal.withdrawalFees")}
      content={`${t("common:currency", { value: feeDisplay })} (${t("common:percent", { value: fee })})`}
    />
  )
}
