import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { SJuiceButton } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.styled"
import { JuicerStrategyLogo } from "@/modules/strategies/juicer/components/JuicerStrategyLogo"
import {
  JUICER_VAULTS,
  type JuicerVaultConfig,
  vaultDisplayAssetId,
} from "@/modules/strategies/juicer/config/vaults"
import {
  remainingCapacity,
  vaultDepositState,
} from "@/modules/strategies/juicer/hooks/useJuicerVaults"
import { vaultStatsQuery } from "@/modules/strategies/juicer/hooks/useVaultReads"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type JuicerAssetCtaProps = {
  /** a wallet asset; matched against each vault's collateral */
  assetId: string
  /** an existing position names its vault directly — its assetId is the display asset */
  vault?: JuicerVaultConfig
  mobile?: boolean
  isExistingPosition?: boolean
}

export const JuicerAssetCta: FC<JuicerAssetCtaProps> = ({
  assetId,
  vault: vaultProp,
  mobile = false,
  isExistingPosition = false,
}) => {
  const { t } = useTranslation("wallet")
  const { getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const { featureFlags, isReady } = rpc
  const vault =
    vaultProp ?? JUICER_VAULTS.find((vault) => vault.assetId === assetId)
  const { data } = useQuery({
    ...vaultStatsQuery(
      rpc,
      vault ?? JUICER_VAULTS[0]!,
      getAssetWithFallback((vault ?? JUICER_VAULTS[0]!).assetId).decimals,
    ),
    enabled: isReady && featureFlags.juicerEnabled && !!vault,
  })

  // a deposit invitation only while deposit() would actually go through —
  // the same gate as the strategy table and the deposit form
  const state = vaultDepositState(
    data && {
      ...data,
      cap: data.tvlCap,
      ...remainingCapacity(data.totalAssets, data.tvlCap),
    },
  )
  if (!isReady || !featureFlags.juicerEnabled || !vault || state !== "open")
    return null

  const { symbol } = getAssetWithFallback(vault.assetId)

  return (
    <SJuiceButton
      variant="transparent"
      size={mobile ? "large" : undefined}
      mr={mobile ? undefined : "auto"}
      gridColumn={mobile ? "1 / -1" : undefined}
      asChild
    >
      <Link to={LINKS.strategiesJuicer} search={{ asset: symbol }}>
        <JuicerStrategyLogo size="small" withBackground={false} />
        {t(
          isExistingPosition
            ? "myAssets.actions.juicerDepositMore"
            : "myAssets.actions.juicerDeposit",
          {
            symbol: isExistingPosition
              ? getAssetWithFallback(vaultDisplayAssetId(vault)).symbol
              : symbol,
          },
        )}
      </Link>
    </SJuiceButton>
  )
}
