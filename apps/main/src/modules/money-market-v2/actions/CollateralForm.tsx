import {
  DCA_OPEN_STATUSES,
  dcaSchedulesQuery,
} from "@galacticcouncil/indexer/neckwork"
import {
  buildSetUsageAsCollateral,
  hasAcknowledgement,
  hasBlocker,
} from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useCollateralAssessment,
  useMoneyMarket,
} from "@galacticcouncil/money-market-v2/react"
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
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { neckworkClient } from "@/api/neckwork"
import { AssetLogo } from "@/components/AssetLogo"
import { useCollateralForm } from "@/modules/money-market-v2/actions/CollateralForm.form"
import {
  AppFinding,
  FindingsList,
} from "@/modules/money-market-v2/actions/FindingsList"
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

/**
 * Whether the connected account runs an open-budget DCA spending `assetId`.
 * Once the asset is collateral such an order keeps drawing it down, which v2
 * cannot see, so the app asks for acknowledgement itself.
 */
const useHasOpenBudgetDca = (assetId: string, enabled: boolean) => {
  const { account } = useAccount()
  const owner = safeConvertSS58toPublicKey(account?.address ?? "")

  const { data } = useQuery({
    ...dcaSchedulesQuery(neckworkClient, {
      owner,
      statuses: DCA_OPEN_STATUSES,
      assetIds: [assetId],
      page: 0,
      pageSize: 200,
    }),
    enabled: enabled && !!owner,
  })

  return !!data?.items.some(
    (schedule) => schedule.budget === "0" && schedule.assetIn === assetId,
  )
}

export const CollateralForm: FC<Props> = ({ asset, onSubmitted }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { getAsset } = useAssets()

  const assetId = reserveAssetId(asset, market)
  const symbol = getAsset(assetId)?.symbol

  const assessment = useCollateralAssessment({ user, asset })
  const current = useAccountSummary(user)

  const enable = assessment.data?.enable ?? false
  const hasOpenBudgetDca = useHasOpenBudgetDca(assetId, enable)

  const { control, formState, handleSubmit, watch } = useCollateralForm()

  const mutation = useActionPlanMutation()

  const findings: AppFinding[] = [
    ...(assessment.data?.findings ?? []),
    ...(enable && hasOpenBudgetDca
      ? [
          {
            kind: "acknowledgement" as const,
            code: "openDca" as const,
            params: {},
          },
        ]
      : []),
  ]
  const isAssessing = !!user && assessment.isPending
  const position = current.data?.positions.find((p) =>
    isAsset(p.underlyingAsset, asset),
  )

  const onSubmit = handleSubmit(() => {
    if (!user) return

    const plan = buildSetUsageAsCollateral({
      market,
      asset,
      useAsCollateral: enable,
    })
    const key = enable ? "enable" : "disable"

    mutation.mutate({
      plan,
      toasts: {
        submitted: t(`collateral.${key}.toast.submitted`, { symbol }),
        success: t(`collateral.${key}.toast.success`, { symbol }),
      },
    })
    onSubmitted?.()
  })

  const canSubmit =
    formState.isValid &&
    !hasBlocker(findings) &&
    (!hasAcknowledgement(findings) || watch("acknowledged"))

  const collateralStatus = (enabled: boolean) =>
    enabled ? t("collateral.enabled") : t("collateral.disabled")

  return (
    <form onSubmit={onSubmit}>
      <Summary separator={<Divider />}>
        <SummaryRow
          label={
            <Flex gap="s" align="center">
              <AssetLogo id={assetId} size="small" />
              <Text fs="p5" fw={500}>
                {symbol}
              </Text>
            </Flex>
          }
          content={t("common:currency", {
            value: position?.underlyingBalance ?? "0",
            symbol,
          })}
          loading={!!user && current.isPending}
        />
        <SummaryRow
          label={t("summary.collateral")}
          content={
            <Flex gap="s" align="center">
              <Text fs="p5" fw={500}>
                {collateralStatus(!enable)}
              </Text>
              <Icon component={ArrowRight} size="s" />
              <Text fs="p5" fw={500}>
                {collateralStatus(enable)}
              </Text>
            </Flex>
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
          {enable ? t("collateral.enable") : t("collateral.disable")}
        </LoadingButton>
      </Stack>
    </form>
  )
}
