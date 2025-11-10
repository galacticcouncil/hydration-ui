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
import { Controller, useFieldArray } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { stablePools, StableSwapBase } from "@/api/pools"
import { spotPriceQuery } from "@/api/spotPrice"
import { useStableswap } from "@/api/stablewap"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { getCustomErrors } from "@/modules/liquidity/components/AddLiquidity/AddLiqudity.utils"
import { RewardsAPR } from "@/modules/liquidity/components/AddLiquidity/RewardsAPR"
import { StablepoolReserves } from "@/modules/liquidity/components/StablepoolReserves/StablepoolReserves"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

import {
  addStablepoolOptions,
  useStablepoolAddLiquidity,
} from "./AddStablepoolLiquidity.utils"
import { AddStablepoolLiquiditySkeleton } from "./AddStablepoolLiquiditySkeleton"

export type AddStablepoolLiquidityProps = {
  closable: boolean
  onBack: () => void
  id: string
}

export const AddStablepoolLiquidity = (props: AddStablepoolLiquidityProps) => {
  const { id } = props
  const { data: pools = [], isLoading: isPoolsLoading } = useQuery(stablePools)
  const { isBalanceLoading } = useAccountBalances()
  const pool = pools.find((pool) => pool.id === Number(id))

  if (isPoolsLoading || !pool || isBalanceLoading)
    return <AddStablepoolLiquiditySkeleton {...props} />

  return <AddStablepoolLiquidityForm pool={pool} {...props} />
}

export const AddStablepoolLiquidityForm = ({
  pool,
  closable,
  onBack,
}: AddStablepoolLiquidityProps & {
  pool: StableSwapBase
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    form,
    accountReserveBalances,
    stablepoolAssets,
    stablepoolSharesHuman,
    meta,
    activeFarms,
    mutation,
    joinFarmErrorMessage,
    isJoinFarms,
  } = useStablepoolAddLiquidity({
    pool,
  })

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
                      assets={stablepoolAssets}
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
          poolId={pool.id.toString()}
          separator={<ModalContentDivider />}
        />
        <ModalContentDivider />

        <AddStablepoolLiquiditySummary
          farms={option === "omnipool" ? activeFarms : []}
          stablepoolSharesHuman={stablepoolSharesHuman}
          selectedAssetId={!split ? selectedAssetId : undefined}
          poolMeta={meta}
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
  stablepoolSharesHuman,
  selectedAssetId,
  poolMeta,
}: {
  farms: Farm[]
  stablepoolSharesHuman: string
  selectedAssetId?: string
  poolMeta: TAssetData
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
            value: stablepoolSharesHuman,
          }),
        },
        {
          label: t("common:tradeLimit"),
          content: <TradeLimit type={TradeLimitType.Liquidity} />,
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
      ]}
    />
  )
}

export const AddStablepoolLiquidityTooltip = () => {
  return <Tooltip text="TBD" />
}
