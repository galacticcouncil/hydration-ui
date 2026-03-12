import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import { VAULT_ADDRESS, HOLLAR_ADDRESS, VAULT_ABI, ERC20_ABI, vaultEvmClient } from "../constants"

export function useVaultStats() {
  return useQuery({
    queryKey: ["wdcl-vault-stats"],
    queryFn: async () => {
      const vault = getContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, client: vaultEvmClient })

      const [totalAssets, totalSupply, exchangeRateWad, withdrawalDelay, investmentPeriod, tvlCap, paused, depositsPaused, minReinvest] = await Promise.all([
        vault.read.totalAssets(),
        vault.read.totalSupply(),
        vault.read.exchangeRate(),
        vault.read.WITHDRAWAL_DELAY(),
        vault.read.INVESTMENT_PERIOD(),
        vault.read.tvlCap(),
        vault.read.paused(),
        vault.read.depositsPaused(),
        vault.read.minReinvestAmount(),
      ])

      return {
        totalAssets: Number(formatUnits(totalAssets, 18)),
        totalSupply: Number(formatUnits(totalSupply, 18)),
        exchangeRate: Number(formatUnits(exchangeRateWad, 18)),
        withdrawalDelayDays: Math.ceil(Number(withdrawalDelay) / 86400),
        investmentPeriodDays: Math.ceil(Number(investmentPeriod) / 86400),
        tvlCap: Number(formatUnits(tvlCap, 18)),
        paused,
        depositsPaused,
        minDeposit: Number(formatUnits(minReinvest, 18)),
        apr: 18, // TODO: derive from getActiveAPY once positions exist
      }
    },
    refetchInterval: 30_000,
  })
}

export function useUserBalances(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["wdcl-vault-balances", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { hollar: 0, wdcl: 0 }

      const hollarToken = getContract({ address: HOLLAR_ADDRESS, abi: ERC20_ABI, client: vaultEvmClient })
      const vault = getContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, client: vaultEvmClient })

      const [hollarBal, wdclBal] = await Promise.all([
        hollarToken.read.balanceOf([evmAddress]),
        vault.read.balanceOf([evmAddress]),
      ])

      return {
        hollar: Number(formatUnits(hollarBal, 18)),
        wdcl: Number(formatUnits(wdclBal, 18)),
      }
    },
    refetchInterval: 15_000,
  })
}

export function useHollarAllowance(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["wdcl-vault-allowance", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return 0
      const hollarToken = getContract({ address: HOLLAR_ADDRESS, abi: ERC20_ABI, client: vaultEvmClient })
      const allowance = await hollarToken.read.allowance([evmAddress, VAULT_ADDRESS])
      return Number(formatUnits(allowance, 18))
    },
    refetchInterval: 15_000,
  })
}
