import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  Alert,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { useAssetFeeParameters } from "@/api/omnipool"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { useAssets } from "@/providers/assetsProvider"
import { AddLiquidityProps } from "@/routes/liquidity/$id.add"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

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
  onSubmitted,
}) => {
  const { t } = useTranslation(["liquidity", "common"])

  const {
    form,
    liquidityShares,
    poolMeta,
    activeFarms,
    joinFarmErrorMessage,
    onSubmit,
    isJoinFarms,
    canAddLiquidity,
    underlyingAssetMeta,
  } = useAddLiquidity({ poolId: id, onSubmitted })

  const { formState, handleSubmit } = form
  const customErrors = getCustomErrors(formState.errors.amount)

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("addLiquidity")}
        closable={closable}
        onBack={onBack}
      />
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <ModalBody>
          <AssetSelectFormField<TAddLiquidityFormValues>
            label={t("liquidity.add.modal.selectAsset")}
            assetFieldName="asset"
            amountFieldName="amount"
            assets={underlyingAssetMeta ? [underlyingAssetMeta, poolMeta] : []}
            sx={{ pt: 0 }}
            disabledAssetSelector={!underlyingAssetMeta}
          />

          <ModalContentDivider />

          <AddLiquiditySummary
            meta={poolMeta}
            poolShare={liquidityShares?.poolShare ?? "0"}
            minReceiveAmount={scaleHuman(
              liquidityShares?.minSharesToGet ?? "0",
              poolMeta.decimals,
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
        </ModalBody>
        <ModalFooter sx={{ pt: 0 }}>
          <Button
            type="submit"
            size="large"
            width="100%"
            disabled={!canAddLiquidity || !formState.isValid}
          >
            {isJoinFarms
              ? t("liquidity.add.modal.submitAndjoinFarms")
              : t("liquidity.add.modal.submit")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
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
  const { isMobile } = useBreakpoints()

  const { data: feeParameters, isLoading } = useAssetFeeParameters()
  const { price, isLoading: isPriceLoading } = useAssetPrice(meta.id)

  return (
    <Summary
      separator={<ModalContentDivider />}
      rows={[
        {
          label: isMobile
            ? t("liquidity.add.modal.sharesToGet.label.mob")
            : t("liquidity.add.modal.sharesToGet.label"),
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
        ...(healthFactor?.isSignificantChange
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
