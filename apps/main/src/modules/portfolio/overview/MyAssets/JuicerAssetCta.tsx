import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { SJuiceButton } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.styled"
import { JuicerStrategyLogo } from "@/modules/strategies/propeller/components/JuicerStrategyLogo"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type JuicerAssetCtaProps = {
  assetId: string
  mobile?: boolean
  isExistingPosition?: boolean
}

export const JuicerAssetCta: FC<JuicerAssetCtaProps> = ({
  assetId,
  mobile = false,
  isExistingPosition = false,
}) => {
  const { t } = useTranslation("wallet")
  const { getAssetWithFallback } = useAssets()
  const { featureFlags, isReady } = useRpcProvider()
  const vault = PROPELLER_VAULTS.find((vault) => vault.assetId === assetId)

  if (!isReady || !featureFlags.propellerEnabled || !vault) return null

  const { symbol } = getAssetWithFallback(vault.assetId)

  return (
    <SJuiceButton
      variant="transparent"
      size={mobile ? "large" : undefined}
      mr={mobile ? undefined : "auto"}
      sx={mobile ? { gridColumn: "1 / -1" } : undefined}
      asChild
    >
      <Link to={LINKS.strategiesJuicer} search={{ asset: symbol }}>
        <JuicerStrategyLogo size="small" withBackground={false} />
        {t(
          isExistingPosition
            ? "myAssets.actions.juicerDepositMore"
            : "myAssets.actions.juicerDeposit",
          { symbol: isExistingPosition ? vault.shareSymbol : symbol },
        )}
      </Link>
    </SJuiceButton>
  )
}
