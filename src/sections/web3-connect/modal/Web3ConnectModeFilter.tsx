import { MetadataStore } from "@galacticcouncil/ui"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmChain } from "@galacticcouncil/xcm-core"
import { Chip } from "components/Chip"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"

const WALLET_MODES = [WalletMode.Substrate, WalletMode.EVM] as const

const getModeIcon = (mode: WalletMode) => {
  try {
    if (mode === WalletMode.EVM) {
      const chain = chainsMap.get("ethereum") as EvmChain
      const asset = chain.getAsset("weth")!
      const address = chain.getAssetId(asset)
      return MetadataStore.getInstance().asset(
        "ethereum",
        chain.defEvm.id.toString(),
        address.toString(),
      )
    }
    return MetadataStore.getInstance().asset("polkadot", "0", "0")
  } catch (e) {}
}

export type Web3ConnectModeFilterProps = {
  active: WalletMode
  onSetActive: (mode: WalletMode) => void
  includeAll?: boolean
}

export const Web3ConnectModeFilter: React.FC<Web3ConnectModeFilterProps> = ({
  active,
  onSetActive,
  includeAll = false,
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", align: "center", gap: 10 }}>
      {includeAll && (
        <Chip
          active={active === WalletMode.Default}
          onClick={() => onSetActive(WalletMode.Default)}
        >
          {t(`walletConnect.provider.mode.all`)}
        </Chip>
      )}
      {WALLET_MODES.map((mode) => (
        <Chip
          key={mode}
          active={active === mode}
          onClick={() => onSetActive(mode)}
        >
          <Icon
            size={20}
            icon={
              <img
                src={getModeIcon(mode)}
                alt={t(`walletConnect.provider.mode.${mode}`)}
              />
            }
          />
          {t(`walletConnect.provider.mode.${mode}`)}
        </Chip>
      ))}
    </div>
  )
}
