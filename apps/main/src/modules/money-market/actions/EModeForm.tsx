import {
  buildSetUserEMode,
  eModeCategories,
  hasAcknowledgement,
  hasBlocker,
} from "@galacticcouncil/money-market/core"
import {
  useAccountSummary,
  useEModeAssessment,
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market/react"
import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  LoadingButton,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode, useEffect, useMemo } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useEModeForm } from "@/modules/money-market/actions/EModeForm.form"
import { FindingsList } from "@/modules/money-market/actions/FindingsList"
import { HeaderSelect } from "@/modules/money-market/actions/HeaderSelect"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { useActionPlanMutation } from "@/modules/money-market/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useResolveReserveDisplay } from "@/modules/money-market/reserves/useReserveDisplay"

type Props = {
  readonly initialCategoryId?: number
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

export const EModeForm: FC<Props> = ({ initialCategoryId, onSubmitted }) => {
  const { t } = useTranslation(["borrow", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const resolveDisplay = useResolveReserveDisplay()

  const summaries = useReserveSummaries()
  const current = useAccountSummary(user)
  const currentId = current.data?.account.eModeCategoryId

  const categories = useMemo(
    () => eModeCategories(summaries.data ?? []),
    [summaries.data],
  )
  const labelOf = (id: number) =>
    categories.find((c) => c.id === id)?.label ?? t("emode.disabled")

  const options = [
    { key: String(NO_EMODE), label: t("emode.disabled") },
    ...categories.map((c) => ({ key: String(c.id), label: c.label })),
  ].filter((o) => Number(o.key) !== currentId)

  const { control, formState, handleSubmit, setValue, watch } =
    useEModeForm(initialCategoryId)
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
          <HeaderSelect
            label={t("emode.category")}
            options={options}
            value={String(field.value)}
            onChange={(value) => {
              field.onChange(Number(value))
              setValue("acknowledged", false)
            }}
          />
        )}
      />
      <Summary mt="xl" withLeadingSeparator separator={<Divider />}>
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
            selected ? (
              <AssetLogo
                size="small"
                id={selected.assets.map(
                  // a category lists its reserves without their name
                  (a) => resolveDisplay({ ...a, name: a.symbol }).logoId,
                )}
              />
            ) : (
              t("emode.allAssets")
            )
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
        {findings.length > 0 && (
          <Stack gap="base" py="base">
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
          </Stack>
        )}
      </Summary>
      <Divider />
      <Stack gap="base" pt="xl">
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
