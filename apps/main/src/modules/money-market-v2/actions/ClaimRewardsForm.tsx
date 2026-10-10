import {
  buildClaimAllRewards,
  buildClaimReward,
  hasBlocker,
} from "@galacticcouncil/money-market-v2/core"
import {
  useClaimableRewards,
  useClaimAssessment,
  useMoneyMarket,
  useUserIncentives,
} from "@galacticcouncil/money-market-v2/react"
import {
  Flex,
  Icon,
  LoadingButton,
  Separator,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { BadgeDollarSign, DollarSign } from "lucide-react"
import { FC, useEffect } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  ClaimRewardsFormValues,
  useClaimRewardsForm,
} from "@/modules/money-market-v2/actions/ClaimRewardsForm.form"
import { FindingsList } from "@/modules/money-market-v2/actions/FindingsList"
import {
  HeaderSelect,
  HeaderSelectOption,
} from "@/modules/money-market-v2/actions/HeaderSelect"
import { useActionPlanMutation } from "@/modules/money-market-v2/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import { reserveAssetId } from "@/modules/money-market-v2/reserves"

type Props = {
  readonly onSubmitted?: () => void
}

type Reward = ClaimRewardsFormValues["reward"]

const ALL = "all"

const Divider = () => <Separator mx="var(--modal-content-inset)" />

export const ClaimRewardsForm: FC<Props> = ({ onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()

  const claimable = useClaimableRewards(user)
  const incentives = useUserIncentives(user)
  const rewards = claimable.data

  const logo = (address: string) => (
    <AssetLogo id={reserveAssetId(address, market)} size="medium" />
  )

  const options: HeaderSelectOption<Reward>[] = [
    {
      key: ALL,
      label: t("claim.allRewards"),
      icon: (
        <Icon
          size="xl"
          color={getToken("accents.info.onPrimary")}
          component={BadgeDollarSign}
        />
      ),
    },
    ...(rewards ?? []).map((r) => ({
      key: r.rewardTokenAddress,
      label: r.rewardTokenSymbol,
      icon: logo(r.rewardTokenAddress),
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

  const hasMultipleRewards = (rewards?.length ?? 0) > 1
  const rows = (rewards ?? []).filter(
    (r) => reward === ALL || r.rewardTokenAddress === reward,
  )
  const [row] = rows
  const totalUsd = rows.reduce((sum, r) => sum.plus(r.amountUsd), Big(0))

  return (
    <form onSubmit={onSubmit}>
      {hasMultipleRewards && (
        <>
          <Controller
            control={control}
            name="reward"
            render={({ field }) => (
              <HeaderSelect
                mb="xl"
                label={t("claim.rewardsToClaim")}
                options={options}
                value={field.value ?? reward}
                onChange={field.onChange}
              />
            )}
          />
          <Divider />
        </>
      )}
      {rows.length > 0 && (
        <TableContainer
          mt={hasMultipleRewards ? "xl" : undefined}
          mb="xl"
          borderStyle="solid"
          borderWidth={1}
          borderColor={getToken("details.separators")}
          borderRadius="m"
        >
          <Table size="small">
            <TableHeader>
              <TableRow>
                <TableHead>{t("common:asset")}</TableHead>
                <TableHead sx={{ textAlign: "end" }}>
                  {t("common:balance")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.rewardTokenAddress}>
                  <TableCell>
                    <Flex align="center" gap="s">
                      {logo(r.rewardTokenAddress)}
                      <Text fs="p3" fw={600}>
                        {r.rewardTokenSymbol}
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction="column" align="flex-end">
                      <Text fs="p4" fw={500}>
                        {t("common:currency", {
                          value: r.amount,
                          symbol: r.rewardTokenSymbol,
                        })}
                      </Text>
                      <Text fs="p5" lh={1} color={getToken("text.medium")}>
                        {t("common:currency", { value: r.amountUsd })}
                      </Text>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length > 1 && (
                <TableRow>
                  <TableCell>
                    <Flex align="center" gap="s">
                      <Icon
                        size="xl"
                        component={DollarSign}
                        sx={{ scale: 0.75 }}
                      />
                      <Text fs="p3" fw={600}>
                        {t("summary.totalWorth")}
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Text fs="p3" fw={600} align="right">
                      {t("common:currency", { value: totalUsd.toString() })}
                    </Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
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
          {reward !== ALL && row
            ? t("claim.symbol", { symbol: row.rewardTokenSymbol })
            : t("claim.all")}
        </LoadingButton>
      </Stack>
    </form>
  )
}
