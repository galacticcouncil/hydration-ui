import {
  buildSetUserEMode,
  eModeCategories,
  hasAcknowledgement,
  hasBlocker,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useEModeAssessment,
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market-v2/react"
import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  LoadingButton,
  Select,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode, useEffect, useMemo } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useEModeForm } from "@/modules/money-market-v2/actions/EModeForm.form"
import { FindingsList } from "@/modules/money-market-v2/actions/FindingsList"
import { HealthFactorChange } from "@/modules/money-market-v2/actions/HealthFactorChange"
import { useActionPlanMutation } from "@/modules/money-market-v2/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market-v2/hooks"

type Props = {
  readonly onSubmitted?: () => void
}

/** Category 0 is "no e-mode". */
const NO_EMODE = 0

const Divider = () => <Separator mx="var(--modal-content-inset)" />

const Change: FC<{ current: ReactNode; next: ReactNode }> = ({
  current,
  next,
}) => (
  <Flex gap="s" align="center">
    <Text fs="p5" fw={500}>
      {current}
    </Text>
    <Icon component={ArrowRight} size="s" />
    <Text fs="p5" fw={500}>
      {next}
    </Text>
  </Flex>
)

export const EModeForm: FC<Props> = ({ onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()

  const summaries = useReserveSummaries()
  const current = useAccountSummary(user)
  const currentId = current.data?.account.eModeCategoryId

  const categories = useMemo(
    () => eModeCategories(summaries.data ?? []),
    [summaries.data],
  )
  const labelOf = (id: number) =>
    categories.find((c) => c.id === id)?.label ?? t("emode.none")

  const options = [
    { key: String(NO_EMODE), label: t("emode.none") },
    ...categories.map((c) => ({ key: String(c.id), label: c.label })),
  ].filter((o) => Number(o.key) !== currentId)

  const { control, formState, handleSubmit, setValue, watch } = useEModeForm()
  const watchedId = watch("categoryId")
  const firstId = options[0] ? Number(options[0].key) : undefined
  const categoryId = options.some((o) => Number(o.key) === watchedId)
    ? watchedId
    : (firstId ?? watchedId)

  useEffect(() => {
    if (categoryId !== watchedId) {
      setValue("categoryId", categoryId, { shouldValidate: true })
    }
  }, [categoryId, watchedId, setValue])

  const assessment = useEModeAssessment({ user, categoryId })
  const mutation = useActionPlanMutation()

  const findings = assessment.data?.findings ?? []
  const isAssessing = !!user && assessment.isPending
  const isCurrentLoading = !!user && current.isPending
  const selected = categories.find((c) => c.id === categoryId)

  const onSubmit = handleSubmit((values) => {
    if (!user) return

    const category = labelOf(values.categoryId)

    mutation.mutate({
      plan: buildSetUserEMode({ market, categoryId: values.categoryId }),
      toasts: {
        submitted: t("emode.toast.submitted", { category }),
        success: t("emode.toast.success", { category }),
      },
    })
    onSubmitted?.()
  })

  const canSubmit =
    formState.isValid &&
    !hasBlocker(findings) &&
    (!hasAcknowledgement(findings) || watch("acknowledged"))

  const submitLabel =
    currentId === NO_EMODE
      ? t("emode.enable")
      : categoryId === NO_EMODE
        ? t("emode.disable")
        : t("emode.switch")

  const percent = (value: string | undefined) =>
    t("common:percent", { value: Number(value ?? 0) * 100 })

  return (
    <form onSubmit={onSubmit}>
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <Select
            label={t("emode.category")}
            items={options}
            value={String(field.value)}
            onValueChange={(value) => {
              field.onChange(Number(value))
              setValue("acknowledged", false)
            }}
          />
        )}
      />
      <Summary withLeadingSeparator separator={<Divider />}>
        <SummaryRow
          label={t("summary.category")}
          content={
            <Change
              current={labelOf(currentId ?? NO_EMODE)}
              next={labelOf(categoryId)}
            />
          }
          loading={isCurrentLoading || summaries.isPending}
        />
        <SummaryRow
          label={t("summary.availableAssets")}
          content={
            selected
              ? selected.assets.map((a) => a.symbol).join(", ")
              : t("emode.allAssets")
          }
          loading={summaries.isPending}
        />
        <SummaryRow
          label={t("summary.maxLtv")}
          content={
            <Change
              current={percent(current.data?.account.currentLoanToValue)}
              next={percent(
                assessment.data?.projection.account.currentLoanToValue,
              )}
            />
          }
          loading={isAssessing || isCurrentLoading}
        />
        <SummaryRow
          label={t("summary.healthFactor")}
          content={
            <HealthFactorChange
              current={current.data?.account.healthFactor}
              projected={assessment.data?.projection.account.healthFactor}
            />
          }
          loading={isAssessing || isCurrentLoading}
        />
      </Summary>
      <Divider />
      <Stack gap="base" pt="base">
        <Controller
          control={control}
          name="acknowledged"
          render={({ field }) => (
            <FindingsList
              findings={findings}
              acknowledged={field.value}
              onAcknowledgedChange={field.onChange}
            />
          )}
        />
        <LoadingButton
          type="submit"
          size="large"
          width="100%"
          isLoading={isAssessing || mutation.isPending}
          disabled={!canSubmit}
        >
          {submitLabel}
        </LoadingButton>
      </Stack>
    </form>
  )
}
