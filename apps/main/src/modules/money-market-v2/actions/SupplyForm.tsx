import {
  buildSupply,
  hasAcknowledgement,
  hasBlocker,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useMarketReserves,
  useMoneyMarket,
  useReserveSummaries,
  useSupplyAssessment,
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
import { FC, useEffect, useMemo, useState } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Address, parseUnits } from "viem"

import { useAccountBalances } from "@/api/balances"
import { AssetLogo } from "@/components/AssetLogo"
import { FindingsList } from "@/modules/money-market-v2/actions/FindingsList"
import { HealthFactorChange } from "@/modules/money-market-v2/actions/HealthFactorChange"
import { useSupplyForm } from "@/modules/money-market-v2/actions/SupplyForm.form"
import { useActionPlanMutation } from "@/modules/money-market-v2/actions/useActionPlanMutation"
import { useSpendable } from "@/modules/money-market-v2/actions/useSpendable"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import { reserveAssetId } from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly asset: Address
  readonly onSubmitted?: () => void
}

const isAsset = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

const Divider = () => <Separator mx="var(--modal-content-inset)" />

export const SupplyForm: FC<Props> = ({ asset, onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { getAsset } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  const assetId = reserveAssetId(asset, market)
  const symbol = getAsset(assetId)?.symbol

  const { data: reserves } = useMarketReserves()
  const { data: summaries } = useReserveSummaries()
  const decimals =
    reserves?.reserves.find((r) => isAsset(r.underlyingAsset, asset))
      ?.decimals ?? 0
  const summary = summaries?.find((s) => isAsset(s.underlyingAsset, asset))

  const transferable = getTransferableBalance(assetId)
  const spendablePlan = useMemo(
    () =>
      user
        ? buildSupply({
            market,
            asset,
            amount: transferable,
            onBehalfOf: user,
          })
        : null,
    [market, asset, transferable, user],
  )
  const { spendable, isLoading: isSpendableLoading } = useSpendable({
    assetId,
    plan: spendablePlan,
  })

  // The assessment needs the amount before the form (whose schema needs the
  // assessment's max) exists, so the field's value is mirrored here.
  const [amount, setAmount] = useState("")
  const assessment = useSupplyAssessment({ user, asset, amount, spendable })
  const current = useAccountSummary(user)

  const {
    control,
    formState,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
  } = useSupplyForm(assessment.data, decimals)

  const max = assessment.data?.max
  useEffect(() => {
    if (getValues("amount")) trigger("amount")
  }, [max, getValues, trigger])

  const mutation = useActionPlanMutation()

  const findings = assessment.data?.findings ?? []
  const isAssessing = !!user && (assessment.isPending || isSpendableLoading)
  const projectedPosition = assessment.data?.projection.positions.find((p) =>
    isAsset(p.underlyingAsset, asset),
  )

  const onSubmit = handleSubmit(({ amount }) => {
    if (!user) return

    const plan = buildSupply({
      market,
      asset,
      amount: parseUnits(amount, decimals),
      onBehalfOf: user,
      isolationJoin: assessment.data?.isolationJoin,
    })
    const toastParams = { amount, symbol }

    mutation.mutate({
      plan,
      toasts: {
        submitted: t("supply.toast.submitted", toastParams),
        success: t("supply.toast.success", toastParams),
      },
      activity: "lend",
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
            maxBalanceLoading={isSpendableLoading}
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
          label={t("summary.supplyApy")}
          content={t("common:percent", {
            value: Number(summary?.supplyApy ?? 0) * 100,
          })}
          loading={!summary}
        />
        <SummaryRow
          label={t("summary.incentives")}
          content={
            summary?.supplyIncentives.length ? (
              <Stack align="flex-end">
                {summary.supplyIncentives.map((incentive) => (
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
          label={t("summary.collateral")}
          content={
            projectedPosition?.usageAsCollateralEnabledOnUser
              ? t("collateral.yes")
              : t("collateral.no")
          }
          loading={isAssessing}
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
          {t("supply")}
        </LoadingButton>
      </Stack>
    </form>
  )
}
