import {
  buildWithdraw,
  hasAcknowledgement,
  hasBlocker,
  MAX_UINT_AMOUNT,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useMarketReserves,
  useMoneyMarket,
  useReserveSummaries,
  useWithdrawAssessment,
} from "@galacticcouncil/money-market-v2/react"
import {
  AssetInput,
  LoadingButton,
  Separator,
  Stack,
  Summary,
  SummaryRow,
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
import { useActionPlanMutation } from "@/modules/money-market-v2/actions/useActionPlanMutation"
import { useSpendable } from "@/modules/money-market-v2/actions/useSpendable"
import { useWithdrawForm } from "@/modules/money-market-v2/actions/WithdrawForm.form"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import { reserveAssetId } from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly asset: Address
  readonly onSubmitted?: () => void
}

const isAsset = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

const Divider = () => <Separator mx="var(--modal-content-inset)" />

export const WithdrawForm: FC<Props> = ({ asset, onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { getAsset, getRelatedAToken } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  const assetId = reserveAssetId(asset, market)
  const symbol = getAsset(assetId)?.symbol
  // The aToken is what leaves the wallet, so it is what the fee is weighed
  // against.
  const aTokenId = getRelatedAToken(assetId)?.id

  const { data: reserves } = useMarketReserves()
  const { data: summaries } = useReserveSummaries()
  const decimals =
    reserves?.reserves.find((r) => isAsset(r.underlyingAsset, asset))
      ?.decimals ?? 0
  const summary = summaries?.find((s) => isAsset(s.underlyingAsset, asset))

  const transferable = aTokenId ? getTransferableBalance(aTokenId) : 0n
  const spendablePlan = useMemo(
    () =>
      user
        ? buildWithdraw({ market, asset, amount: transferable, to: user })
        : null,
    [market, asset, transferable, user],
  )
  const { spendable, isLoading: isSpendableLoading } = useSpendable({
    assetId: aTokenId,
    plan: spendablePlan,
  })

  // The assessment needs the amount before the form (whose schema needs the
  // assessment's max) exists, so the field's value is mirrored here.
  const [amount, setAmount] = useState("")
  const assessment = useWithdrawAssessment({ user, asset, amount, spendable })
  const current = useAccountSummary(user)

  const {
    control,
    formState,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
  } = useWithdrawForm(assessment.data, decimals)

  const max = assessment.data?.max
  useEffect(() => {
    if (max !== undefined && getValues("isMax")) {
      setValue("amount", max)
      setAmount(max)
    }
    if (getValues("amount")) trigger("amount")
  }, [max, getValues, setValue, trigger])

  const mutation = useActionPlanMutation()

  const findings = assessment.data?.findings ?? []
  const isAssessing = !!user && (assessment.isPending || isSpendableLoading)
  const projectedPosition = assessment.data?.projection.positions.find((p) =>
    isAsset(p.underlyingAsset, asset),
  )

  const onSubmit = handleSubmit(({ amount, isMax }) => {
    if (!user) return

    const plan = buildWithdraw({
      market,
      asset,
      amount:
        isMax && assessment.data?.maxClearsPosition
          ? MAX_UINT_AMOUNT
          : parseUnits(amount, decimals),
      to: user,
    })
    const toastParams = { amount, symbol }

    mutation.mutate({
      plan,
      toasts: {
        submitted: t("withdraw.toast.submitted", toastParams),
        success: t("withdraw.toast.success", toastParams),
      },
      activity: "withdraw",
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
              setValue("isMax", false)
              setValue("acknowledged", false)
            }}
            onMaxButtonClick={() => setValue("isMax", true)}
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
          label={t("summary.remainingSupply")}
          content={t("common:currency", {
            value: projectedPosition?.underlyingBalance ?? "0",
            symbol,
          })}
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
          {t("withdraw")}
        </LoadingButton>
      </Stack>
    </form>
  )
}
