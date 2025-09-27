import {
  Button,
  Flex,
  Grid,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  stakeFormOptions,
  StakeFormValues,
  useStakeForm,
} from "@/modules/staking/Stake.form"
import { SHeaderTab } from "@/modules/trade/swap/components/FormHeader/FormHeader.styled"
import { useAssets } from "@/providers/assetsProvider"

// TODO integrate
const minIncrement = 1000
const incrementSymbol = "HDX"

export const Stake: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { account } = useAccount()

  const { tradable } = useAssets()
  const form = useStakeForm()

  const type = form.watch("type")

  return (
    <FormProvider {...form}>
      <Paper>
        <Flex
          px={getTokenPx("containers.paddings.primary")}
          py={getTokenPx("containers.paddings.tertiary")}
          align="center"
          gap={getTokenPx("scales.paddings.m")}
        >
          {stakeFormOptions.map((option) => (
            <SHeaderTab
              key={option}
              sx={{ cursor: "pointer" }}
              data-status={option === type ? "active" : "inactive"}
              onClick={() => form.setValue("type", option)}
            >
              {t(`staking:stake.${option}`)}
            </SHeaderTab>
          ))}
        </Flex>
        <Separator />
        {/* TODO integrate */}
        <AssetSelectFormField<StakeFormValues>
          sx={{ px: getTokenPx("containers.paddings.primary") }}
          label={t("staking:stake.amount")}
          assets={tradable}
          assetFieldName="asset"
          amountFieldName="amount"
        />
        <Separator />
        <Flex
          px={getTokenPx("containers.paddings.primary")}
          py={getTokenPx("containers.paddings.quint")}
          justify="space-between"
          align="center"
        >
          <Text fs="p5" lh={1.4} color={getToken("text.medium")}>
            {t("staking:stake.minimum")}
          </Text>
          <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
            {t("currency", { value: minIncrement, symbol: incrementSymbol })}
          </Text>
        </Flex>
        <Separator />
        {
          <Grid
            px={getTokenPx("containers.paddings.primary")}
            py={getTokenPx("containers.paddings.primary")}
          >
            {account ? (
              <Button size="large">
                {type === "stake"
                  ? t("staking:stake.stake.cta")
                  : t("staking:stake.unstake.cta")}
              </Button>
            ) : (
              <Web3ConnectButton variant="sliderTabActive" size="large" />
            )}
          </Grid>
        }
      </Paper>
    </FormProvider>
  )
}
