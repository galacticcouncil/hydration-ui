import {
  buildClaimAllRewards,
  buildClaimReward,
  hasBlocker,
} from "@galacticcouncil/money-market-v2/core"
import {
  useClaimableRewards,
  useClaimAssessment,
  useUserIncentives,
} from "@galacticcouncil/money-market-v2/react"
import {
  LoadingButton,
  Select,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useEffect } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  ClaimRewardsFormValues,
  useClaimRewardsForm,
} from "@/modules/money-market-v2/actions/ClaimRewardsForm.form"
import { FindingsList } from "@/modules/money-market-v2/actions/FindingsList"
import { useActionPlanMutation } from "@/modules/money-market-v2/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market-v2/hooks"

type Props = {
  readonly onSubmitted?: () => void
}

type Reward = ClaimRewardsFormValues["reward"]

const ALL = "all"

const Divider = () => <Separator mx="var(--modal-content-inset)" />

export const ClaimRewardsForm: FC<Props> = ({ onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const user = useUserAddress()

  const claimable = useClaimableRewards(user)
  const incentives = useUserIncentives(user)
  const rewards = claimable.data

  const options: { key: Reward; label: string }[] = [
    { key: ALL, label: t("claim.allRewards") },
    ...(rewards ?? []).map((r) => ({
      key: r.rewardTokenAddress,
      label: r.rewardTokenSymbol,
    })),
  ]
  const defaultReward: Reward =
    rewards?.length === 1 && rewards[0] ? rewards[0].rewardTokenAddress : ALL

  const { control, formState, handleSubmit, setValue, watch } =
    useClaimRewardsForm()
  const watchedReward = watch("reward")
  const reward = options.some((o) => o.key === watchedReward)
    ? watchedReward
    : defaultReward

  useEffect(() => {
    if (rewards && reward !== watchedReward) {
      setValue("reward", reward, { shouldValidate: true })
    }
  }, [rewards, reward, watchedReward, setValue])

  const assessment = useClaimAssessment({ user, reward })
  const mutation = useActionPlanMutation()

  const findings = assessment.data?.findings ?? []
  const selected = assessment.data?.rewards ?? []
  const isAssessing = !!user && (assessment.isPending || incentives.isPending)

  const onSubmit = handleSubmit((values) => {
    const userIncentives = incentives.data
    const [single] = selected
    if (!user || !userIncentives) return

    const plan =
      values.reward !== ALL && single
        ? buildClaimReward({ reward: single, userIncentives, to: user })
        : buildClaimAllRewards({ userIncentives, to: user })
    const toastParams = { value: assessment.data?.totalUsd ?? "0" }

    mutation.mutate({
      plan,
      toasts: {
        submitted: t("claim.toast.submitted", toastParams),
        success: t("claim.toast.success", toastParams),
      },
    })
    onSubmitted?.()
  })

  const canSubmit = formState.isValid && !hasBlocker(findings)

  return (
    <form onSubmit={onSubmit}>
      <Controller
        control={control}
        name="reward"
        render={({ field }) => (
          <Select
            label={t("claim.reward")}
            items={options}
            value={field.value ?? reward}
            onValueChange={field.onChange}
          />
        )}
      />
      <Summary withLeadingSeparator separator={<Divider />}>
        {selected.map((r) => (
          <SummaryRow
            key={r.rewardTokenAddress}
            label={r.rewardTokenSymbol}
            content={
              <Stack align="flex-end">
                <Text fs="p5" fw={500}>
                  {t("common:currency", {
                    value: r.amount,
                    symbol: r.rewardTokenSymbol,
                  })}
                </Text>
                <Text fs="p6" color={getToken("text.medium")}>
                  {t("common:currency", { value: r.amountUsd })}
                </Text>
              </Stack>
            }
            loading={isAssessing}
          />
        ))}
        {selected.length > 1 && (
          <SummaryRow
            label={t("summary.totalWorth")}
            content={t("common:currency", {
              value: assessment.data?.totalUsd ?? "0",
            })}
            loading={isAssessing}
          />
        )}
      </Summary>
      <Divider />
      <Stack gap="base" pt="base">
        <FindingsList findings={findings} />
        <LoadingButton
          type="submit"
          size="large"
          width="100%"
          isLoading={isAssessing || mutation.isPending}
          disabled={!canSubmit}
        >
          {t("claim")}
        </LoadingButton>
      </Stack>
    </form>
  )
}
