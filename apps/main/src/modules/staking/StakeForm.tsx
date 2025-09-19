import {
  Button,
  Flex,
  Grid,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { useStakeForm } from "@/modules/staking/Stake.form"
import { useStake } from "@/modules/staking/Stake.stake"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly positionId: bigint
  readonly staked: string
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
  const { form, minStake } = useStakeForm(balance, staked)

  const stakeMutation = useStake(positionId, votes, votesSuccess, () =>
    form.reset(),
  )

  const submitForm = form.handleSubmit((values) =>
    stakeMutation.mutate(values.amount),
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
        <Flex
          px={getTokenPx("containers.paddings.primary")}
          py={getTokenPx("containers.paddings.quint")}
          justify="space-between"
          align="center"
        >
          <Text fs="p5" lh={1.4} color={getToken("text.medium")}>
            {t("staking:stake.stake.minimum")}
          </Text>
          <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
            {t("currency", { value: minStake, symbol: native.symbol })}
          </Text>
        </Flex>
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
