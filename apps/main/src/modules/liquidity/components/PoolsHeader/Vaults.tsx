import { ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useVaults } from "@/modules/liquidity/Vaults.utils"

import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

/** Header stats for the Concentrated liquidity tab: vault value + pool value */
export const Vaults = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data, isLoading } = useVaults()

  const totals = data.reduce(
    (acc, vault) => ({
      vaults: vault.vaultTvlDisplay
        ? acc.vaults.plus(vault.vaultTvlDisplay)
        : acc.vaults,
      pools: vault.tvlDisplay ? acc.pools.plus(vault.tvlDisplay) : acc.pools,
    }),
    { vaults: Big(0), pools: Big(0) },
  )

  return (
    <>
      <ValueStats
        label={t("liquidity:header.valueInVaults")}
        value={t("common:currency.compact", { value: totals.vaults })}
        isLoading={isLoading}
        size="medium"
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:vaults.column.poolLiquidity")}
        value={t("common:currency.compact", { value: totals.pools })}
        isLoading={isLoading}
        size="medium"
        wrap
      />
    </>
  )
}

/** Reads its own data and renders nothing on a chain with no vaults */
export const VaultsValueTile = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data, isLoading } = useVaults()

  if (!data.length) return null

  const total = data.reduce(
    (acc, vault) =>
      vault.vaultTvlDisplay ? acc.plus(vault.vaultTvlDisplay) : acc,
    Big(0),
  )

  return (
    <>
      <ValueStats
        label={t("liquidity:header.valueInVaults")}
        value={t("common:currency.compact", { value: total })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <PoolsHeaderSeparator />
    </>
  )
}
