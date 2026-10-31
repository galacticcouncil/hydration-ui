import type { Account } from "@galacticcouncil/web3-connect"

type SourceAccount = Pick<Account, "provider" | "address" | "publicKey">

export const getPreferredDepositSourceAccount = <T extends SourceAccount>(
  compatible: T[],
  activeAccount: Pick<SourceAccount, "provider" | "address"> | null,
  recentProviders: Account["provider"][],
  recentByProvider: Partial<Record<Account["provider"], string>>,
): T | undefined => {
  const active = compatible.find(
    (account) =>
      account.provider === activeAccount?.provider &&
      account.address === activeAccount.address,
  )
  if (active) return active

  const providers = new Set([
    ...recentProviders,
    ...compatible.map((account) => account.provider),
  ])
  for (const provider of providers) {
    const publicKey = recentByProvider[provider]
    if (!publicKey) continue
    const recent = compatible.find(
      (account) =>
        account.provider === provider && account.publicKey === publicKey,
    )
    if (recent) return recent
  }
}
