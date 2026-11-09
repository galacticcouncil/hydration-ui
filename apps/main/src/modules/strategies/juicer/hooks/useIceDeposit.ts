import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Enum } from "polkadot-api"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits, type Hex, hexToBytes } from "viem"
import { create } from "zustand"

import { evmAccountBindingQuery } from "@/api/evm"
import { getIntentDeadline } from "@/api/intents"
import { ICE_DEPOSIT_ADAPTER } from "@/modules/strategies/juicer/config/constants"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { depositCapacityQuery } from "@/modules/strategies/juicer/hooks/useVaultReads"
import {
  encodeForwardData,
  type IceDepositStage,
  readIceDepositUpdates,
  readIceMinAmountOut,
} from "@/modules/strategies/juicer/utils/iceDeposit"
import { juicerQueryKeys } from "@/modules/strategies/juicer/utils/queryKeys"
import { useAssets } from "@/providers/assetsProvider"
import { type TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  isSubstrateTxResult,
  type TSuccessResult,
  useTransactionsStore,
} from "@/states/transactions"

const ICE_DEPOSIT_DURATION_MS = 10 * 60_000

export type IceDeposit = {
  /** local id: the intent id is only known once the intent lands */
  key: string
  intentId?: bigint
  owner: string
  vault: JuicerVaultConfig
  assetIn: string
  amountIn: bigint
  stage: IceDepositStage
  stageBlocks: Partial<Record<IceDepositStage, number>>
  forwardId?: bigint
  error?: string
}

type IceDepositStore = {
  deposits: IceDeposit[]
  add: (deposit: IceDeposit) => void
  update: (key: string, patch: (d: IceDeposit) => Partial<IceDeposit>) => void
  dismiss: (key: string) => void
}

// ponytail: in memory, a reload drops the progress; the chain keeps the outcome
export const useIceDepositStore = create<IceDepositStore>((set) => ({
  deposits: [],
  add: (deposit) => set((s) => ({ deposits: [deposit, ...s.deposits] })),
  update: (key, patch) =>
    set((s) => ({
      deposits: s.deposits.map((d) =>
        d.key === key ? { ...d, ...patch(d) } : d,
      ),
    })),
  dismiss: (key) =>
    set((s) => ({ deposits: s.deposits.filter((d) => d.key !== key) })),
}))

export const isIceDepositDone = (stage: IceDepositStage) =>
  stage === "deposited" || stage === "forwardFailed" || stage === "expired"

/**
 * Intent.submit_intent with an `on_resolved` forward to the deposit adapter.
 * Built untyped: Lark's runtime still encodes `partial` as a bool where the
 * descriptors carry the newer No/Yes enum, so take whichever shape encodes.
 */
const buildIceDepositIntent = async (
  rpc: TProviderContext,
  input: {
    assetIn: number
    assetOut: number
    amountIn: bigint
    minAmountOut: bigint
    deadline: bigint
    vault: Hex
  },
) => {
  const unsafe = rpc.papiClient.getUnsafeApi()
  const intent = (partial: unknown) => ({
    intent: {
      data: Enum("Swap", {
        asset_in: input.assetIn,
        asset_out: input.assetOut,
        amount_in: input.amountIn,
        amount_out: input.minAmountOut,
        partial,
      }),
      deadline: input.deadline,
      on_resolved: Enum("Forward", {
        contract: ICE_DEPOSIT_ADAPTER,
        data: hexToBytes(encodeForwardData(input.vault)),
      }),
    },
  })
  const submitIntent = unsafe.tx.Intent?.submit_intent
  if (!submitIntent) throw new Error("This chain has no Intent pallet")
  let callData: Uint8Array
  try {
    callData = await submitIntent(intent(false)).getEncodedData()
  } catch {
    callData = await submitIntent(intent(Enum("No"))).getEncodedData()
  }
  return rpc.papi.txFromCallData(callData)
}

type ChainEvents = Awaited<
  ReturnType<TProviderContext["papi"]["query"]["System"]["Events"]["getValue"]>
>
const eventsOf = (events: ChainEvents) =>
  events.map(
    (e) =>
      e.event as { type: string; value: { type: string; value?: unknown } },
  )

