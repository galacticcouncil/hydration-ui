import { HydrationQueries } from "@galacticcouncil/descriptors"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { ObservedValueOf } from "rxjs"

import { usePendingPermit, usePermitNonce } from "@/api/evm"
import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiValue } from "@/hooks/usePapiValue"
import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"
import {
  getOmnipoolMiningPositions,
  getOmnipoolPositions,
  getXykMiningPositions,
} from "@/utils/uniques"

import { uniquesIds } from "./constants"

type OmnipoolWarehouseLMDeposit =
  HydrationQueries["OmnipoolWarehouseLM"]["Deposit"]["Value"]

export type OmnipoolDeposit = OmnipoolWarehouseLMDeposit & {
  positionId: bigint
  miningId: bigint
}

export type OmnipoolDepositFull = Omit<
  OmnipoolWarehouseLMDeposit,
  "amm_pool_id"
> &
  OmnipoolPosition & {
    miningId: string
  }

export type XykDeposit =
  HydrationQueries["XYKWarehouseLM"]["Deposit"]["Value"] & {
    id: string
  }

export type OmnipoolPosition = Omit<
  HydrationQueries["Omnipool"]["Positions"]["Value"],
  "asset_id"
> & {
  positionId: string
  assetId: string
}

export type AccountUniquesObservedValue = ObservedValueOf<
  ReturnType<Papi["query"]["Uniques"]["Account"]["watchEntries"]>
>

export type AccountUniquesValues = Awaited<
  ReturnType<Papi["query"]["Uniques"]["Account"]["getEntries"]>
>

export type AccountUniquesEntries = AccountUniquesObservedValue["entries"]

export const useAccountInfo = (options?: UseBaseObservableQueryOptions) => {
  const { isConnected, account } = useAccount()
  const address = isConnected ? account.address : ""

  return usePapiValue("System.Account", [address, { at: "best" }], options)
}

export const omnipoolPositionsKey = (address: string) => [
  "uniques",
  "omnipoolPositions",
  address,
]
export const omnipoolPositionsQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { isApiLoaded, papi, queryClient } = context

  return queryOptions({
    queryKey: omnipoolPositionsKey(address),
    enabled: isApiLoaded && !!address,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: [],
    queryFn: async () => {
      const { omnipoolNftId } = await queryClient.ensureQueryData(
        uniquesIds(context),
      )

      const entries = await papi.query.Uniques.Account.getEntries(
        address,
        omnipoolNftId,
        { at: "best" },
      )

      return getOmnipoolPositions(papi, entries)
    },
  })
}

export const omnipoolMiningPositionsKey = (address: string) => [
  "uniques",
  "omnipoolMiningPositions",
  address,
]
export const omnipoolMiningPositionsQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { isApiLoaded, papi, queryClient } = context

  return queryOptions({
    queryKey: omnipoolMiningPositionsKey(address),
    enabled: isApiLoaded && !!address,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: [],
    queryFn: async () => {
      const { miningNftId } = await queryClient.ensureQueryData(
        uniquesIds(context),
      )

      const entries = await papi.query.Uniques.Account.getEntries(
        address,
        miningNftId,
        { at: "best" },
      )

      return entries.length ? getOmnipoolMiningPositions(papi, entries) : []
    },
  })
}

export const xykMiningPositionsKey = (address: string) => [
  "uniques",
  "xykMiningPositions",
  address,
]
export const xykMiningPositionsQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { isApiLoaded, papi, queryClient } = context

  return queryOptions({
    queryKey: xykMiningPositionsKey(address),
    enabled: isApiLoaded && !!address,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: [],
    queryFn: async () => {
      const { xykMiningNftId } = await queryClient.ensureQueryData(
        uniquesIds(context),
      )

      const entries = await papi.query.Uniques.Account.getEntries(
        address,
        xykMiningNftId,
        { at: "best" },
      )

      return getXykMiningPositions(papi, entries)
    },
  })
}

export const useAccountOmnipoolPositions = () => {
  const provider = useRpcProvider()
  const { account } = useAccount()

  return useQuery(omnipoolPositionsQuery(provider, account?.address ?? ""))
}

export const useAccountOmnipoolMiningPositions = () => {
  const provider = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    omnipoolMiningPositionsQuery(provider, account?.address ?? ""),
  )
}

export const useAccountXykMiningPositions = () => {
  const provider = useRpcProvider()
  const { account } = useAccount()

  return useQuery(xykMiningPositionsQuery(provider, account?.address ?? ""))
}

export const useAccountPermitNonce = () => {
  const { account } = useAccount()
  return usePermitNonce(account?.address ?? "")
}

export const useAccountPendingPermit = () => {
  const { account } = useAccount()
  return usePendingPermit(account?.address ?? "")
}
