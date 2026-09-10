import { EVM_DECIMALS } from "@galacticcouncil/web3-connect/src/config/evm"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useVaults, VaultTable } from "@/modules/liquidity/Vaults.utils"
import { LiquidityPositionByAsset } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidityTable.data"
import { XYKPoolMeta } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type VaultLiquidityByPool = {
  readonly meta: XYKPoolMeta
  readonly vault: VaultTable
  readonly shareSymbol: string
  readonly currentValueHuman: string
  readonly currentHubValueHuman: string
  readonly currentTotalDisplay: string
  readonly positions: ReadonlyArray<VaultTable>
}

export const isVaultLiquidity = (
  pool: LiquidityPositionByAsset | VaultLiquidityByPool,
): pool is VaultLiquidityByPool => "vault" in pool

export const useMyVaultLiquidity = () => {
  const { t } = useTranslation("common")
  const { data, isLoading } = useVaults()

  const vaults = useMemo<Array<VaultLiquidityByPool>>(
    () =>
      data
        .filter((vault) => vault.positionShares > 0n)
        .map((vault) => {
          const [token0, token1] = vault.tokens

          return {
            meta: {
              id: vault.id,
              symbol: `${token0.symbol}/${token1.symbol}`,
              name: `${token0.name} / ${token1.name}`,
              iconId: [token0.id, token1.id],
              decimals: EVM_DECIMALS,
            },
            vault,
            shareSymbol: vault.vault?.shareSymbol ?? t("shares"),
            currentValueHuman: scaleHuman(
              vault.positionShares,
              EVM_DECIMALS,
            ).toString(),
            currentHubValueHuman: "0",
            currentTotalDisplay: Big(
              vault.positionValueDisplay ?? 0,
            ).toString(),
            positions: [vault],
          }
        }),
    [data, t],
  )

  return { data: vaults, isLoading }
}
