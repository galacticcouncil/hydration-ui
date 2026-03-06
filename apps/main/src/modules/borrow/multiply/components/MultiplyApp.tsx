import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  ComputedReserveData,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
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
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice/AssetPrice"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useLooping } from "@/modules/borrow/hooks/useLooping"
import { MAX_SAFE_LEVERAGE_FACTOR } from "@/modules/borrow/multiply/config"
import { getMaxLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

const SectionSeparator = () => <Separator sx={{ mx: "-xl" }} />

const LEVERAGE_MIN = 1.1
const LEVERAGE_STEP = 0.1
const LEVERAGE_DEFAULT = 2

type MultiplyFormValues = {
  amount: string
  multiplier: number
}

type MultiplyAppProps = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
}

export const MultiplyApp: React.FC<MultiplyAppProps> = ({
  collateralReserve,
  debtReserve,
}) => {
  const { isConnected } = useAccount()
  const { t } = useTranslation(["borrow", "common"])
  const { getAsset, getRelatedAToken } = useAssets()

  const { user } = useMoneyMarketData()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  //const asset = getAssetWithFallback(assetId)

  const supplyAssetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const borrowAssetId = getAssetIdFromAddress(debtReserve.underlyingAsset)

  const supplyAsset = getAsset(supplyAssetId)
  const supplyAToken = getRelatedAToken(assetId)
  const borrowAsset = getAsset(borrowAssetId)

  const { control, watch } = useForm<MultiplyFormValues>({
    defaultValues: { amount: "", multiplier: LEVERAGE_DEFAULT },
  })

  const [amount, multiplier] = watch(["amount", "multiplier"])
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
      withEmode: true,
    },
    {
      enabled: isLoopingAvailable && isConnected,
    },
  )

  const maxLtvValue =
    collateralReserve.eModeCategoryId > 0
      ? collateralReserve.formattedEModeLtv
      : collateralReserve.formattedBaseLTVasCollateral

  const maxSafeLeverage = getMaxLeverage(
    Number(maxLtvValue),
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
    <Stack gap="l" as={Paper} p="xl">
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <AssetSelect
            sx={{ py: 0 }}
            label={t("multiply.app.yourDeposit")}
            assets={[]}
            selectedAsset={borrowAsset}
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
          control={control}
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
          disabled={isLoopingLoading}
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
  )
}
