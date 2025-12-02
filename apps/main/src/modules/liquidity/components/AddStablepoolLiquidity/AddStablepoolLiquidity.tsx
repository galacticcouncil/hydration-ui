import { HealthFactorChange } from "@galacticcouncil/money-market/components/primitives"
import {
  Alert,
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  SliderTabs,
  Summary,
  Text,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { spotPriceQuery } from "@/api/spotPrice"
import { useStableswap, useStableSwapTradability } from "@/api/stableswap"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { getCustomErrors } from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import { AddLiquiditySummary } from "@/modules/liquidity/components/AddLiquidity/AddLiquidity"
import { RewardsAPR } from "@/modules/liquidity/components/AddLiquidity/RewardsAPR"
import {
  TAddMoneyMarketLiquidityWrapperReturn,
  useAddMoneyMarketLiquidity,
  useAddMoneyMarketLiquidityWrapper,
} from "@/modules/liquidity/components/AddMoneyMarketLiquidity/AddMoneyMarketLiquidity.utils"
import {
  AddGETHToOmnipool,
  AddMoneyMarketLiquidity,
} from "@/modules/liquidity/components/AddMoneyMarketLiquidity/AddMoneyMarketLiquidityWrapper"
import { StablepoolReserves } from "@/modules/liquidity/components/StablepoolReserves/StablepoolReserves"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import {
  TStablepoolDetails,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { AddLiquidityProps } from "@/routes/liquidity/$id.add"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

import {
  addStablepoolOptions,
  TAddStablepoolLiquidityFormValues,
  TAddStablepoolLiquidityOption,
  useStablepoolAddLiquidity,
} from "./AddStablepoolLiquidity.utils"
import { AddStablepoolLiquiditySkeleton } from "./AddStablepoolLiquiditySkeleton"

export type AddStablepoolLiquidityProps = AddLiquidityProps & {
  stableswapId: string
  initialOption?: TAddStablepoolLiquidityOption
}

export type AddMoneyMarketLiquidityWrapperProps =
  AddStablepoolLiquidityProps & {
    erc20Id: string
    stablepoolDetails: TStablepoolDetails
  }

type AddStablepoolLiquidityFormProps = AddStablepoolLiquidityProps &
  Omit<
    | ReturnType<typeof useStablepoolAddLiquidity>
    | (ReturnType<typeof useAddMoneyMarketLiquidity> &
        TAddMoneyMarketLiquidityWrapperReturn),
    "form"
  >

export const AddStablepoolLiquidityWrapper = (
  props: AddStablepoolLiquidityProps,
) => {
  const { stableswapId } = props
  const { data: stablepoolDetails } = useStablepoolReserves(stableswapId)
  const { isBalanceLoading } = useAccountBalances()
  const { isSuccess } = useStableSwapTradability()

  if (isBalanceLoading || !stablepoolDetails || !isSuccess)
    return <AddStablepoolLiquiditySkeleton {...props} />

  if (props.erc20Id) {
    return (
      <AddMoneyMarketLiquidityWrapper
        {...props}
        erc20Id={props.erc20Id}
        stablepoolDetails={stablepoolDetails}
      />
    )
  }

  return (
    <AddStablepoolLiquidity {...props} stablepoolDetails={stablepoolDetails} />
  )
}

const AddMoneyMarketLiquidityWrapper = (
  props: AddMoneyMarketLiquidityWrapperProps,
) => {
  const { erc20Id, stablepoolDetails, stableswapId, initialOption } = props
  const { form, ...formData } = useAddMoneyMarketLiquidityWrapper({
    stablepoolDetails,
    erc20Id,
    stableswapId,
    initialOption,
  })

  return (
    <FormProvider {...form}>
      {formData.defaultOption === "omnipool" ? (
        <AddGETHToOmnipool formData={formData} props={props} />
      ) : (
        <AddMoneyMarketLiquidity formData={formData} props={props} />
      )}
    </FormProvider>
  )
}

const AddStablepoolLiquidity = (
  props: AddStablepoolLiquidityProps & {
    stablepoolDetails: TStablepoolDetails
  },
) => {
  const { stablepoolDetails, stableswapId } = props
  const { form, ...addLiquidityData } = useStablepoolAddLiquidity({
    stablepoolDetails,
    stableswapId,
  })

  return (
    <FormProvider {...form}>
      <AddStablepoolLiquidityForm {...props} {...addLiquidityData} />
    </FormProvider>
  )
}

export const AddStablepoolLiquidityForm = ({
  erc20Id,
  stableswapId,
  closable,
  onBack,
  accountBalances,
  assetsToSelect,
  minReceiveAmount,
  meta,
  activeFarms,
  mutation,
  joinFarmErrorMessage,
  isJoinFarms,
  healthFactor,
  reserveIds,
  ...props
}: AddStablepoolLiquidityFormProps) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation(["liquidity", "common"])
  const form = useFormContext<TAddStablepoolLiquidityFormValues>()

  const { control, watch, formState, setValue } = form
  const [split, selectedAssetId, option] = watch([
    "split",
    "selectedAssetId",
    "option",
  ])

  const { fields: activeFields } = useFieldArray({
    control,
    name: "activeFields",
  })

  const onSubmit = () => mutation.mutate()

  const customErrors = getCustomErrors(formState.errors.sharesAmount)

  const isSubmitDisabled = !formState.isValid

  useEffect(() => {
    setValue("sharesAmount", minReceiveAmount, {
      shouldValidate: true,
    })
  }, [setValue, minReceiveAmount])

  if (!split && !selectedAssetId)
    return (
      <AddStablepoolLiquiditySkeleton
        closable={closable}
        onBack={onBack}
        stableswapId={stableswapId}
        {...props}
      />
    )

  const onSelectAsset = (asset: TAssetData) => {
    const field = form
      .getValues("fields")
      .find((field) => field.assetId === asset.id)
    const newValue = field ?? { amount: "", assetId: asset.id }

    setValue("selectedAssetId", asset.id)
    setValue("activeFields", [newValue])

    form.trigger("activeFields")
  }

  const onToggleClick = (checked: boolean) => {
    const fields = form.getValues("fields")
    form.setValue("split", checked)

    if (checked) {
      form.setValue(
        "activeFields",
        reserveIds.map(
          (reserveId) =>
            fields.find((field) => field.assetId === reserveId) ?? {
              amount: "",
              assetId: reserveId,
            },
        ),
      )
    } else if (selectedAssetId) {
      const prevField = fields.find(
        (field) => field.assetId === selectedAssetId,
      )

      form.setValue("activeFields", [
        prevField ?? { amount: "", assetId: selectedAssetId },
      ])
    }

    form.trigger("activeFields")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
      <ModalHeader
        title={t("addLiquidity")}
        onBack={onBack}
        closable={closable}
        sx={{
          px: getTokenPx("containers.paddings.primary"),
          pt: getTokenPx("containers.paddings.primary"),
          pb: getTokenPx("scales.paddings.base"),
          borderBottom: "1px solid",
          borderColor: getToken("details.separators"),
        }}
        customHeader={
          !erc20Id && (
            <Flex
              align="center"
              mt={getTokenPx("containers.paddings.primary")}
              gap={getTokenPx("containers.paddings.tertiary")}
            >
              <Controller
                control={form.control}
                name="option"
                render={({ field: { value, onChange, disabled } }) => (
                  <SliderTabs
                    options={addStablepoolOptions}
                    selected={value}
                    onSelect={(option) => onChange(option.id)}
                    disabled={disabled}
                    sx={{ flex: 1 }}
                  />
                )}
              />
              <AddStablepoolLiquidityTooltip />
            </Flex>
          )
        }
      />

      <ModalBody sx={{ pt: 0 }}>
        <Controller
          control={form.control}
          name="split"
          render={({ field }) => (
            <Flex
              align="center"
              justify="space-between"
              my={getTokenPx("containers.paddings.tertiary")}
            >
              <Text>{t("liquidity.add.stablepool.modal.proportionally")}</Text>
              <Toggle
                size="large"
                checked={field.value}
                onCheckedChange={onToggleClick}
              />
            </Flex>
          )}
        />

        <ModalContentDivider />

        {activeFields.map((field, index) => {
          const balance = accountBalances.get(field.assetId)

          return (
            <Fragment key={field.id}>
              <Controller
                name={`activeFields.${index}`}
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <AssetSelect
                    label={t("liquidity.add.modal.selectAsset")}
                    assets={[]}
                    sortedAssets={assetsToSelect}
                    maxBalance={balance}
                    selectedAsset={getAssetWithFallback(value.assetId)}
                    error={error?.message}
                    value={value.amount}
                    onChange={(amount) => {
                      const updatedValue = { ...value, amount }
                      const allFields = form.getValues("fields")
                      const fieldIndex = allFields.findIndex(
                        (f) => f.assetId === field.assetId,
                      )

                      onChange(updatedValue)

                      const indexToUpdate =
                        fieldIndex === -1 ? allFields.length : fieldIndex

                      form.setValue(`fields.${indexToUpdate}`, updatedValue)
                    }}
                    setSelectedAsset={!split ? onSelectAsset : undefined}
                  />
                )}
              />
              <ModalContentDivider />
            </Fragment>
          )
        })}

        <StablepoolReserves
          poolId={stableswapId}
          separator={<ModalContentDivider />}
        />

        <ModalContentDivider />

        {option === "omnipool" && erc20Id ? (
          <AddLiquiditySummary
            meta={meta}
            minReceiveAmount={minReceiveAmount}
            farms={activeFarms}
            healthFactor={healthFactor}
          />
        ) : (
          <AddStablepoolLiquiditySummary
            farms={activeFarms}
            minReceiveAmount={minReceiveAmount}
            selectedAssetId={!split ? selectedAssetId : undefined}
            poolMeta={meta}
            limitType={
              erc20Id && !split
                ? TradeLimitType.Trade
                : TradeLimitType.Liquidity
            }
            healthFactor={healthFactor}
            erc20Id={erc20Id}
          />
        )}

        {customErrors?.cap ? (
          <Alert
            variant="warning"
            description={customErrors.cap.message}
            sx={{ my: getTokenPx("containers.paddings.primary") }}
          />
        ) : null}
        {customErrors?.circuitBreaker ? (
          <Alert
            variant="warning"
            description={customErrors.circuitBreaker.message}
            sx={{ my: getTokenPx("containers.paddings.primary") }}
          />
        ) : null}
        {joinFarmErrorMessage && (
          <Alert
            variant="warning"
            description={joinFarmErrorMessage}
            sx={{ my: getTokenPx("containers.paddings.primary") }}
          />
        )}

        <ModalContentDivider />

        <Button
          type="submit"
          size="large"
          width="100%"
          mt={getTokenPx("containers.paddings.primary")}
          disabled={isSubmitDisabled}
        >
          {isJoinFarms
            ? t("liquidity.add.modal.submitAndjoinFarms")
            : t("liquidity.add.modal.submit")}
        </Button>
      </ModalBody>
    </form>
  )
}

