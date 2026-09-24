import {
  buildBorrow,
  hasAcknowledgement,
  hasBlocker,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useBorrowAssessment,
  useMarketReserves,
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market-v2/react"
import {
  AssetInput,
  LoadingButton,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Address, parseUnits } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { useBorrowForm } from "@/modules/money-market-v2/actions/BorrowForm.form"
import { FindingsList } from "@/modules/money-market-v2/actions/FindingsList"
import { HealthFactorChange } from "@/modules/money-market-v2/actions/HealthFactorChange"
import { useActionPlanMutation } from "@/modules/money-market-v2/actions/useActionPlanMutation"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import { reserveAssetId } from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly asset: Address
  readonly onSubmitted?: () => void
}

const isAsset = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

const Divider = () => <Separator mx="var(--modal-content-inset)" />

export const BorrowForm: FC<Props> = ({ asset, onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { getAsset } = useAssets()

  const assetId = reserveAssetId(asset, market)
  const symbol = getAsset(assetId)?.symbol

  const { data: reserves } = useMarketReserves()
  const { data: summaries } = useReserveSummaries()
  const decimals =
    reserves?.reserves.find((r) => isAsset(r.underlyingAsset, asset))
      ?.decimals ?? 0
  const summary = summaries?.find((s) => isAsset(s.underlyingAsset, asset))

  // The assessment needs the amount before the form (whose schema needs the
  // assessment's max) exists, so the field's value is mirrored here. For
  // Hollar the assessment joins in the facilitator bucket itself.
  const [amount, setAmount] = useState("")
  const assessment = useBorrowAssessment({ user, asset, amount })
  const current = useAccountSummary(user)

  const {
    control,
    formState,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
  } = useBorrowForm(assessment.data, decimals)

  const max = assessment.data?.max
  useEffect(() => {
    if (getValues("amount")) trigger("amount")
  }, [max, getValues, trigger])

  const mutation = useActionPlanMutation()

  const findings = assessment.data?.findings ?? []
  const isAssessing = !!user && assessment.isPending

  const onSubmit = handleSubmit(({ amount }) => {
    if (!user) return

    const plan = buildBorrow({
      market,
      asset,
      amount: parseUnits(amount, decimals),
      onBehalfOf: user,
    })
    const toastParams = { amount, symbol }

    mutation.mutate({
      plan,
      toasts: {
        submitted: t("borrow.toast.submitted", toastParams),
        success: t("borrow.toast.success", toastParams),
      },
      activity: "borrow",
    })
    onSubmitted?.()
  })

  const canSubmit =
    formState.isValid &&
    !hasBlocker(findings) &&
    (!hasAcknowledgement(findings) || watch("acknowledged"))

  return (
    <form onSubmit={onSubmit}>
      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <AssetInput
            sx={{ pt: 0 }}
            symbol={symbol}
            selectedAssetIcon={<AssetLogo id={assetId} size="medium" />}
            modalDisabled
            balanceLabel={t("available")}
            maxBalance={max}
            maxButtonBalance={max}
            maxBalanceLoading={isAssessing}
            value={field.value}
            onChange={(value) => {
              field.onChange(value)
              setAmount(value)
              setValue("acknowledged", false)
            }}
            displayValue={t("common:currency", {
              value: Big(summary?.priceInUsd ?? "0")
                .times(amount || "0")
                .toString(),
            })}
            amountError={fieldState.error?.message}
          />
        )}
      />
      <Summary withLeadingSeparator separator={<Divider />}>
        <SummaryRow
          label={t("summary.borrowApy")}
          content={t("common:percent", {
            value: Number(summary?.variableBorrowApy ?? 0) * 100,
          })}
          loading={!summary}
        />
        <SummaryRow
          label={t("summary.incentives")}
          content={
            summary?.borrowIncentives.length ? (
              <Stack align="flex-end">
                {summary.borrowIncentives.map((incentive) => (
                  <Text key={incentive.rewardTokenAddress} fs="p5" fw={500}>
                    {t("common:percent", {
                      value: Number(incentive.rewardApr) * 100,
                      suffix: ` ${incentive.rewardTokenSymbol}`,
                    })}
                  </Text>
                ))}
              </Stack>
            ) : (
              "-"
            )
          }
          loading={!summary}
        />
        <SummaryRow
          label={t("summary.healthFactor")}
          content={
            <HealthFactorChange
              current={current.data?.account.healthFactor}
              projected={assessment.data?.projection.account.healthFactor}
            />
          }
          loading={isAssessing || current.isPending}
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
          {t("borrow")}
        </LoadingButton>
      </Stack>
    </form>
  )
}
