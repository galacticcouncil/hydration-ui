import { createContext, type ReactNode, useContext } from "react"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/vaults"

const PropellerVaultCtx = createContext<PropellerVaultConfig | null>(null)

export const PropellerVaultProvider = ({
  vault,
  children,
}: {
  vault: PropellerVaultConfig
  children: ReactNode
}) => (
  <PropellerVaultCtx.Provider value={vault}>
    {children}
  </PropellerVaultCtx.Provider>
)

/**
 * Active Propeller vault config. Pass `override` to read a specific vault
 * outside the provider (e.g. the strategies overview renders a card per asset);
 * inside the provider (the detail page) call it with no args.
 */
export const useActivePropellerVault = (
  override?: PropellerVaultConfig,
): PropellerVaultConfig => {
  const ctx = useContext(PropellerVaultCtx)
  const vault = override ?? ctx
  if (!vault) {
    throw new Error(
      "useActivePropellerVault must be used within a PropellerVaultProvider (or given an override)",
    )
  }
  return vault
}