const AddStablepoolLiquiditySummary = ({
  farms,
  minReceiveAmount,
  selectedAssetId,
  poolMeta,
  limitType = TradeLimitType.Liquidity,
  healthFactor,
  erc20Id,
}: {
  farms: Farm[]
  minReceiveAmount: string
  selectedAssetId?: string
  poolMeta: TAssetData
  limitType?: TradeLimitType
  healthFactor?: HealthFactorResult
  erc20Id?: string
}) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation(["liquidity", "common"])
  const { data: stableswap } = useStableswap(poolMeta.id)
  const { data: spotPriceData, isLoading: isPriceLoading } = useQuery(
    spotPriceQuery(rpc, erc20Id ?? poolMeta.id, selectedAssetId ?? ""),
  )
  const erc20Meta = erc20Id ? getAssetWithFallback(erc20Id) : undefined

  //@TODO: probably accumulate omnipool and stabpool fees if omnipool is selected
  return (
    <Summary
      separator={<ModalContentDivider />}
      rows={[
        {
          label: t("common:minimumReceived"),
          content: t("common:number", {
            value: minReceiveAmount,
          }),
        },
        {
          label: t("common:tradeLimit"),
          content: <TradeLimit key={limitType} type={limitType} />,
        },
        ...(farms.length > 0
          ? [
              {
                label: t("liquidity.add.modal.rewardsAPR"),
                content: <RewardsAPR farms={farms} />,
              },
            ]
          : []),
        {
          label: t("common:apy"),
          content: (
            <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
              {t("common:percent", {
                value: scaleHuman(stableswap?.fee ?? 0, 4),
              })}
            </Text>
          ),
        },

        ...(selectedAssetId
          ? [
              {
                label: t("common:price"),
                content: isPriceLoading ? (
                  <Skeleton width={50} height="100%" />
                ) : (
                  t("liquidity.remove.stablepool.modal.price", {
                    poolSymbol: erc20Meta?.symbol ?? poolMeta.symbol,
                    value: spotPriceData?.spotPrice,
                    symbol: getAssetWithFallback(selectedAssetId).symbol,
                  })
                ),
              },
            ]
          : []),

        ...(erc20Id
          ? [
              {
                label: t("common:healthFactor"),
                content: healthFactor ? (
                  <HealthFactorChange
                    healthFactor={healthFactor.current}
                    futureHealthFactor={healthFactor.future}
                    fontSize="p5"
                  />
                ) : null,
              },
            ]
          : []),
      ]}
    />
  )
}

export const AddStablepoolLiquidityTooltip = () => {
  return <Tooltip text="TBD" />
}
