import {
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useGigaStake } from "@/modules/staking/gigaStaking/GigaStake.utils"

export const GigaStake = () => {
  const { t } = useTranslation(["staking", "common"])
  const { form, minStake, meta, onSubmit } = useGigaStake()

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Paper asChild>
          <Flex direction="column">
            <Box p="l" asChild>
              <Text
                font="primary"
                fw={500}
                fs="h7"
                lh={1}
                color={getToken("text.high")}
              >
                {t("gigaStaking.gigaStake.title")}
              </Text>
            </Box>

            <Separator />

            <Box px="l" asChild>
              <AssetSelectFormField
                assetFieldName="asset"
                amountFieldName="amount"
                label={t("gigaStaking.gigaStake.input.label")}
                assets={[]}
                disabledAssetSelector
              />
            </Box>

            <Separator />

            <Box px="l" asChild>
              <Summary
                rows={[
                  {
                    label: t("gigaStaking.gigaStake.minStake.label"),
                    content: (
                      <Text>
                        {t("common:currency", {
                          value: minStake,
                          symbol: meta.symbol,
                        })}
                      </Text>
                    ),
                  },
                ]}
              />
            </Box>

            <Separator />

            <Box p="l">
              <Button type="submit" size="large" width="100%">
                {t("gigaStaking.gigaStake.cta")}
              </Button>
            </Box>
          </Flex>
        </Paper>
      </form>
    </FormProvider>
  )
}
