import { Chip } from "components/Chip"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"
import { getWalletModeIcon } from "sections/web3-connect/Web3Connect.utils"

const WALLET_MODES = [
  WalletMode.Substrate,
  WalletMode.EVM,
  WalletMode.Solana,
  WalletMode.Sui,
] as const

export type Web3ConnectModeFilterProps = {
  active: WalletMode
  onSetActive: (mode: WalletMode) => void
  blacklist?: WalletMode[]
  className?: string
}

export const Web3ConnectModeFilter: React.FC<Web3ConnectModeFilterProps> = ({
  active,
  onSetActive,
  blacklist,
  className,
}) => {
  const { t } = useTranslation()

  const selectedOption =
    WALLET_MODES.find((modes) => modes === active) ?? WalletMode.Default

  return (
    <div sx={{ flex: "row", align: "center", gap: 10 }} className={className}>
      {!blacklist?.includes(WalletMode.Default) && (
        <Chip
          active={selectedOption === WalletMode.Default}
          onClick={() => onSetActive(WalletMode.Default)}
        >
          {t(`walletConnect.provider.mode.all`)}
        </Chip>
      )}
      {WALLET_MODES.filter((mode) => !blacklist?.includes(mode)).map((mode) => (
        <Chip
          key={mode}
          active={selectedOption === mode}
          onClick={() => onSetActive(mode)}
        >
          <Icon
            size={20}
            icon={
              <img
                src={getWalletModeIcon(mode)}
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
