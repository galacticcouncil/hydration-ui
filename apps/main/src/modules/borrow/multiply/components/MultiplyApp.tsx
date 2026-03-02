import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  ComputedReserveData,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import {
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Slider,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  getAssetIdFromAddress,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
} from "@galacticcouncil/utils"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { useAssets } from "@/providers/assetsProvider"

const SectionSeparator = () => <Separator sx={{ mx: "-xl" }} />

const RESERVE_LOGO_OVERRIDE_MAP: Record<string, string> = {
  [GDOT_ASSET_ID]: GDOT_ERC20_ID,
  [GETH_ASSET_ID]: GETH_ERC20_ID,
}

const LEVERAGE_MIN = 1.1
const LEVERAGE_MAX = 4
const LEVERAGE_STEP = 0.1
const LEVERAGE_DEFAULT = 2

type MultiplyFormValues = {
  amount: string
  leverage: number
}

type MultiplyAppProps = {
  collateralReserve: ComputedReserveData
}

export const MultiplyApp: React.FC<MultiplyAppProps> = ({
  collateralReserve,
}) => {
  const { t } = useTranslation(["borrow", "common"])
  const { getAssetWithFallback } = useAssets()

  const { user } = useMoneyMarketData()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const logoId = RESERVE_LOGO_OVERRIDE_MAP[assetId] ?? assetId
  const asset = getAssetWithFallback(assetId)

  const selectedAsset = {
    id: assetId,
    symbol: asset.symbol,
    decimals: asset.decimals,
    iconId: logoId !== assetId ? logoId : undefined,
  }

  const { control, watch } = useForm<MultiplyFormValues>({
    defaultValues: { amount: "", leverage: LEVERAGE_DEFAULT },
  })

  const [amount, leverage] = watch(["amount", "leverage"])
  const loopedAmount = (parseFloat(amount) || 0) * leverage

  const currentHF = user?.healthFactor ?? ""
  const futureHF = currentHF // @TODO: Calculate future HF

  const hf = formatHealthFactorResult({
    currentHF: currentHF,
    futureHF: futureHF,
  })

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
            selectedAsset={selectedAsset}
            value={field.value}
            onChange={field.onChange}
            maxBalanceFallback="0"
          />
        )}
      />

      <SectionSeparator />

      <Box>
        <Flex justify="space-between" mb="xs">
          <Text fs="p5" color="text.medium">
            {t("multiply.app.leverage")}
          </Text>
          <Text fs="p5" color="text.high">
            {t("multiply.app.leverageCurrent", { value: leverage })}
          </Text>
        </Flex>
        <Controller
          control={control}
          name="leverage"
          render={({ field }) => (
            <Slider
              min={LEVERAGE_MIN}
              max={LEVERAGE_MAX}
              step={LEVERAGE_STEP}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Box>

      <SectionSeparator />

      <Paper p="m">
        <Flex justify="space-between" align="center">
          <Box>
            <Text fs="p5" color="text.medium">
              {t("multiply.app.loopedAmount")}
            </Text>
            <Text fs="p6" color="text.medium">
              {t("multiply.app.leverageValue", { value: leverage })}
            </Text>
          </Box>
          <Text fs="p4" color="text.high" fw={500}>
            {t("common:currency", {
              value: loopedAmount,
              symbol: asset.symbol,
            })}
          </Text>
        </Flex>
      </Paper>

      <SectionSeparator />

      <Button variant="primary" size="large" width="100%" type="button">
        {t("multiply.app.openPosition")}
      </Button>

      <Summary separator={<SectionSeparator />}>
        <SummaryRow
          label={t("multiply.app.totalFees")}
          content={t("common:currency", {
            value: 5.63,
          })}
        />
        <SummaryRow
          label={t("multiply.app.minimalReceived")}
          content={
            <>
              {loopedAmount.toFixed(2)} {asset.symbol}
            </>
          }
        />
        <SummaryRow label={t("common:yield")} content={"Up to 16.55%"} />
        <SummaryRow
          label={t("common:price")}
          content={`1 ${asset.symbol} = ${t("common:currency", {
            value: 1000,
          })}`}
        />
        <SummaryRow
          label={t("multiply.app.liquidationPrice")}
          content={"0.0566 (-15.45%)"}
        />
        <SummaryRow
          label={t("common:healthFactor")}
          content={<HealthFactorChange {...hf} />}
        />
      </Summary>
    </Stack>
  )
}
