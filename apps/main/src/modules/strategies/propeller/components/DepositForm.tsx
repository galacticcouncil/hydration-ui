import { Scale, ShieldCheck } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  Flex,
  Icon,
  LoadingButton,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  SummaryRowValue,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { type ComponentType, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isTruthy } from "remeda"
import { formatUnits } from "viem"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useDepositForm } from "@/modules/strategies/propeller/components/DepositForm.form"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { depositCapacityQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useDeposit } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { percentageOf, scaleHuman } from "@/utils/formatting"

type Props = {
  initialVault: PropellerVaultConfig
  lockAsset?: boolean
  onSuccess?: () => void
  onVaultChange?: (vault: PropellerVaultConfig) => void
}

export const DepositForm = ({
  initialVault,
  lockAsset,
  onSuccess,
  onVaultChange,
}: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const rpc = useRpcProvider()
  const { getAsset, getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const [vault, setVault] = useState(initialVault)

  const asset = getAssetWithFallback(vault.assetId)
  const assets = PROPELLER_VAULTS.map((v) => getAsset(v.assetId)).filter(
    isTruthy,
  )

  const { data: capacity, isError: capacityError } = useQuery(
    depositCapacityQuery(rpc, vault),
  )
  const deposit = useDeposit(vault, { onSuccess })
  const unavailable =
    !rpc.isReady || !capacity || capacityError || !capacity.ready
  const maximum = formatUnits(capacity?.maximum ?? 0n, asset.decimals)
  const atCapacity = capacity?.maximum === 0n
  const isPaused = capacity?.paused ?? false

  const balance = scaleHuman(
    getTransferableBalance(vault.assetId),
    asset.decimals,
  )
  const maxButtonBalance = Big(balance).gt(maximum) ? maximum : balance

  const form = useDepositForm({
    maxBalance: balance,
    maxCapacity: maximum,
    decimals: asset.decimals,
  })
  const { control, handleSubmit, formState, reset } = form

  const canSubmit =
    formState.isValid &&
    !deposit.isPending &&
    !isPaused &&
    !atCapacity &&
    !unavailable

  const ctaLabel = (() => {
    if (unavailable) return t("deposit.cta.unavailable")
    if (isPaused) return t("deposit.cta.paused")
    if (atCapacity) return t("deposit.cta.full")
    return t("deposit.cta.deposit")
  })()

  // Loading also counts as unavailable; only explain it once the read settled.
  const blockedDescription = (() => {
    if (capacityError) return t("deposit.alert.unavailable")
    if (capacity?.ready === false) return t("deposit.alert.notReady")
    if (unavailable) return undefined
    if (isPaused) return t("deposit.alert.paused")
    if (atCapacity) return t("deposit.alert.full")
  })()

  const onSelectAsset = (selected: TAssetData) => {
    const next = PROPELLER_VAULTS.find((v) => v.assetId === selected.id)
    if (!next || next.vaultAddress === vault.vaultAddress) return
    setVault(next)
    deposit.reset()
    reset()
    onVaultChange?.(next)
  }

  const onSubmit = handleSubmit(({ amount }) => {
    if (!canSubmit) return
    deposit.mutate(amount)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Box py="l" width="100%">
              <AssetSelect
                label={t("common:asset")}
                assets={assets}
                selectedAsset={asset}
                setSelectedAsset={lockAsset ? undefined : onSelectAsset}
                value={field.value}
                onChange={field.onChange}
                balance={{
                  value: balance,
                  max: maxButtonBalance,
                  onMax: () => field.onChange(maxButtonBalance),
                  onPercentage: (percent) =>
                    field.onChange(
                      percentageOf(maxButtonBalance, percent, asset.decimals),
                    ),
                  isMaxDisabled: !(Number(maxButtonBalance) > 0),
                }}
                amountError={fieldState.error?.message}
              />
            </Box>
          )}
        />

        <Separator mx="-xl" />

        <Stack gap="l" py="xl">
          <BenefitCard
            icon={ShieldCheck}
            label={t("deposit.benefit.managedBorrowing")}
            description={t("deposit.benefit.managedBorrowingDescription")}
          />
          <BenefitCard
            icon={Scale}
            label={t("deposit.benefit.noImpermanentLoss")}
            description={t("deposit.benefit.noImpermanentLossDescription")}
          />
        </Stack>

        <Separator mx="-xl" />

        <Stack gap="l" pb="xl">
          <Summary separator={<Separator mx="-xl" />} withTrailingSeparator>
            {capacity && !unavailable && !atCapacity && (
              <SummaryRow
                label={t("strategy.remainingCapacity")}
                content={t("common:currency", {
                  value: maximum,
                  symbol: asset.symbol,
                })}
              />
            )}
            <SummaryRow
              label={t("deposit.deployment")}
              content={
                <Flex align="center" gap="xs">
                  <SummaryRowValue>
                    {t("deposit.deployment.gradual")}
                  </SummaryRowValue>
                  <Tooltip
                    text={
                      <Stack gap="base">
                        {(
                          t("deposit.executionDescription", {
                            returnObjects: true,
                          }) as string[]
                        ).map((line) => (
                          <Text key={line} fw={500} fs="p5">
                            {line}
                          </Text>
                        ))}
                      </Stack>
                    }
                  >
                    <TooltipIcon size="1em" />
                  </Tooltip>
                </Flex>
              }
            />
          </Summary>
          <Stack gap="base">
            <Alert variant="info" description={t("strategy.testnet")} />
            {blockedDescription && (
              <Alert
                variant="warning"
                title={ctaLabel}
                description={blockedDescription}
              />
            )}
            {deposit.isError && (
              <Alert variant="error" description={t("deposit.failed")} />
            )}
          </Stack>
          <Separator mx="-xl" />
          <AuthorizedAction size="large" width="100%">
            <LoadingButton
              type="submit"
              size="large"
              width="100%"
              isLoading={deposit.isPending}
              disabled={!canSubmit}
              disabledVariant="muted"
            >
              {ctaLabel}
            </LoadingButton>
          </AuthorizedAction>
        </Stack>
      </form>
    </FormProvider>
  )
}

const BenefitCard = ({
  icon,
  label,
  description,
}: {
  icon: ComponentType
  label: string
  description: string
}) => {
  const color = getToken("text.tint.quart")

  return (
    <Stack gap="s" align="flex-start">
      <Flex align="center" gap="s">
        <Icon component={icon} size="s" color={color} />
        <Text fs="p5" lh={1} fw={600} color={color}>
          {label}
        </Text>
      </Flex>
      <Text fs="p5" color={getToken("text.medium")}>
        {description}
      </Text>
    </Stack>
  )
}
