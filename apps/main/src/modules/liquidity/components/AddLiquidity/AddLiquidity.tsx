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
import { useRouter } from "@tanstack/react-router"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { useAssetFeeParameters } from "@/api/omnipool"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { scale, scaleHuman } from "@/utils/formatting"

import {
  getCustomErrors,
  TAddLiquidityFormValues,
  useAddLiquidity,
} from "./AddLiqudity.utils"
import { RewardsAPR } from "./RewardsAPR"

type Props = {
  readonly closable?: boolean
  readonly assetId: string
}

export const AddLiquidity: FC<Props> = ({ assetId, closable = false }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { history } = useRouter()

  const {
    form,
    liquidityShares,
    balance,
    meta,
    activeFarms,
    joinFarmErrorMessage,
    mutation,
    isJoinFarms,
  } = useAddLiquidity(assetId)

  const onSubmit = async (values: TAddLiquidityFormValues) => {
    if (!liquidityShares || !values.amount)
      throw new Error("Invalid input data")

    const amount = scale(values.amount, meta.decimals).toString()

    mutation.mutate({
      assetId,
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
        onBack={!closable ? () => history.back() : undefined}
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
            minSharesToGet={liquidityShares?.minSharesToGet ?? "0"}
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
        </form>
      </ModalBody>
    </>
  )
}

const AddLiquiditySummary = ({
  meta,
  poolShare,
  minSharesToGet,
  farms,
}: {
  meta: TAssetData
  poolShare: string
  minSharesToGet: string
  farms: Farm[]
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
          label: t("common:minimalReceived"),
          content: t("liquidity.add.modal.sharesToGet", {
            value: scaleHuman(minSharesToGet, meta.decimals),
            percentage: poolShare,
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
      ]}
    />
  )
}
