import {
  bigShift,
  formatSourceChainAddress,
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
  isAnyEvmChain,
  isAnyParachain,
} from "@galacticcouncil/utils"
import {
  Account,
  getWalletModesByProviderType,
  UseExtraAccountBalances,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { createXcContext } from "@galacticcouncil/xc"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AnyChain, AssetAmount } from "@galacticcouncil/xc-core"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"

type BalanceTarget = {
  id: string
  accountPublicKey: string
  address: string
  chain: AnyChain
}

const registryChain = chainsMap.get(HYDRATION_CHAIN_KEY)

const isChainCompatibleWithAccount = (account: Account, chain: AnyChain) => {
  if (chain.key === HYDRATION_CHAIN_KEY) return false

  if (account.provider === WalletProviderType.ExternalWallet) {
    return true
  }

  const modes = getWalletModesByProviderType(account.provider)

  return modes.some((mode) => {
    switch (mode) {
      case WalletMode.EVM:
        return isAnyEvmChain(chain)
      case WalletMode.Substrate:
        return isAnyParachain(chain) && !chain.usesH160Acc
      case WalletMode.Solana:
        return chain.isSolana()
      case WalletMode.Sui:
        return chain.isSui()
      default:
        return false
    }
  })
}

export const useWalletManagementCrossChainBalances: UseExtraAccountBalances = (
  accounts,
) => {
  const { sdk } = useRpcProvider()
  const { data: xcmContext } = useQuery({
    queryKey: ["xcm", "context"],
    queryFn: () =>
      createXcContext({
        poolCtx: sdk.ctx.pool,
      }),
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const chains = useMemo(() => [...chainsMap.values()], [])
  const targets = useMemo(() => {
    return accounts.flatMap((account): BalanceTarget[] => {
      return chains
        .filter((chain) => isChainCompatibleWithAccount(account, chain))
        .map((chain) => {
          const address = formatSourceChainAddress(account.address, chain)
          return { account, address, chain }
        })
        .filter(({ address, chain }) => {
          return !!address && isAddressValidOnChain(address, chain)
        })
        .map(({ account, address, chain }) => ({
          id: `${account.publicKey}:${chain.key}:${address}`,
          accountPublicKey: account.publicKey,
          address,
          chain,
        }))
    })
  }, [accounts, chains])

  const priceIds = useMemo(() => {
    if (!registryChain) return []

    return Array.from(
      new Set(
        targets.flatMap((target) =>
          [...target.chain.assetsData.values()].map(({ asset }) =>
            registryChain.getBalanceAssetId(asset).toString(),
          ),
        ),
      ),
    )
  }, [targets])

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(priceIds)
  const [targetBalances, setTargetBalances] = useState(
    () => new Map<string, AssetAmount[]>(),
  )
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)

  useEffect(() => {
    const wallet = xcmContext?.wallet

    setTargetBalances(new Map())

    if (!wallet || !targets.length) {
      setIsBalanceLoading(false)
      return
    }

    let cancelled = false
    let pendingTargets = targets.length
    const subscriptions: Array<{ unsubscribe: () => void }> = []

    const completeTarget = () => {
      pendingTargets -= 1
      if (pendingTargets <= 0 && !cancelled) {
        setIsBalanceLoading(false)
      }
    }

    setIsBalanceLoading(true)

    for (const target of targets) {
      wallet
        .subscribeBalance(target.address, target.chain, (balances) => {
          if (cancelled) return

          setTargetBalances((prev) => {
            const next = new Map(prev)
            next.set(target.id, balances)
            return next
          })
          completeTarget()
        })
        .then((subscription) => {
          if (cancelled) {
            subscription.unsubscribe()
            return
          }
          subscriptions.push(subscription)
        })
        .catch(() => {
          completeTarget()
        })
    }

    return () => {
      cancelled = true
      subscriptions.forEach((subscription) => subscription.unsubscribe())
    }
  }, [targets, xcmContext?.wallet])

  const accountBalances = useMemo(() => {
    if (!registryChain) return new Map<string, number>()

    const balances = new Map<string, number>()

    for (const target of targets) {
      const targetValue = (targetBalances.get(target.id) ?? []).reduce(
        (total, balance) => {
          const asset = target.chain.assetsData.get(balance.key)?.asset
          if (!asset) return total

          const registryId = registryChain.getBalanceAssetId(asset).toString()
          const { price } = getAssetPrice(registryId)
          if (!price) return total

          return (
            total +
            bigShift(balance.amount.toString(), -balance.decimals)
              .times(price)
              .toNumber()
          )
        },
        0,
      )

      balances.set(
        target.accountPublicKey,
        (balances.get(target.accountPublicKey) ?? 0) + targetValue,
      )
    }

    return balances
  }, [getAssetPrice, targetBalances, targets])

  return {
    accountBalances,
    isLoading: isBalanceLoading || isPriceLoading,
  }
}
