import { Button, Flex, Logo } from "@galacticcouncil/ui/components"

import {
  WalletAccountFilterOption,
  WalletAccountFilterOptionOverride,
  WalletMode,
} from "@/config/wallet"
import { getWalletModeIcon, getWalletModeName } from "@/utils/wallet"

type ModeData = Record<
  WalletAccountFilterOptionOverride,
  [name: string, icon: string]
>

const MODE_DATA: ModeData = {
  [WalletMode.Substrate]: [
    getWalletModeName(WalletMode.Substrate),
    getWalletModeIcon(WalletMode.Substrate),
  ],
  [WalletMode.EVM]: [
    getWalletModeName(WalletMode.EVM),
    getWalletModeIcon(WalletMode.EVM),
  ],
  [WalletMode.Solana]: [
    getWalletModeName(WalletMode.Solana),
    getWalletModeIcon(WalletMode.Solana),
  ],
  [WalletMode.Sui]: [
    getWalletModeName(WalletMode.Sui),
    getWalletModeIcon(WalletMode.Sui),
  ],
  [WalletMode.SubstrateH160]: [
    getWalletModeName(WalletMode.SubstrateH160),
    getWalletModeIcon(WalletMode.Substrate),
  ],
}

export type AccountFilterProps = {
  readonly active: WalletAccountFilterOption
  readonly whitelist?: ReadonlyArray<WalletAccountFilterOptionOverride>
  readonly onSetActive: (mode: WalletAccountFilterOption) => void
}

export const AccountFilter: React.FC<AccountFilterProps> = ({
  active,
  whitelist,
  onSetActive,
}) => {
  return (
    <Flex gap="base" wrap>
      <Button
        variant={active === WalletMode.Default ? "secondary" : "muted"}
        outline={active !== WalletMode.Default}
        onClick={() => onSetActive(WalletMode.Default)}
        sx={{ py: "s" }}
      >
        All
      </Button>
      {Object.entries(MODE_DATA)
        .filter(
          ([mode]) =>
            !whitelist ||
            whitelist.length === 0 ||
            whitelist.includes(mode as WalletAccountFilterOptionOverride),
        )
        .map(([mode, [name, icon]]) => (
          <Button
            variant={active === mode ? "secondary" : "muted"}
            outline={active !== mode}
            size="small"
            key={mode}
            onClick={() => onSetActive(mode as WalletAccountFilterOption)}
            sx={{ position: "relative", pl: "s", py: "s", gap: "s" }}
          >
            <Logo size="medium" src={icon} alt={name} />
            {name}
          </Button>
        ))}
    </Flex>
  )
}