/** the intent this account submitted in the result's block */
const readSubmittedIntent = async (
  rpc: TProviderContext,
  result: TSuccessResult,
  owner: string,
) => {
  const ownerEvm = safeConvertSS58toH160(owner)
  const fromEvents = (events: ReturnType<typeof eventsOf>) =>
    events.find(
      (e) =>
        e.type === "Intent" &&
        e.value.type === "IntentSubmitted" &&
        safeConvertSS58toH160((e.value.value as { owner: string }).owner) ===
          ownerEvm,
    )?.value.value as { id: bigint } | undefined

  if (isSubstrateTxResult(result))
    return {
      block: result.block.number,
      id: fromEvents(result.events as ReturnType<typeof eventsOf>)?.id,
    }
  // an EVM wallet signs through a permit: read the block's events
  const block = "blockNumber" in result ? Number(result.blockNumber) : null
  if (block === null) return { block: null, id: undefined }
  const hash = await rpc.papi.query.System.BlockHash.getValue(block, {
    at: "best",
  })
  const events = await rpc.papi.query.System.Events.getValue({ at: hash })
  return { block, id: fromEvents(eventsOf(events))?.id }
}

/**
 * Deposits by ICE: one signed intent swaps the pay asset into the collateral,
 * and its forward deposits exactly what was received. No Router.buy, no dust;
 * the fill and the deposit land in later blocks, which the tracker follows.
 */
export const useIceDeposit = (vault: JuicerVaultConfig) => {
  const { t } = useTranslation(["common", "juicer"])
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { createTransaction } = useTransactionsStore()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const add = useIceDepositStore((s) => s.add)
  const update = useIceDepositStore((s) => s.update)
  const dismiss = useIceDepositStore((s) => s.dismiss)
  const address = account?.address ?? ""

  return useMutation({
    mutationFn: async ({
      assetIn,
      amountIn,
    }: {
      assetIn: string
      amountIn: bigint
    }) => {
      if (!ICE_DEPOSIT_ADAPTER)
        throw new Error("ICE deposits are not deployed here")
      if (!address) throw new Error("Connect an account before continuing")

      const [sell, capacity, deadline, isBound] = await Promise.all([
        rpc.sdk.api.router.getBestSell(
          Number(assetIn),
          Number(vault.assetId),
          amountIn,
        ),
        queryClient.fetchQuery({
          ...depositCapacityQuery(rpc, vault),
          staleTime: 0,
        }),
        getIntentDeadline(rpc, ICE_DEPOSIT_DURATION_MS),
        queryClient.fetchQuery({
          ...evmAccountBindingQuery(rpc, address),
          staleTime: 0,
        }),
      ])
      // the forward deposits the whole fill: it must fit the room left
      if (sell.amountOut > capacity.maximum)
        throw new Error("The swap would fill more than the vault's room")
      const minAmountOut = readIceMinAmountOut(sell.amountOut, Number(slippage))

      const intentTx = await buildIceDepositIntent(rpc, {
        assetIn: Number(assetIn),
        assetOut: Number(vault.assetId),
        amountIn,
        minAmountOut,
        deadline,
        vault: vault.vaultAddress,
      })
      // the forward deposits for the owner's EVM address: bind it first
      const tx = isBound
        ? intentTx
        : rpc.papi.tx.Utility.batch_all({
            calls: [
              rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              intentTx.decodedCall,
            ],
          })

      const payAsset = getAssetWithFallback(assetIn)
      const amount = t("currency", {
        value: formatUnits(amountIn, payAsset.decimals),
        symbol: payAsset.symbol,
      })

      // the position card shows the deposit from the moment it is signed
      const key = crypto.randomUUID()
      return createTransaction(
        {
          tx,
          title: t("juicer:deposit.review.title", { name: vault.shareName }),
          toasts: {
            submitted: t("juicer:deposit.toast.submitted", { amount }),
            success: t("juicer:deposit.toast.success", { amount }),
            error: t("juicer:deposit.toast.error", { amount }),
          },
          executedAmount: {
            amount: formatUnits(amountIn, payAsset.decimals),
            assetId: assetIn,
          },
        },
        {
          onSubmitted: () =>
            add({
              key,
              owner: address,
              vault,
              assetIn,
              amountIn,
              stage: "submitting",
              stageBlocks: {},
            }),
          onSuccess: async (result) => {
            const { block, id } = await readSubmittedIntent(
              rpc,
              result,
              address,
            )
            if (id === undefined || block === null) return dismiss(key)
            update(key, () => ({
              intentId: id,
              stage: "submitted",
              stageBlocks: { submitted: block },
            }))
          },
          onError: () => dismiss(key),
        },
      )
    },
  })
}

