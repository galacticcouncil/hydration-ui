import {
  Alert,
  Button,
  Flex,
  LinkTextButton,
  ModalBody,
  ModalContainer,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Summary,
  SummaryRowValue,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useAssetFeeParameters } from "@/api/omnipool"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { IMPERMANENT_LOSS_LINK } from "@/config/links"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"
import { scale, scaleHuman } from "@/utils/formatting"

import {
  getCustomErrors,
  getLimitShares,
  useAddToOmnipoolZod,
  useLiquidityShares,
  useSubmitAddLiquidity,
} from "./AddLiqudity.utils"

type TFormValues = { amount: string }

const defaultValues: TFormValues = { amount: "" }

const addLiquidityLimit = 3

const farms = []

export const AddLiquidity = ({ assetId }: { assetId: string }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(assetId)

  const { getBalance } = useAccountBalances()
  const zodSchema = useAddToOmnipoolZod(assetId)
  const { mutate: submitAddLiquidity } = useSubmitAddLiquidity()

  const form = useForm<TFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodSchema ? standardSchemaResolver(zodSchema) : undefined,
  })

  const isFarms = farms.length > 0

  const liquidityShares = useLiquidityShares(assetId, form.watch("amount"))
  const balance = scaleHuman(getBalance(assetId)?.free ?? 0n, meta.decimals)

  const onSubmit = async (values: TFormValues) => {
    if (!liquidityShares || !values.amount)
      throw new Error("Invalid input data")

    const amount = scale(values.amount, meta.decimals).toString()
    const shares = getLimitShares(
      liquidityShares.sharesToGet,
      addLiquidityLimit,
    )

    submitAddLiquidity({
      assetId,
      amount,
      shares,
      symbol: meta.symbol,
      decimals: meta.decimals,
    })
  }

  const customErrors = getCustomErrors(form.formState.errors.amount)

  const isSubmitDisabled = !!Object.keys(customErrors ?? {}).filter(
    (key) => key !== "farm",
  ).length

  return (
    <Flex justify="center" mt={getTokenPx("containers.paddings.primary")}>
      <ModalContainer open>
        <ModalHeader title={t("addLiquidity")} closable={false} />
        <ModalBody>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <Controller
              name="amount"
              control={form.control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
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

            <Summary
              separator={<ModalContentDivider />}
              rows={[
                { label: t("liquidity.add.modal.tradeLimit"), content: "100" },
                {
                  label: t("liquidity.add.modal.rewardsFromFees.label"),
                  content: <RewardsFromFees assetId={assetId} />,
                },
              ]}
            />

            <ModalContentDivider />

            <Text
              color={getToken("text.tint.secondary")}
              fw={500}
              font="primary"
              fs="h7"
              sx={{
                mt: getTokenPx("containers.paddings.primary"),
                mb: getTokenPx("containers.paddings.quart"),
              }}
            >
              {t("liquidity:positionDetails")}
            </Text>

            <ModalContentDivider />

            <Summary
              separator={<ModalContentDivider />}
              rows={[
                {
                  label: t("liquidity.add.modal.receivedAmountOfPoolShares"),
                  content: t("common:percent", {
                    value: liquidityShares?.poolShare,
                  }),
                },
                {
                  label: t("common:price"),
                  content: <Price assetId={assetId} symbol={meta.symbol} />,
                },
              ]}
            />

            <ModalContentDivider />

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

            <Alert
              sx={{ my: getTokenPx("containers.paddings.primary") }}
              displayIcon={false}
              title={t("liquidity.add.modal.info.description")}
              description={
                <LinkTextButton direction="none" href={IMPERMANENT_LOSS_LINK}>
                  {t("liquidity.add.modal.info.learnMoreAboutRisks")}
                </LinkTextButton>
              }
            />

            <ModalContentDivider />

            <Button
              type="submit"
              size="large"
              width="100%"
              mt={getTokenPx("containers.paddings.primary")}
              disabled={isSubmitDisabled}
            >
              {isFarms
                ? t("liquidity.add.modal.submitAndjoinFarms")
                : t("liquidity.add.modal.submit")}
            </Button>
          </form>
        </ModalBody>
      </ModalContainer>
    </Flex>
  )
}

const RewardsFromFees = ({ assetId }: { assetId: string }) => {
  const { t } = useTranslation("liquidity")
  const { native } = useAssets()

  const { data: feeParameters, isLoading } = useAssetFeeParameters()

  return (
    <SummaryRowValue>
      {isLoading ? (
        <Skeleton width={100} height="100%" />
      ) : assetId === native.id || !feeParameters ? (
        "--"
      ) : (
        t("liquidity.add.modal.rewardsFromFees.value", {
          from: feeParameters.minFee * 100,
          to: feeParameters.maxFee * 100,
        })
      )}
    </SummaryRowValue>
  )
}

const Price = ({ assetId, symbol }: { assetId: string; symbol: string }) => {
  const { t } = useTranslation("liquidity")
  const { price } = useAssetPrice(assetId)

  return (
    <SummaryRowValue>
      {t("liquidity.add.modal.price", { value: price, assetSymbol: symbol })}
    </SummaryRowValue>
  )
}
