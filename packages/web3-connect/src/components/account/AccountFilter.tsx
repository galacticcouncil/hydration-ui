import { Button, Flex } from "@galacticcouncil/ui/components"

import { WalletMode } from "@/hooks/useWeb3Connect"
import { getWalletModeIcon } from "@/utils/wallet"

export const allAccountFilterOptions = [
  WalletMode.Substrate,
  WalletMode.SubstrateH160,
  WalletMode.EVM,
  WalletMode.Solana,
  WalletMode.Sui,
] as const satisfies Array<WalletMode>

export type AccountFilterOptionOverride =
  (typeof allAccountFilterOptions)[number]

export type AccountFilterOption =
  | AccountFilterOptionOverride
  | WalletMode.Default

const modeData: Record<
  AccountFilterOptionOverride,
  [name: string, icon: string]
> = {
  [WalletMode.Substrate]: ["Polkadot", getWalletModeIcon(WalletMode.Substrate)],
  [WalletMode.EVM]: ["EVM", getWalletModeIcon(WalletMode.EVM)],
  [WalletMode.Solana]: ["Solana", getWalletModeIcon(WalletMode.Solana)],
  [WalletMode.Sui]: ["Sui", getWalletModeIcon(WalletMode.Sui)],
  [WalletMode.SubstrateH160]: [
    "Substrate H160",
    getWalletModeIcon(WalletMode.Substrate),
  ],
}

const defaultBlacklist: ReadonlyArray<AccountFilterOptionOverride> = [
  WalletMode.Solana,
  WalletMode.Sui,
  WalletMode.SubstrateH160,
]

export type AccountFilterProps = {
  readonly active: AccountFilterOption
  readonly whitelist?: ReadonlyArray<AccountFilterOptionOverride>
  readonly blacklist?: ReadonlyArray<AccountFilterOptionOverride>
  readonly onSetActive: (mode: AccountFilterOption) => void
}

export const AccountFilter: React.FC<AccountFilterProps> = ({
  active,
  whitelist,
  blacklist,
  onSetActive,
}) => {
  const fullBlacklist = blacklist
    ? [...defaultBlacklist, ...blacklist]
    : defaultBlacklist

  return (
    <Flex gap="base">
      <Button
        variant={active === WalletMode.Default ? "secondary" : "muted"}
        outline={active !== WalletMode.Default}
        onClick={() => onSetActive(WalletMode.Default)}
        sx={{ py: "s" }}
      >
        All
      </Button>
      {Object.entries(modeData)
        .filter(
          ([mode]) =>
            !whitelist ||
            whitelist.includes(mode as AccountFilterOptionOverride),
        )
        .filter(
          ([mode]) =>
            !fullBlacklist ||
            !fullBlacklist.includes(mode as AccountFilterOptionOverride),
        )
        .map(([mode, [name, icon]]) => (
          <Button
            variant={active === mode ? "secondary" : "muted"}
            outline={active !== mode}
            size="small"
            key={mode}
            onClick={() => onSetActive(mode as AccountFilterOption)}
            sx={{ position: "relative", pl: "s", py: "s", gap: "s" }}
          >
            <img sx={{ size: "l" }} src={icon} alt={name} />
            {name}
          </Button>
        ))}
    </Flex>
  )
}