const isTracked = (d: IceDeposit) =>
  d.intentId !== undefined && !isIceDepositDone(d.stage)

/**
 * Follows every open ICE deposit block by block through its Intent and
 * LazyExecutor events. Once deposited it refetches the vault, at a block the
 * EVM node serves, and drops the deposit: the position then shows it.
 */
export const useIceDepositTracker = () => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const deposits = useIceDepositStore((s) => s.deposits)
  const update = useIceDepositStore((s) => s.update)
  const dismiss = useIceDepositStore((s) => s.dismiss)
  const openKey = deposits
    .filter(isTracked)
    .map((d) => d.key)
    .join(",")

  useEffect(() => {
    if (!openKey || !rpc.isReady) return
    // walk from the oldest open deposit's submit block, so none is missed
    let lastBlock =
      Math.min(
        ...useIceDepositStore
          .getState()
          .deposits.filter(isTracked)
          .map((d) => d.stageBlocks.submitted ?? Infinity),
      ) - 1
    let busy = Promise.resolve()

    const settle = async (d: IceDeposit, block: number) => {
      // the EVM node can trail the chain: a refetch before it serves the
      // deposit's block reads the old balance and the position never shows
      for (
        let i = 0;
        i < 30 && (await rpc.evm.getBlockNumber()) < BigInt(block);
        i++
      )
        await new Promise((r) => setTimeout(r, 1_000))
      await queryClient.invalidateQueries({
        queryKey: juicerQueryKeys.vault(d.vault.vaultAddress),
      })
      dismiss(d.key)
    }

    const processBlock = async (block: number, hash: string) => {
      const events = eventsOf(
        await rpc.papi.query.System.Events.getValue({ at: hash }),
      )
      for (const d of useIceDepositStore.getState().deposits) {
        if (!isTracked(d) || d.intentId === undefined) continue
        if (block < (d.stageBlocks.submitted ?? 0)) continue
        const updates = readIceDepositUpdates(events, {
          intentId: d.intentId,
          forwardId: d.forwardId,
          match: {
            isOwner: (who) =>
              safeConvertSS58toH160(who) === safeConvertSS58toH160(d.owner),
            amountIn: d.amountIn,
          },
        })
        if (!updates.length) continue
        update(d.key, (prev) => {
          let next: Partial<IceDeposit> = {}
          for (const u of updates)
            next = {
              ...next,
              stage: u.stage,
              stageBlocks: {
                ...prev.stageBlocks,
                ...next.stageBlocks,
                [u.stage]: block,
              },
              ...(u.stage === "filled" && {
                intentId: u.intentId,
                forwardId: u.forwardId,
              }),
              ...(u.stage === "forwardFailed" && { error: u.reason }),
            }
          return next
        })
        if (updates.some((u) => u.stage === "deposited")) void settle(d, block)
      }
    }

    const sub = rpc.papiClient.bestBlocks$.subscribe(([best]) => {
      if (!best || best.number <= lastBlock) return
      const from = Math.max(lastBlock + 1, best.number - 20)
      lastBlock = best.number
      busy = busy.then(async () => {
        try {
          // a skipped block can carry the fill or the forward: walk them all
          for (let n = from; n <= best.number; n++) {
            const hash =
              n === best.number
                ? best.hash
                : await rpc.papi.query.System.BlockHash.getValue(n, {
                    at: best.hash,
                  })
            await processBlock(n, hash)
          }
        } catch {
          // a pruned or reorged block: the next best block retries from there
        }
      })
    })
    return () => sub.unsubscribe()
  }, [openKey, rpc, queryClient, update, dismiss])

  return deposits
}
