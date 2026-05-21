import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Lock } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Chip,
  Collapsible,
  Flex,
  Paper,
  Separator,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { USDC_ASSET_ID, USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import { useStableBondsForm } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import {
  FAKE_STRATEGY,
  STABLE_BONDS_ASSET_ID,
} from "@/modules/strategies/stable-bonds/constants"
import { useAssets } from "@/providers/assetsProvider"

const SPanelContainer = styled(Paper)(
  ({ theme }) => css`
    --deposit-section-padding-inline: ${theme.containers.paddings.primary};
    --deposit-section-inset-inline: calc(
      var(--deposit-section-padding-inline) * -1
    );

    padding: 0 var(--deposit-section-padding-inline);
    overflow-x: hidden;
  `,
)

const SPriceChipWrap = styled(Flex)`
  position: relative;
  justify-content: center;
  z-index: 1;
  align-items: center;
  margin-inline: -${({ theme }) => theme.space.xl};
`

const EXCHANGE_RATE = 1.01725
const TOTAL_FEES_USD = 5.63

export const StableBondsPanel = () => {
  const { t } = useTranslation("common")
  const form = useStableBondsForm()
  const { getAssetWithFallback } = useAssets()

  const depositAssets = useMemo(() => {
    return [USDC_ASSET_ID, USDT_ASSET_ID].map((id) => getAssetWithFallback(id))
  }, [getAssetWithFallback])

  const receiveAsset = getAssetWithFallback(STABLE_BONDS_ASSET_ID)

  const { handleSubmit, watch } = form
  const [depositAsset, depositAmount] = watch(["depositAsset", "depositAmount"])

  const depositAmountNum = parseFloat(depositAmount) || 0
  const receiveAmount = depositAmountNum * EXCHANGE_RATE

  const onSubmit = (_values: StableBondsFormValues) => {
    // TODO: implement stable bonds deposit transaction
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <SPanelContainer>
          <Box pt="l">
            <AssetSelectFormField<StableBondsFormValues>
              label="Your deposit"
              assetFieldName="depositAsset"
              amountFieldName="depositAmount"
              assets={depositAssets}
              maxBalanceFallback="0"
            />

            <SPriceChipWrap>
              <Separator sx={{ flex: 1 }} />
              <Chip size="small" rounded variant="tertiary">
                <Text fs="p6" color={getToken("text.medium")}>
                  Price: 1 {depositAsset?.symbol ?? ""} ={" "}
                  {t("currency", {
                    value: EXCHANGE_RATE,
                    symbol: receiveAsset.symbol,
                  })}
                </Text>
              </Chip>
              <Separator sx={{ width: "xl" }} />
            </SPriceChipWrap>

            <AssetInput
              label="Receive at maturity"
              symbol={receiveAsset.symbol}
              selectedAssetIcon={
                <AssetLogo id={STABLE_BONDS_ASSET_ID} size="medium" />
              }
              modalDisabled
              disabledInput
              ignoreBalance
              value={receiveAmount > 0 ? receiveAmount.toString() : ""}
              displayValue={t("currency", {
                value: receiveAmount,
              })}
            />
          </Box>

          <Separator mx="-xl" />

          <Box>
            <SummaryRow
              label={
                <Flex align="center" gap="base">
                  <Lock size={14} />
                  <Text fs="p5">Maturity period</Text>
                </Flex>
              }
              content={`${FAKE_STRATEGY.maturityPeriodDays} days`}
            />
          </Box>

          <Separator mx="-xl" />

          <Box py="xl">
            <AuthorizedAction size="large" width="100%">
              <Button
                type="submit"
                size="large"
                width="100%"
                disabled={depositAmountNum <= 0}
              >
                {t("confirm")}
              </Button>
            </AuthorizedAction>
          </Box>

          <Box mt="-base" pb="base">
            <Collapsible
              label={
                <Flex align="center" gap="s">
                  <Text fs="p5" color={getToken("text.medium")}>
                    Total fees
                  </Text>
                  <Text fs="p5" fw={500} color={getToken("text.high")}>
                    {t("currency", { value: TOTAL_FEES_USD })}
                  </Text>
                </Flex>
              }
              actionLabel=""
              actionLabelWhenOpen=""
            >
              <Stack gap="base" pt="s">
                <Flex justify="space-between" align="center">
                  <Text fs="p6" color={getToken("text.medium")}>
                    Total fees
                  </Text>
                  <Text fs="p6" fw={500} color={getToken("text.high")}>
                    {t("currency", { value: TOTAL_FEES_USD })}
                  </Text>
                </Flex>
              </Stack>
            </Collapsible>
          </Box>
        </SPanelContainer>
      </form>
    </FormProvider>
  )
}
