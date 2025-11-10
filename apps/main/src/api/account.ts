import { useAccount } from "@galacticcouncil/web3-connect"
import { HydrationQueries } from "@polkadot-api/descriptors"
import { useQuery } from "@tanstack/react-query"
import { pick } from "remeda"
import { ObservedValueOf } from "rxjs"
import { useShallow } from "zustand/shallow"

import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiObservableQuery } from "@/hooks/usePapiObservableQuery"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
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

export type AccountUniquesEntries = AccountUniquesObservedValue["entries"]
type AccountUniquesUpdater = (data: AccountUniquesObservedValue) => void

export const useAccountInfo = (options?: UseBaseObservableQueryOptions) => {
  const { isConnected, account } = useAccount()
  const address = isConnected ? account.address : ""

  return usePapiObservableQuery("System.Account", [address, "best"], options)
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

export const useAccountUniquesSubscription = () => {
  const { papi } = useRpcProvider()

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

  useAccountOmnipoolPositions(async (data) => {
    if (data.deltas === null) return
    const omnipoolPositions = await getOmnipoolPositions(papi, data.entries)
    setOmnipoolPositions(omnipoolPositions)
  })

  useAccountOmnipoolMiningPositions(async (data) => {
    if (data.deltas === null) return
    const omnipoolMiningPositions = await getOmnipoolMiningPositions(
      papi,
      data.entries,
    )
    setOmnipoolMiningPositions(omnipoolMiningPositions)
  })

  useAccountXykMiningPositions(async (data) => {
    if (data.deltas === null) return
    const xykMiningPositions = await getXykMiningPositions(papi, data.entries)
    setXykMiningPositions(xykMiningPositions)
  })
}
