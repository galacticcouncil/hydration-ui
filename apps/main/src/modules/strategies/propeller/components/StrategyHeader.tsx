import {
  Flex,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import {
  PROPELLER_ASSET_ORDER,
  PROPELLER_VAULTS,
  type PropellerAsset,
} from "@/modules/strategies/propeller/vaults"

import { PropellerLogo } from "./PropellerLogo"

type Props = {
  asset: PropellerAsset
  onAssetChange: (asset: PropellerAsset) => void
}

export const StrategyHeader = ({ asset, onAssetChange }: Props) => {
  const { t } = useTranslation("propeller")
  const vault = useActivePropellerVault()

  return (
    <Flex justify="space-between" align="center" gap="s" wrap>
      <Flex align="center" gap="base">
        <PropellerLogo size={32} />
        <Flex direction="column">
          <Text
            font="primary"
            fs="h6"
            lh={1}
            fw={600}
            color={getToken("text.high")}
          >
            {t("strategy.name")}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {vault.symbol}
          </Text>
        </Flex>
      </Flex>

      {/* All collateral vaults share this subpage — switch the active one. */}
      <ToggleGroup
        type="single"
        value={asset}
        onValueChange={(value) => {
          if (value) onAssetChange(value as PropellerAsset)
        }}
      >
        {PROPELLER_ASSET_ORDER.map((key) => {
          const cfg = PROPELLER_VAULTS[key]
          return (
            <ToggleGroupItem key={key} value={key}>
              <Flex align="center" gap="xs">
                <AssetLogo id={cfg.assetId} size="small" />
                {cfg.symbol}
              </Flex>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </Flex>
  )
}
