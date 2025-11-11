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
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { stablePools, StableSwapBase } from "@/api/pools"
import { spotPriceQuery } from "@/api/spotPrice"
import { useStableswap } from "@/api/stablewap"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { getCustomErrors } from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import { RewardsAPR } from "@/modules/liquidity/components/AddLiquidity/RewardsAPR"
import { useAddMoneyMarketLiquidity } from "@/modules/liquidity/components/AddMoneyMarketLiquidity/AddMoneyMarketLiquidity.utils"
import { StablepoolReserves } from "@/modules/liquidity/components/StablepoolReserves/StablepoolReserves"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { AddLiquidityProps } from "@/routes/liquidity/$id.add"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

import {
  addStablepoolOptions,
  TAddStablepoolLiquidityFormValues,
  useStablepoolAddLiquidity,
} from "./AddStablepoolLiquidity.utils"
import { AddStablepoolLiquiditySkeleton } from "./AddStablepoolLiquiditySkeleton"

export type AddStablepoolLiquidityProps = AddLiquidityProps & {
  stableswapId: string
}

export const AddStablepoolLiquidityWrapper = (
  props: AddStablepoolLiquidityProps,
) => {
  const { stableswapId } = props
  const { data: pools = [], isLoading: isPoolsLoading } = useQuery(stablePools)
  const { isBalanceLoading } = useAccountBalances()
  const pool = pools.find((pool) => pool.id === Number(stableswapId))

  if (isPoolsLoading || !pool || isBalanceLoading)
    return <AddStablepoolLiquiditySkeleton {...props} />

  if (props.erc20Id) {
    return (
      <AddMoneyMarketLiquidity {...props} erc20Id={props.erc20Id} pool={pool} />
    )
  }

  return <AddStablepoolLiquidity {...props} pool={pool} />
}

const AddMoneyMarketLiquidity = (
  props: AddStablepoolLiquidityProps & {
    erc20Id: string
    pool: StableSwapBase
  },
) => {
  const { erc20Id, pool } = props
  const { form, ...addLiquidityData } = useAddMoneyMarketLiquidity({
    pool,
    erc20Id,
    onSubmitted: () => props.onBack?.(),
  })

  return (
    <FormProvider {...form}>
      <AddStablepoolLiquidityForm {...props} {...addLiquidityData} />
    </FormProvider>
  )
}

const AddStablepoolLiquidity = (
  props: AddStablepoolLiquidityProps & {
    pool: StableSwapBase
  },
) => {
  const { pool } = props
  const { form, ...addLiquidityData } = useStablepoolAddLiquidity({
    pool,
  })

  return (
    <FormProvider {...form}>
      <AddStablepoolLiquidityForm {...props} {...addLiquidityData} />
    </FormProvider>
  )
}

type AddStablepoolLiquidityFormProps = AddStablepoolLiquidityProps &
  Omit<
    | ReturnType<typeof useStablepoolAddLiquidity>
    | ReturnType<typeof useAddMoneyMarketLiquidity>,
    "form"
  >

export const AddStablepoolLiquidityForm = ({
  erc20Id,
  stableswapId,
  closable,
  onBack,
  accountReserveBalances,
  assetsToSelect,
  minReceiveAmount,
  meta,
  activeFarms,
  mutation,
  joinFarmErrorMessage,
  isJoinFarms,
  healthFactor,
}: AddStablepoolLiquidityFormProps) => {
  const { t } = useTranslation(["liquidity", "common"])
  const form = useFormContext<TAddStablepoolLiquidityFormValues>()

  const { control, watch, formState } = form
  const [split, selectedAssetId, option] = watch([
    "split",
    "selectedAssetId",
    "option",
  ])

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const onSubmit = () => mutation.mutate()

  const customErrors = getCustomErrors(formState.errors.sharesAmount)
  const fieldsToRender = split
    ? fields
    : fields.filter((field) => field.asset.id === selectedAssetId)

  const isSubmitDisabled = !formState.isValid

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
          render={({ field: { value, onChange } }) => (
            <Flex
              align="center"
              justify="space-between"
              my={getTokenPx("containers.paddings.tertiary")}
            >
              <Text>
                {t("liquidity.remove.stablepool.modal.proportionally")}
              </Text>
              <Toggle size="large" checked={value} onCheckedChange={onChange} />
            </Flex>
          )}
        />

        <ModalContentDivider />

        {fieldsToRender.map((field) => {
          const balance = accountReserveBalances.get(field.asset.id)
          const originalIndex = fields.findIndex((f) => f.id === field.id)

          return (
            <Fragment key={field.id}>
              <Controller
                name={`reserves.${originalIndex}`}
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => {
                  return (
                    <AssetSelect
                      label={t("liquidity.add.modal.selectAsset")}
                      assets={assetsToSelect}
                      maxBalance={balance}
                      selectedAsset={value.asset}
                      error={error?.message}
                      value={value.amount}
                      onChange={(amount) => {
                        onChange({ ...value, amount })
                      }}
                      setSelectedAsset={
                        !split
                          ? (asset) =>
                              form.setValue("selectedAssetId", asset.id)
                          : undefined
                      }
                    />
                  )
                }}
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

        <AddStablepoolLiquiditySummary
          farms={option === "omnipool" ? activeFarms : []}
          minReceiveAmount={minReceiveAmount}
          selectedAssetId={!split ? selectedAssetId : undefined}
          poolMeta={meta}
          limitType={
            erc20Id && !split ? TradeLimitType.Trade : TradeLimitType.Liquidity
          }
          healthFactor={healthFactor}
          isErc20={!!erc20Id}
        />

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
  isErc20,
}: {
  farms: Farm[]
  minReceiveAmount: string
  selectedAssetId?: string
  poolMeta: TAssetData
  limitType?: TradeLimitType
  healthFactor?: HealthFactorResult
  isErc20: boolean
}) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation(["liquidity", "common"])
  const { data: stableswap } = useStableswap(poolMeta.id)
  const { data: spotPriceData, isLoading: isPriceLoading } = useQuery(
    spotPriceQuery(rpc, poolMeta.id, selectedAssetId ?? ""),
  )

  //@TODO: probably accumulate omnipool and stabpool fees if omnipool is selected
  return (
    <Summary
      separator={<ModalContentDivider />}
      rows={[
        {
          label: t("common:minimalReceived"),
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
                    poolSymbol: poolMeta.symbol,
                    value: spotPriceData?.spotPrice,
                    symbol: getAssetWithFallback(selectedAssetId).symbol,
                  })
                ),
              },
            ]
          : []),

        ...(isErc20
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
