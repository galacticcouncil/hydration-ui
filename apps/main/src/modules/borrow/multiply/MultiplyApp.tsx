import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  Alert,
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
import { useAccount } from "@galacticcouncil/web3-connect"
import { Controller, FormProvider } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice/AssetPrice"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { MultiplyErrors } from "@/modules/borrow/multiply/components/MultiplyErrors"
import {
  LEVERAGE_DEFAULT,
  LEVERAGE_MIN,
  LEVERAGE_STEP,
  MAX_SAFE_LEVERAGE_FACTOR,
} from "@/modules/borrow/multiply/config/constants"
import { MULTIPLY_ASSETS_PAIRS } from "@/modules/borrow/multiply/config/pairs"
import { useLooping } from "@/modules/borrow/multiply/hooks/useLooping"
import {
  LEVERAGE_MIN,
  LEVERAGE_STEP,
  MultiplyFormValues,
  useMultiplyApp,
} from "@/modules/borrow/multiply/MyltiplyApp.utils"
import { MultiplyAssetPair } from "@/modules/borrow/multiply/types"
import { getMaxReservePairLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

const SectionSeparator = () => <Separator sx={{ mx: "-xl" }} />

export type MultiplyAppProps = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
  proxies: Array<string>
  proxyCreationFee: bigint
  strategy: MultiplyAssetPair
}

export const MultiplyApp: React.FC<MultiplyAppProps> = ({
  collateralReserve,
  debtReserve,
  strategy,
  proxyCreationFee,
  proxies,
}) => {
  const { native } = useAssets()
  const { isConnected } = useAccount()
  const { t } = useTranslation(["borrow", "common"])
  const {
    form,
    hf,
    totalCollateral,
    targetDebt,
    isLoading,
    errors,
    borrowAsset,
    supplyAsset,
    supplyAToken,
    onSubmit,
  } = useMultiplyApp({
    collateralReserve,
    debtReserve,
    strategy,
    proxyCreationFee,
    proxies,
  })

  const maxSafeLeverage = getMaxReservePairLeverage(
    collateralReserve,
    debtReserve,
    MAX_SAFE_LEVERAGE_FACTOR,
  )

  const [debtDisplayPrice] = useDisplayAssetPrice(borrowAsset.id, targetDebt)
  const [collateralDisplayPrice] = useDisplayAssetPrice(
    supplyAsset.id,
    totalCollateral,
  )

  const [multiplier] = form.watch(["multiplier"])

  const feeError = form.formState.errors.fee?.message

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap="l" as={Paper} p="xl">
          <AssetSelectFormField<MultiplyFormValues>
            label={t("multiply.app.yourDeposit")}
            assetFieldName="asset"
            amountFieldName="amount"
            assets={[]}
            disabledAssetSelector
            sx={{ pt: 0 }}
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

          {supplyAsset && (
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
                      value: totalCollateral,
                      symbol: supplyAToken?.symbol,
                    })}
                  </Text>
                  <Text fs="p6" color={getToken("text.medium")}>
                    {collateralDisplayPrice}
                  </Text>
                </Stack>
              </Flex>
            </Paper>
          )}

          <SectionSeparator />

          {errors.length > 0 && <MultiplyErrors errors={errors} />}

          {feeError && (
            <>
              <Alert variant="error" title={feeError} />
              <SectionSeparator />
            </>
          )}

          <AuthorizedAction size="large" width="100%">
            <LoadingButton
              isLoading={isLoading}
              disabled={
                isLoading || errors.length > 0 || !form.formState.isValid
              }
              variant="primary"
              size="large"
              width="100%"
              type="submit"
            >
              {t("multiply.app.openPosition")}
            </LoadingButton>
          </AuthorizedAction>

          <CollapsibleRoot open={isConnected}>
            <CollapsibleContent>
              <Summary separator={<SectionSeparator />}>
                {supplyAsset && (
                  <SummaryRow
                    label={t("multiply.app.totalCollateral")}
                    content={
                      <Flex gap="s">
                        {t("common:currency", {
                          prefix: t("common:approx.short"),
                          value: totalCollateral,
                          symbol: supplyAToken?.symbol,
                        })}
                        <Text fs="p5" color={getToken("text.medium")}>
                          ({collateralDisplayPrice})
                        </Text>
                      </Flex>
                    }
                  />
                )}
                {borrowAsset && (
                  <SummaryRow
                    label={t("multiply.app.totalDebt")}
                    content={
                      <Flex gap="s">
                        {t("common:currency", {
                          prefix: t("common:approx.short"),
                          value: targetDebt,
                          symbol: borrowAsset.symbol,
                        })}
                        <Text fs="p5" color={getToken("text.medium")}>
                          ({debtDisplayPrice})
                        </Text>
                      </Flex>
                    }
                  />
                )}

                <SummaryRow
                  label="Create proxy fee"
                  content={t("common:currency", {
                    value: scaleHuman(proxyCreationFee, native.decimals),
                    symbol: native.symbol,
                  })}
                />

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
