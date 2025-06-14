import { Button, Flex } from "@galacticcouncil/ui/components"

import { WalletMode } from "@/hooks/useWeb3Connect"

export function getWalletModeIcon(mode: WalletMode) {
  if (mode === WalletMode.EVM) {
    return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/ethereum/1/icon.svg"
  }
  if (mode === WalletMode.Substrate) {
    return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/5/icon.svg"
  }

  if (mode === WalletMode.Solana) {
    return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/solana/101/icon.svg"
  }

  return ""
}

export function getWalletModeName(mode: WalletMode) {
  if (mode === WalletMode.EVM) {
    return "Ethereum"
  }
  if (mode === WalletMode.Substrate) {
    return "Polkadot"
  }

  if (mode === WalletMode.Solana) {
    return "Solana"
  }

  return ""
}

const WALLET_MODES = [
  WalletMode.Substrate,
  WalletMode.EVM,
  WalletMode.Solana,
] as const

export type AccountFilterProps = {
  active: WalletMode
  onSetActive: (mode: WalletMode) => void
  blacklist?: WalletMode[]
}

export const AccountFilter: React.FC<AccountFilterProps> = ({
  active,
  onSetActive,
  blacklist,
}) => {
  return (
    <Flex gap={10}>
      <Button
        variant={active === WalletMode.Default ? "secondary" : "tertiary"}
        onClick={() => onSetActive(WalletMode.Default)}
      >
        All
      </Button>
      {WALLET_MODES.filter((mode) => !blacklist?.includes(mode)).map((mode) => (
        <Button
          variant={active === mode ? "secondary" : "tertiary"}
          size="small"
          key={mode}
          onClick={() => onSetActive(mode)}
          sx={{ position: "relative", pl: 6 }}
        >
          <img
            sx={{ size: 20 }}
            src={getWalletModeIcon(mode)}
            alt={getWalletModeName(mode)}
          />
          {getWalletModeName(mode)}
        </Button>
      ))}
    </Flex>
  )
}
