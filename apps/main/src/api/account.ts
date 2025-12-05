import { useAccount } from "@galacticcouncil/web3-connect"
import { HydrationQueries } from "@polkadot-api/descriptors"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { pick } from "remeda"
import { ObservedValueOf } from "rxjs"
import { useShallow } from "zustand/shallow"

import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiObservableQuery } from "@/hooks/usePapiObservableQuery"
import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"
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
type AccountUniquesUpdater = (data: AccountUniquesObservedValue) => void

export const useAccountInfo = (options?: UseBaseObservableQueryOptions) => {
  const { isConnected, account } = useAccount()
  const address = isConnected ? account.address : ""

  return usePapiObservableQuery("System.Account", [address, "best"], options)
}

export const omnipoolPositionsKey = (address: string) => [
  "uniques",
  "omnipoolPositions",
  address,
]
export const omnipoolPositionsQuery = (
  context: TProviderContext,
  address: string,
  omnipoolNftId: bigint,
  onSuccess?: (data: OmnipoolPosition[]) => void,
) => {
  const { isApiLoaded, papi } = context

  return queryOptions({
    queryKey: omnipoolPositionsKey(address),
    enabled: isApiLoaded && !!address && !!omnipoolNftId,
    queryFn: async () => {
      const entries = await papi.query.Uniques.Account.getEntries(
        address,
        omnipoolNftId,
        { at: "best" },
      )

      const positions = await getOmnipoolPositions(papi, entries)
      onSuccess?.(positions)

      return positions
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
  miningNftId: bigint,
  onSuccess?: (data: OmnipoolDepositFull[]) => void,
) => {
  const { isApiLoaded, papi } = context

  return queryOptions({
    queryKey: omnipoolMiningPositionsKey(address),
    enabled: isApiLoaded && !!address && !!miningNftId,
    queryFn: async () => {
      const entries = await papi.query.Uniques.Account.getEntries(
        address,
        miningNftId,
        { at: "best" },
      )

      const omnipoolMiningPositions = await getOmnipoolMiningPositions(
        papi,
        entries,
      )
      onSuccess?.(omnipoolMiningPositions)

      return omnipoolMiningPositions
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
  miningNftId: bigint,
  onSuccess?: (data: XykDeposit[]) => void,
) => {
  const { isApiLoaded, papi } = context

  return queryOptions({
    queryKey: xykMiningPositionsKey(address),
    enabled: isApiLoaded && !!address && !!miningNftId,
    queryFn: async () => {
      const entries = await papi.query.Uniques.Account.getEntries(
        address,
        miningNftId,
        { at: "best" },
      )

      const xykMiningPositions = await getXykMiningPositions(papi, entries)
      onSuccess?.(xykMiningPositions)

      return xykMiningPositions
    },
  })
}

export const useAccountOmnipoolPositions = (
  onUpdate?: AccountUniquesUpdater,
) => {
  const { account } = useAccount()
  const provider = useRpcProvider()
  const { data: nftIds } = useQuery(uniquesIds(provider))

  const address = account?.address ?? ""
  const omnipoolNftId = nftIds?.omnipoolNftId ?? 0n

  return usePapiObservableQuery(
    "Uniques.Account",
    [address, omnipoolNftId, { at: "best" }],
    {
      enabled: !!address && omnipoolNftId > 0n,
      watchType: "entries",
      onUpdate,
    },
  )
}

export const useAccountOmnipoolMiningPositions = (
  onUpdate?: AccountUniquesUpdater,
) => {
  const { account } = useAccount()
  const provider = useRpcProvider()
  const { data: nftIds } = useQuery(uniquesIds(provider))

  const address = account?.address ?? ""
  const miningNftId = nftIds?.miningNftId ?? 0n

  return usePapiObservableQuery(
    "Uniques.Account",
    [address, miningNftId, { at: "best" }],
    {
      enabled: !!address && miningNftId > 0n,
      watchType: "entries",
      onUpdate,
    },
  )
}

export const useAccountXykMiningPositions = (
  onUpdate?: AccountUniquesUpdater,
) => {
  const { account } = useAccount()
  const provider = useRpcProvider()

  const { data: nftIds } = useQuery(uniquesIds(provider))

  const address = account?.address ?? ""
  const xykMiningNftId = nftIds?.xykMiningNftId ?? 0n

  return usePapiObservableQuery(
    "Uniques.Account",
    [address, xykMiningNftId, { at: "best" }],
    {
      enabled: !!address && xykMiningNftId > 0n,
      watchType: "entries",
      onUpdate,
    },
  )
}

export const useAccountUniques = () => {
  const provider = useRpcProvider()
  const { account } = useAccount()
  const { data: nftIds } = useQuery(uniquesIds(provider))

  const {
    setOmnipoolPositions,
    setOmnipoolMiningPositions,
    setXykMiningPositions,
  } = useAccountData(
    useShallow(
      pick([
        "setOmnipoolPositions",
        "setOmnipoolMiningPositions",
        "setXykMiningPositions",
      ]),
    ),
  )

  useQuery(
    omnipoolPositionsQuery(
      provider,
      account?.address ?? "",
      nftIds?.omnipoolNftId ?? 0n,
      (data) => setOmnipoolPositions(data),
    ),
  )

  useQuery(
    omnipoolMiningPositionsQuery(
      provider,
      account?.address ?? "",
      nftIds?.miningNftId ?? 0n,
      (data) => setOmnipoolMiningPositions(data),
    ),
  )

  useQuery(
    xykMiningPositionsQuery(
      provider,
      account?.address ?? "",
      nftIds?.xykMiningNftId ?? 0n,
      (data) => setXykMiningPositions(data),
    ),
  )
}
