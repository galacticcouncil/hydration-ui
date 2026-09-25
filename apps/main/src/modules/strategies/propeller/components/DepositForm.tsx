import { Scale, ShieldCheck } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  LoadingButton,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { type ComponentType, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isTruthy } from "remeda"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useDepositForm } from "@/modules/strategies/propeller/components/DepositForm.form"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { remainingCapacity } from "@/modules/strategies/propeller/hooks/usePropellerVaults"
import { vaultStatsQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useDeposit } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

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

  const { data: stats } = useQuery(vaultStatsQuery(rpc, vault, asset.decimals))
  const deposit = useDeposit(vault, { onSuccess })

  const capacityKnown = !!stats && stats.tvlCap > 0
  const { remaining } = remainingCapacity(
    stats?.totalAssets ?? 0,
    stats?.tvlCap ?? 0,
  )
  const atCapacity = capacityKnown && remaining <= 0
  const isPaused = !!stats && (stats.depositsPaused || stats.paused)

  const balance = scaleHuman(
    getTransferableBalance(vault.assetId),
    asset.decimals,
  )
  const maxButtonBalance =
    capacityKnown && Number(balance) > remaining
      ? remaining.toString()
      : balance

  const form = useDepositForm({
    maxBalance: balance,
    maxCapacity: capacityKnown ? remaining : Number.POSITIVE_INFINITY,
  })
  const { control, handleSubmit, formState, reset } = form

  const canSubmit =
    formState.isValid && !deposit.isPending && !isPaused && !atCapacity

  const ctaLabel = (() => {
    if (isPaused) return t("deposit.cta.paused")
    if (atCapacity) return t("deposit.cta.exceedsCapacity")
    return t("deposit.cta.deposit")
  })()

  const onSelectAsset = (selected: TAssetData) => {
    const next = PROPELLER_VAULTS.find((v) => v.assetId === selected.id)
    if (!next || next.vaultAddress === vault.vaultAddress) return
    setVault(next)
    reset()
    onVaultChange?.(next)
  }

  const onSubmit = handleSubmit(({ amount }) => {
    deposit.mutate(amount)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Box>
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <AssetSelect
                label={t("common:asset")}
                assets={assets}
                selectedAsset={asset}
                setSelectedAsset={lockAsset ? undefined : onSelectAsset}
                value={field.value}
                onChange={field.onChange}
                maxBalance={balance}
                maxButtonBalance={maxButtonBalance}
                amountError={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Separator mx="-xl" />

        <Stack gap="l" py="xl">
          <BenefitCard
            icon={ShieldCheck}
            label={t("deposit.benefit.noLiquidations")}
            description={t("deposit.benefit.noLiquidationsDescription")}
          />
          <BenefitCard
            icon={Scale}
            label={t("deposit.benefit.noImpermanentLoss")}
            description={t("deposit.benefit.noImpermanentLossDescription")}
          />
        </Stack>

        <Separator mx="-xl" />

        <Box py="xl">
          <AuthorizedAction size="large" width="100%">
            <LoadingButton
              type="submit"
              size="large"
              width="100%"
              isLoading={deposit.isPending}
              disabled={!canSubmit}
            >
              {ctaLabel}
            </LoadingButton>
          </AuthorizedAction>
        </Box>
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
