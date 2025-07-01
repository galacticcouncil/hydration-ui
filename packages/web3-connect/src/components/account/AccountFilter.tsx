import { Button, Flex } from "@galacticcouncil/ui/components"

import { WalletMode } from "@/hooks/useWeb3Connect"

export const allAccountFilterOptions = [
  WalletMode.Substrate,
  WalletMode.EVM,
  WalletMode.Solana,
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
  [WalletMode.Substrate]: [
    "Polkadot",
    "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/5/icon.svg",
  ],
  [WalletMode.EVM]: [
    "Evm",
    "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/ethereum/1/icon.svg",
  ],
  [WalletMode.Solana]: [
    "Solana",
    "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/solana/101/icon.svg",
  ],
}

const defaultBlacklist: ReadonlyArray<AccountFilterOptionOverride> = [
  WalletMode.Solana,
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
    <Flex gap={10}>
      <Button
        variant={active === WalletMode.Default ? "secondary" : "tertiary"}
        onClick={() => onSetActive(WalletMode.Default)}
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
            variant={active === mode ? "secondary" : "tertiary"}
            size="small"
            key={mode}
            onClick={() => onSetActive(mode as AccountFilterOption)}
            sx={{ position: "relative", pl: 6 }}
          >
            <img sx={{ size: 20 }} src={icon} alt={name} />
            {name}
          </Button>
        ))}
    </Flex>
  )
}
