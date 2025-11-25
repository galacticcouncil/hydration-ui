import {
  Button,
  Grid,
  Separator,
  Summary,
  SummaryRow,
  SummaryRowLabel,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"

import { TAccountVote } from "@/api/democracy"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { useStakeForm } from "@/modules/staking/Stake.form"
import { useStake } from "@/modules/staking/Stake.stake"
import { useIncreaseStake } from "@/modules/staking/Stake.utils"
import { useAssets } from "@/providers/assetsProvider"
import { toBigInt } from "@/utils/formatting"

type Props = {
  readonly positionId: bigint
  readonly staked: string | undefined
  readonly votes: ReadonlyArray<TAccountVote>
  readonly votesSuccess: boolean
  readonly balance: string
  readonly isLoading: boolean
}

export const StakeForm: FC<Props> = ({
  positionId,
  staked,
  votes,
  votesSuccess,
  balance,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { account } = useAccount()

  const { native } = useAssets()
  const { form, minStake } = useStakeForm(balance, staked || "0")

  const stakeMutation = useStake(positionId, votes, votesSuccess, () =>
    form.reset(),
  )

  const submitForm = form.handleSubmit((values) =>
    stakeMutation.mutate(values.amount),
  )

  const amount = form.watch("amount")
  const { diffDays, update } = useIncreaseStake()

  useDebounce(
    () => {
      update(
        staked ? "value" : "stakeValue",
        amount ? toBigInt(amount, native.decimals) : undefined,
      )
    },
    500,
    [amount, staked],
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={submitForm}>
        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <AssetSelect
              sx={{ px: getTokenPx("containers.paddings.primary") }}
              label={t("staking:stake.stake.amount")}
              assets={[]}
              selectedAsset={native}
              modalDisabled
              maxBalance={balance}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Separator />
        <Summary
          px={getTokenPx("containers.paddings.primary")}
          separator={<Separator mx={-20} />}
        >
          <SummaryRow
            sx={{ my: getTokenPx("scales.paddings.s") }}
            label={t("staking:stake.stake.minimum")}
            content={t("currency", {
              value: minStake,
              symbol: native.symbol,
            })}
          />
          {diffDays && diffDays !== "0" && (
            <SummaryRow
              sx={{ my: getTokenPx("scales.paddings.s") }}
              label={
                <SummaryRowLabel color={getToken("colors.azureBlue.400")}>
                  {t("staking:stake.stake.increasedBy")}
                </SummaryRowLabel>
              }
              content={
                <SummaryRowValue color={getToken("colors.azureBlue.400")}>
                  ≈{" "}
                  {t("day", {
                    count: +diffDays,
                  })}
                </SummaryRowValue>
              }
            />
          )}
        </Summary>
        <Separator />
        {
          <Grid
            px={getTokenPx("containers.paddings.primary")}
            py={getTokenPx("containers.paddings.primary")}
          >
            {account ? (
              <Button
                type="submit"
                size="large"
                disabled={
                  isLoading ||
                  form.formState.isSubmitting ||
                  !form.formState.isValid
                }
              >
                {t("staking:stake.stake.cta")}
              </Button>
            ) : (
              <Web3ConnectButton variant="sliderTabActive" size="large" />
            )}
          </Grid>
        }
      </form>
    </FormProvider>
  )
}
