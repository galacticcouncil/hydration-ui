import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  Box,
  Button,
  Separator,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useGigaStake } from "@/modules/staking/gigaStaking/GigaStake.utils"

export type GigaStakeProps = {
  minStake: bigint
  hdxReserve: ComputedReserveData
}

export const GigaStake: FC<GigaStakeProps> = ({ minStake, hdxReserve }) => {
  const { t } = useTranslation(["staking", "common"])
  const { form, minStakeHuman, meta, onSubmit } = useGigaStake({
    minStake,
    hdxReserve,
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
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
                      value: minStakeHuman,
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
          <Button
            type="submit"
            size="large"
            width="100%"
            disabled={!form.formState.isValid}
          >
            {t("gigaStaking.gigaStake.cta")}
          </Button>
        </Box>
      </form>
    </FormProvider>
  )
}
