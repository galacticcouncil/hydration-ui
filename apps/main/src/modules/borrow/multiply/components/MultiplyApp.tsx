import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  ComputedReserveData,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import {
  formatHealthFactorResult,
  getReserveAssetIdByAddress,
} from "@galacticcouncil/money-market/utils"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  FormLabel,
  LoadingButton,
  Paper,
  Separator,
  Slider,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import z from "zod"

import { useDisplayAssetPrice } from "@/components/AssetPrice/AssetPrice"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useLooping } from "@/modules/borrow/hooks/useLooping"
import {
  MAX_SAFE_LEVERAGE_FACTOR,
  MULTIPLY_ASSETS_CONFIG,
} from "@/modules/borrow/multiply/config"
import { getMaxReserveLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"
import { required } from "@/utils/validators"

const SectionSeparator = () => <Separator sx={{ mx: "-xl" }} />

const LEVERAGE_MIN = 1.1
const LEVERAGE_STEP = 0.1
const LEVERAGE_DEFAULT = 2

type MultiplyAppProps = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
}

const schema = z.object({
  amount: required,
  multiplier: z.number(),
})

type MultiplyFormValues = z.infer<typeof schema>

export const MultiplyApp: React.FC<MultiplyAppProps> = ({
  collateralReserve,
  debtReserve,
}) => {
  const { isConnected } = useAccount()
  const { t } = useTranslation(["borrow", "common"])
  const { getAsset, getRelatedAToken } = useAssets()

  const { user } = useMoneyMarketData()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)

  const strategy = MULTIPLY_ASSETS_CONFIG.find(
    (s) => s.collateralAssetId === assetId,
  )

  const supplyAssetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const borrowAssetId = strategy?.enterWithAssetId
    ? strategy.enterWithAssetId
    : getReserveAssetIdByAddress(debtReserve.underlyingAsset)

  const supplyAsset = getAsset(supplyAssetId)
  const supplyAToken = getRelatedAToken(assetId)
  const borrowAsset = getAsset(borrowAssetId)

  const enteredWithAsset = strategy?.enterWithAssetId
    ? getAsset(strategy.enterWithAssetId)
    : supplyAsset

  const form = useForm<MultiplyFormValues>({
    defaultValues: { amount: "", multiplier: LEVERAGE_DEFAULT },
    resolver: standardSchemaResolver(schema),
  })

  const [amount, multiplier] = form.watch(["amount", "multiplier"])
  const loopedAmount = (parseFloat(amount) || 0) * multiplier

  const currentHF = user?.healthFactor ?? ""
  const futureHF = currentHF // @TODO: Calculate future HF

  const hf = formatHealthFactorResult({
    currentHF: currentHF,
    futureHF: futureHF,
  })

  const isLoopingAvailable = !!supplyAsset && !!borrowAsset

  const {
    submitLooping,
    isLoading: isLoopingLoading,
    minAmountOut: minLoopedAmountOut,
    totalBorrow,
  } = useLooping(
    {
      amount,
      multiplier,
      supplyAssetId,
      borrowAssetId,
      assetInId: borrowAsset?.id ?? "",
      assetOutId: supplyAToken?.id ?? "",
    },
    {
      enabled: isLoopingAvailable && isConnected,
      onSubmitted: form.reset,
    },
  )

  const maxSafeLeverage = getMaxReserveLeverage(
    collateralReserve,
    MAX_SAFE_LEVERAGE_FACTOR,
  )

  const minTotalSupply = supplyAToken
    ? scaleHuman(minLoopedAmountOut, supplyAToken.decimals)
    : "0"

  const [debtDisplayPrice] = useDisplayAssetPrice(borrowAssetId, totalBorrow)
  const [minSupplyDisplayPrice] = useDisplayAssetPrice(
    supplyAssetId,
    minTotalSupply,
  )

  return (
    <FormProvider {...form}>
      <form>
        <Stack gap="l" as={Paper} p="xl">
          <Controller
            control={form.control}
            name="amount"
            render={({ field }) => (
              <AssetSelect
                sx={{ py: 0 }}
                label={t("multiply.app.yourDeposit")}
                assets={[]}
                selectedAsset={enteredWithAsset}
                value={field.value}
                onChange={field.onChange}
                maxBalanceFallback="0"
              />
            )}
          />

          <SectionSeparator />

          <Box>
            <Flex justify="space-between" mb="xs">
              <FormLabel>{t("multiply.app.leverage")}</FormLabel>
              <FormLabel>
                <Trans
                  i18nKey="multiply.app.leverageCurrent"
                  values={{ value: multiplier }}
                  t={t}
                >
                  <Text fw={500} as="span" color={getToken("text.high")} />
                </Trans>
              </FormLabel>
            </Flex>
            <Controller
              control={form.control}
              name="multiplier"
              render={({ field }) => (
                <Stack>
                  <Slider
                    min={LEVERAGE_MIN}
                    max={maxSafeLeverage}
                    step={LEVERAGE_STEP}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <Flex justify="space-between">
                    <Text fs="p5" color={getToken("text.medium")}>
                      {LEVERAGE_MIN}x
                    </Text>
                    <Text fs="p5" color={getToken("text.medium")}>
                      {maxSafeLeverage}x
                    </Text>
                  </Flex>
                </Stack>
              )}
            />
          </Box>

          <SectionSeparator />

          {supplyAToken && (
            <Paper p="m">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fs="p4">{t("multiply.app.loopedAmount")}</Text>
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("multiply.app.leverageValue", { value: multiplier })}
                  </Text>
                </Box>
                <Stack align="end">
                  <Text fs="p2" color="text.high" fw={600}>
                    {t("common:currency", {
                      prefix: t("common:approx.short"),
                      value: loopedAmount,
                      symbol: supplyAToken.symbol,
                    })}
                  </Text>
                  <Text fs="p6" color={getToken("text.medium")}>
                    {minSupplyDisplayPrice}
                  </Text>
                </Stack>
              </Flex>
            </Paper>
          )}

          <SectionSeparator />

          <AuthorizedAction size="large" width="100%">
            <LoadingButton
              isLoading={isLoopingLoading}
              disabled={isLoopingLoading || !form.formState.isValid}
              variant="primary"
              size="large"
              width="100%"
              onClick={() => submitLooping()}
            >
              {t("multiply.app.openPosition")}
            </LoadingButton>
          </AuthorizedAction>

          <CollapsibleRoot open={isConnected}>
            <CollapsibleContent>
              <Summary separator={<SectionSeparator />}>
                {supplyAToken && (
                  <SummaryRow
                    label="Total collateral"
                    content={
                      <Flex gap="s">
                        {t("common:currency", {
                          prefix: t("common:approx.short"),
                          value: scaleHuman(
                            minLoopedAmountOut,
                            supplyAToken.decimals,
                          ),
                          symbol: supplyAToken.symbol,
                        })}
                        <Text fs="p5" color={getToken("text.medium")}>
                          ({minSupplyDisplayPrice})
                        </Text>
                      </Flex>
                    }
                  />
                )}
                {borrowAsset && (
                  <SummaryRow
                    label="Total debt"
                    content={
                      <Flex gap="s">
                        {t("common:currency", {
                          prefix: t("common:approx.short"),
                          value: totalBorrow,
                          symbol: borrowAsset.symbol,
                        })}
                        <Text fs="p5" color={getToken("text.medium")}>
                          ({debtDisplayPrice})
                        </Text>
                      </Flex>
                    }
                  />
                )}
                {/*       <SummaryRow label={t("common:yield")} content={"Up to 16.55%"} /> */}
                {/*      <SummaryRow
          label={t("common:price")}
          content={`1 ${asset.symbol} = ${t("common:currency", {
            value: 1000,
          })}`}
        /> */}
                {/*         <SummaryRow
          label={t("multiply.app.liquidationPrice")}
          content={"0.0566 (-15.45%)"}
        /> */}
                <SummaryRow
                  label={t("common:healthFactor")}
                  content={<HealthFactorChange {...hf} />}
                />
              </Summary>
            </CollapsibleContent>
          </CollapsibleRoot>
        </Stack>
      </form>
    </FormProvider>
  )
}
