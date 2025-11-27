import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  Alert,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { useAssetFeeParameters } from "@/api/omnipool"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { useAssets } from "@/providers/assetsProvider"
import { AddLiquidityProps } from "@/routes/liquidity/$id.add"
import { useAssetPrice } from "@/states/displayAsset"
import { scale, scaleHuman } from "@/utils/formatting"

import {
  getCustomErrors,
  TAddLiquidityFormValues,
  useAddLiquidity,
} from "./AddLiqudity.utils"
import { RewardsAPR } from "./RewardsAPR"

export const AddLiquidity: FC<AddLiquidityProps> = ({
  id,
  onBack,
  closable = false,
}) => {
  const { t } = useTranslation(["liquidity", "common"])

  const {
    form,
    liquidityShares,
    balance,
    meta,
    activeFarms,
    joinFarmErrorMessage,
    mutation,
    isJoinFarms,
  } = useAddLiquidity(id)

  const onSubmit = async (values: TAddLiquidityFormValues) => {
    if (!liquidityShares || !values.amount)
      throw new Error("Invalid input data")

    const amount = scale(values.amount, meta.decimals).toString()

    mutation.mutate({
      assetId: id,
      amount,
      shares: liquidityShares.minSharesToGet,
      symbol: meta.symbol,
      decimals: meta.decimals,
    })
  }

  const customErrors = getCustomErrors(form.formState.errors.amount)

  const isSubmitDisabled = !!Object.keys(customErrors ?? {}).filter(
    (key) => key !== "farm",
  ).length

  return (
    <>
      <ModalHeader
        title={t("addLiquidity")}
        closable={closable}
        onBack={onBack}
      />
      <ModalBody>
        <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <Controller
            name="amount"
            control={form.control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <AssetSelect
                label={t("liquidity.add.modal.selectAsset")}
                assets={[]}
                selectedAsset={meta}
                maxBalance={balance}
                value={value}
                onChange={onChange}
                error={error?.message}
                sx={{ pt: 0 }}
              />
            )}
          />

          <ModalContentDivider />

          <AddLiquiditySummary
            meta={meta}
            poolShare={liquidityShares?.poolShare ?? "0"}
            minReceiveAmount={scaleHuman(
              liquidityShares?.minSharesToGet ?? "0",
              meta.decimals,
            )}
            farms={activeFarms}
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
        </form>
      </ModalBody>
    </>
  )
}

export const AddLiquiditySummary = ({
  meta,
  poolShare,
  minReceiveAmount,
  farms,
  healthFactor,
}: {
  meta: TAssetData
  poolShare?: string
  minReceiveAmount: string
  farms: Farm[]
  healthFactor?: HealthFactorResult
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { native } = useAssets()

  const { data: feeParameters, isLoading } = useAssetFeeParameters()
  const { price, isLoading: isPriceLoading } = useAssetPrice(meta.id)

  return (
    <Summary
      separator={<ModalContentDivider />}
      rows={[
        {
          label: t("common:minimumReceived"),
          content: poolShare
            ? t("liquidity.add.modal.sharesToGet", {
                value: minReceiveAmount,
                percentage: poolShare,
              })
            : t("common:number", {
                value: minReceiveAmount,
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
          content: isLoading ? (
            <Skeleton width={100} height="100%" />
          ) : meta.id === native.id || !feeParameters ? (
            "--"
          ) : (
            <Text fs="p5" color={getToken("accents.success.emphasis")} fw={500}>
              {t("liquidity.add.modal.rewardsFromFees.value", {
                from: feeParameters.minFee * 100,
                to: feeParameters.maxFee * 100,
              })}
            </Text>
          ),
        },
        {
          label: t("common:price"),
          content: isPriceLoading ? (
            <Skeleton width={50} height="100%" />
          ) : (
            t("liquidity.add.modal.price", {
              value: price,
              assetSymbol: meta.symbol,
            })
          ),
        },
        ...(healthFactor
          ? [
              {
                label: t("common:healthFactor"),
                content: (
                  <HealthFactorChange
                    healthFactor={healthFactor.current}
                    futureHealthFactor={healthFactor.future}
                    fontSize="p5"
                  />
                ),
              },
            ]
          : []),
      ]}
    />
  )
}
