import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import {
  HOLLAR_ASSET_ID,
  safeConvertSS58toH160,
  safeStringify,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { type Abi, encodeFunctionData, type Hex, parseUnits } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import {
  DCL_PRECOMPILE_ADDRESS,
  ERC20_ABI,
  EVM_CALL_GAS,
  BIL_DEPOSIT_ZAP_ABI,
  BIL_DEPOSIT_ZAP_ADDRESS,
  BIL_HAS_AAVE_LAYER,
  BIL_POOL_ABI,
  BIL_POOL_ADDRESS,
  HOLLAR_ADDRESS,
  STABLESWAP_BIL_ASSET_ID,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/strategies/bil/constants"
import { BIL_QUERY_KEY_PREFIX } from "@/modules/strategies/bil/utils/queryKeys"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"

/** A single EVM call to be wrapped + bundled into a substrate batch. */
interface BatchEvmCall {
  to: Hex
  data: Hex
  abi: Abi
}

function buildCancelResupplyCalls(
  requestId: number,
  returnAmount: bigint,
  evmAddress: Hex,
): BatchEvmCall[] {
  return [
    {
      to: VAULT_ADDRESS,
      data: encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "cancelRedeem",
        args: [BigInt(requestId)],
      }),
      abi: [...VAULT_ABI],
    },
    {
      to: BIL_POOL_ADDRESS,
      data: encodeFunctionData({
        abi: BIL_POOL_ABI,
        functionName: "supply",
        args: [DCL_PRECOMPILE_ADDRESS, returnAmount, evmAddress, 0],
      }),
      abi: [...BIL_POOL_ABI],
    },
  ]
}

function useVaultEvmCall() {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  const submitTx = useCallback(
    async (
      to: Hex,
      data: Hex,
      abi: Abi,
      toasts: { submitted: string; success: string },
      invalidateKeys: string[][] = [[BIL_QUERY_KEY_PREFIX]],
    ) => {
      const gasPriceBase = await rpc.evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
      const gasPrice = gasPriceBase + gasPriceSurplus

      const evmCall: ExtendedEvmCall = {
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        abi: safeStringify(abi),
      }

      // If account not yet bound to EVM, batch bind + evm call. The binding
      // query can't go through `invalidateQueries` (it's a full filter, not a
      // plain key), so it stays in `onSuccess`.
      if (isBound === false) {
        const bindTx = rpc.papi.tx.EVMAccounts.bind_evm_address()
        const evmPapiTx = transformEvmCallToPapiTx(rpc.papi, evmCall)
        const batchTx = rpc.papi.tx.Utility.batch_all({
          calls: [bindTx.decodedCall, evmPapiTx.decodedCall],
        })

        return createTransaction(
          { tx: batchTx, toasts, invalidateQueries: invalidateKeys },
          {
            onSuccess: () => {
              queryClient.invalidateQueries(
                evmAccountBindingQuery(rpc, address),
              )
            },
          },
        )
      }

      return createTransaction({
        tx: evmCall,
        toasts,
        invalidateQueries: invalidateKeys,
      })
    },
    [evmAddress, isBound, rpc, address, createTransaction, queryClient],
  )

  const buildBatchCalls = useCallback(
    async (calls: BatchEvmCall[]) => {
      if (calls.length === 0) {
        throw new Error("buildBatchCalls called with no calls")
      }

      const gasPriceBase = await rpc.evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
      const gasPrice = gasPriceBase + gasPriceSurplus

      const evmCalls = calls.map(({ to, data, abi }) => ({
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        abi: safeStringify(abi),
      }))

      const papiCalls = evmCalls.map(
        (c) => transformEvmCallToPapiTx(rpc.papi, c).decodedCall,
      )

      return isBound === false
        ? [rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall, ...papiCalls]
        : papiCalls
    },
    [evmAddress, isBound, rpc],
  )

  const buildBatchTx = useCallback(
    async (calls: BatchEvmCall[]) => {
      const batchInner = await buildBatchCalls(calls)
      return rpc.papi.tx.Utility.batch_all({ calls: batchInner })
    },
    [buildBatchCalls, rpc],
  )

  const submitBatch = useCallback(
    async (
      calls: BatchEvmCall[],
      toasts: { submitted: string; success: string },
      invalidateQueries: string[][] = [[BIL_QUERY_KEY_PREFIX]],
    ) => {
      const batchTx = await buildBatchTx(calls)

      return createTransaction(
        { tx: batchTx, toasts, invalidateQueries },
        // The binding query can't go through `invalidateQueries` (it's a full
        // filter, not a plain key), so it stays in `onSuccess`.
        isBound === false
          ? {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  evmAccountBindingQuery(rpc, address),
                )
              },
            }
          : undefined,
      )
    },
    [buildBatchTx, isBound, rpc, address, createTransaction, queryClient],
  )

  return { evmAddress, submitTx, submitBatch, buildBatchTx, buildBatchCalls }
}

/**
 * Deposit HOLLAR and end up holding hDCL.
 *
 * Has two paths, chosen at build-time by `BIL_HAS_AAVE_LAYER`:
 *
 *  (a) Aave layer deployed: routes through `BILDepositZap`, which
 *      atomically does HOLLAR.transferFrom → vault.deposit → pool.supply
 *      and ends with the user holding aBIL (the Aave receipt) as
 *      collateral. Batched call: [HOLLAR.approve(zap), zap.depositAndSupply].
 *
 *  (b) Vault-only (lark-2 today): direct call to
 *      `vault.deposit(assets, receiver)`. User ends with raw hDCL in
 *      their wallet — no aToken because there's no money market yet.
 *      Batched call: [HOLLAR.approve(vault), vault.deposit].
 */
export function useDeposit() {
  const { t } = useTranslation(["common"])
  const { evm } = useRpcProvider()
  const { evmAddress, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (hollarAmount: number) => {
      const hollarBig = parseUnits(hollarAmount.toString(), 18)
      const calls: BatchEvmCall[] = []

      if (BIL_HAS_AAVE_LAYER) {
        if (
          BIL_DEPOSIT_ZAP_ADDRESS ===
          "0x0000000000000000000000000000000000000000"
        ) {
          throw new Error(
            "BILDepositZap address not configured — deploy via " +
              "`npx hardhat deploy-BILDepositZap` and update " +
              "BIL_DEPOSIT_ZAP_ADDRESS in modules/strategies/bil/constants.ts",
          )
        }

        const hollarAllowance = await evm.readContract({
          address: HOLLAR_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [evmAddress, BIL_DEPOSIT_ZAP_ADDRESS],
        })

        if (hollarAllowance < hollarBig) {
          calls.push({
            to: HOLLAR_ADDRESS,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "approve",
              args: [BIL_DEPOSIT_ZAP_ADDRESS, hollarBig],
            }),
            abi: [...ERC20_ABI],
          })
        }

        calls.push({
          to: BIL_DEPOSIT_ZAP_ADDRESS,
          data: encodeFunctionData({
            abi: BIL_DEPOSIT_ZAP_ABI,
            functionName: "depositAndSupply",
            args: [hollarBig],
          }),
          abi: [...BIL_DEPOSIT_ZAP_ABI],
        })
      } else {
        // Vault-only mode: approve vault, then call vault.deposit directly.
        const hollarAllowance = await evm.readContract({
          address: HOLLAR_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [evmAddress, VAULT_ADDRESS],
        })

        if (hollarAllowance < hollarBig) {
          calls.push({
            to: HOLLAR_ADDRESS,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "approve",
              args: [VAULT_ADDRESS, hollarBig],
            }),
            abi: [...ERC20_ABI],
          })
        }

        calls.push({
          to: VAULT_ADDRESS,
          data: encodeFunctionData({
            abi: VAULT_ABI,
            functionName: "deposit",
            args: [hollarBig, evmAddress],
          }),
          abi: [...VAULT_ABI],
        })
      }

      const fmt = t("currency", {
        value: hollarAmount,
        symbol: "HOLLAR",
        maximumFractionDigits: 2,
      })
      return submitBatch(
        calls,
        {
          submitted: `Depositing ${fmt}...`,
          success: `${fmt} deposited`,
        },
        [[BIL_QUERY_KEY_PREFIX]],
      )
    },
  })
}

/**
 * Request a redemption of `bilAmount` hDCL for HOLLAR via the async queue.
 *
 *  (a) Aave layer: pool.withdraw burns the user's aBIL into raw BIL, then
 *      vault.requestRedeem queues it. Atomic two-call batch.
 *
 *  (b) Vault-only: direct call to
 *      `vault.requestRedeem(shares, controller, owner)`. User must already
 *      hold the raw hDCL.
 */
export function useRequestRedeem() {
  const { t } = useTranslation(["common"])
  const { evmAddress, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: (bilAmount: number) => {
      const bilBig = parseUnits(bilAmount.toString(), 18)

      const calls: BatchEvmCall[] = []
      if (BIL_HAS_AAVE_LAYER) {
        calls.push({
          to: BIL_POOL_ADDRESS,
          data: encodeFunctionData({
            abi: BIL_POOL_ABI,
            functionName: "withdraw",
            args: [DCL_PRECOMPILE_ADDRESS, bilBig, evmAddress],
          }),
          abi: [...BIL_POOL_ABI],
        })
      }
      calls.push({
        to: VAULT_ADDRESS,
        data: encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "requestRedeem",
          args: [bilBig, evmAddress, evmAddress],
        }),
        abi: [...VAULT_ABI],
      })

      const fmt = t("currency", {
        value: bilAmount,
        symbol: "BIL",
        maximumFractionDigits: 2,
      })
      return submitBatch(
        calls,
        {
          submitted: `Requesting ${fmt} withdrawal...`,
          success: `${fmt} withdrawal requested`,
        },
        [[BIL_QUERY_KEY_PREFIX]],
      )
    },
  })
}

/**
 * Recovery: user has raw BIL sitting in their wallet (legacy from before
 * the batched-deposit refactor) and wants to supply it as Aave collateral.
 * Single call — Hydration's pool pulls substrate-asset collateral via the
 * precompile without an ERC20 approve gate.
 *
 *   POOL.supply(PRECOMPILE, amount, user, 0)
 *
 * Only meaningful when the Aave layer is live. Disabled in vault-only mode.
 */
export function useSupplyRawBil() {
  const { t } = useTranslation(["common"])
  const { evm } = useRpcProvider()
  const { evmAddress, submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (bilAmountHint: number) => {
      if (!BIL_HAS_AAVE_LAYER) {
        throw new Error(
          "Cannot supply BIL as collateral — Aave layer not deployed on this network",
        )
      }
      const bilBig = await evm.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "balanceOf",
        args: [evmAddress],
      })

      if (bilBig === 0n) {
        throw new Error("No raw BIL balance to supply")
      }

      const data = encodeFunctionData({
        abi: BIL_POOL_ABI,
        functionName: "supply",
        args: [DCL_PRECOMPILE_ADDRESS, bilBig, evmAddress, 0],
      })

      const fmt = t("currency", {
        value: bilAmountHint,
        symbol: "BIL",
        maximumFractionDigits: 2,
      })
      return submitTx(BIL_POOL_ADDRESS, data, [...BIL_POOL_ABI], {
        submitted: `Supplying ${fmt} as collateral...`,
        success: `${fmt} supplied`,
      })
    },
  })
}

/**
 * Direct vault redeem-request when the user already holds raw hDCL — same
 * codepath that `useRequestRedeem` lands on in vault-only mode, but exposed
 * as its own hook for the (legacy) "raw BIL in wallet" recovery row.
 *
 * New signature: requestRedeem(shares, controller, owner) — caller's EVM
 * address fills both controller and owner.
 */
export function useRequestRedeemRaw() {
  const { t } = useTranslation(["common"])
  const { evmAddress, submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (bilAmount: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [parseUnits(bilAmount.toString(), 18), evmAddress, evmAddress],
      })

      const fmt = t("currency", {
        value: bilAmount,
        symbol: "BIL",
        maximumFractionDigits: 2,
      })
      return submitTx(
        VAULT_ADDRESS,
        data,
        [...VAULT_ABI],
        {
          submitted: `Requesting ${fmt} withdrawal...`,
          success: `${fmt} withdrawal requested`,
        },
        [[BIL_QUERY_KEY_PREFIX]],
      )
    },
  })
}

/**
 * Cancel a queued redemption request.
 *
 *  (a) Aave layer: cancel returns the unsettled hDCL to the user's wallet,
 *      then a follow-up `pool.supply` re-supplies it as aBIL collateral.
 *      The 5-tuple from `getRedemptionRequest` is used to size the resupply.
 *
 *  (b) Vault-only: single `vault.cancelRedeem(requestId)` call. The
 *      unsettled hDCL lands in the user's wallet as raw hDCL.
 *
 * `getRedemptionRequest` tuple changed at lark-2:
 *   (user, bilAmount, bilSettled, hollarOwed, active) — was 4-tuple.
 *   The "still queued" portion = bilAmount - bilSettled. The settled
 *   portion stays claimable via `redeem` / `withdraw` and is NOT returned
 *   by cancel.
 */
export function useCancelRedeem() {
  const { evm } = useRpcProvider()
  const { evmAddress, submitTx, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (requestId: number) => {
      const [, bilAmount, bilSettled, , active] = await evm.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getRedemptionRequest",
        args: [BigInt(requestId)],
      })

      if (!active) {
        throw new Error(
          `Redemption request ${requestId} is no longer active (already fulfilled or cancelled)`,
        )
      }

      const returnAmount = bilAmount - bilSettled

      if (!BIL_HAS_AAVE_LAYER) {
        const data = encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "cancelRedeem",
          args: [BigInt(requestId)],
        })
        return submitTx(
          VAULT_ADDRESS,
          data,
          [...VAULT_ABI],
          {
            submitted: "Cancelling withdrawal...",
            success: "Withdrawal cancelled",
          },
          [[BIL_QUERY_KEY_PREFIX]],
        )
      }

      const calls = buildCancelResupplyCalls(
        requestId,
        returnAmount,
        evmAddress,
      )

      return submitBatch(
        calls,
        {
          submitted: "Cancelling withdrawal...",
          success: "Withdrawal cancelled",
        },
        [[BIL_QUERY_KEY_PREFIX]],
      )
    },
  })
}

export function useInstantRedeemFromQueue() {
  const { t } = useTranslation(["common"])
  const { evm, sdk, papi } = useRpcProvider()
  const { account } = useAccount()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const { createTransaction } = useTransactionsStore()
  const { evmAddress, buildBatchCalls } = useVaultEvmCall()
  const address = account?.address ?? ""

  return useMutation({
    mutationFn: async ({
      requestId,
      bilAmount,
    }: {
      requestId: number
      bilAmount: number
    }) => {
      if (!BIL_HAS_AAVE_LAYER) {
        throw new Error(
          "Instant redeem from queue requires the Aave layer (aBIL)",
        )
      }

      const [, bilAmountBig, bilSettled, , active] = await evm.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getRedemptionRequest",
        args: [BigInt(requestId)],
      })

      if (!active) {
        throw new Error(
          `Redemption request ${requestId} is no longer active (already fulfilled or cancelled)`,
        )
      }

      const returnAmount = bilAmountBig - bilSettled

      const cancelCalls = buildCancelResupplyCalls(
        requestId,
        returnAmount,
        evmAddress,
      )

      const evmInner = await buildBatchCalls(cancelCalls)

      const swap = await sdk.api.router.getBestSell(
        Number(STABLESWAP_BIL_ASSET_ID),
        Number(HOLLAR_ASSET_ID),
        bilAmount.toString(),
      )
      const swapTx = await sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(address)
        .build()

      const batchTx = papi.tx.Utility.batch_all({
        calls: [...evmInner, swapTx.get().decodedCall],
      })

      const fmt = t("currency", {
        value: bilAmount,
        symbol: "BIL",
        maximumFractionDigits: 2,
      })

      return createTransaction({
        tx: batchTx,
        toasts: {
          submitted: `Instant-redeeming ${fmt} for HOLLAR...`,
          success: `${fmt} redeemed for HOLLAR`,
          error: `Instant redeem failed`,
        },
        invalidateQueries: [[BIL_QUERY_KEY_PREFIX]],
      })
    },
  })
}

/**
 * Claim settled HOLLAR from one or more (already-settled) redemption
 * requests. Goes through `vault.redeem(shares, receiver, controller)`,
 * which walks the controller's settled inventory back-to-front.
 *
 * Pass the number of settled hDCL shares to drain — read from
 * `maxRedeem(controller)` for "claim all", or from
 * `claimableRedeemRequest(requestId, controller)` for a single request.
 */
export function useClaim() {
  const { t } = useTranslation(["common"])
  const { evmAddress, submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (shares: bigint) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "redeem",
        args: [shares, evmAddress, evmAddress],
      })

      const fmt = t("currency", {
        value: Number(shares) / 1e18,
        symbol: "BIL",
        maximumFractionDigits: 2,
      })
      return submitTx(
        VAULT_ADDRESS,
        data,
        [...VAULT_ABI],
        {
          submitted: `Claiming ${fmt} → HOLLAR...`,
          success: `Claim sent`,
        },
        [[BIL_QUERY_KEY_PREFIX]],
      )
    },
  })
}

/**
 * Opt the connected wallet in/out of keeper-bot auto-claim. When enabled
 * (and a CLAIM_OPERATOR_ROLE holder is running), the keeper will call
 * `redeem(shares, controller, controller)` on the user's behalf as soon as
 * their requests settle. The role only grants the *timing* of the claim —
 * funds are always paid to the controller's own address.
 */
export function useSetAutoClaim() {
  const { submitTx } = useVaultEvmCall()
  return useMutation({
    mutationFn: (enabled: boolean) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "setAutoClaim",
        args: [enabled],
      })
      return submitTx(
        VAULT_ADDRESS,
        data,
        [...VAULT_ABI],
        {
          submitted: enabled
            ? "Enabling auto-claim..."
            : "Disabling auto-claim...",
          success: enabled ? "Auto-claim enabled" : "Auto-claim disabled",
        },
        [[BIL_QUERY_KEY_PREFIX]],
      )
    },
  })
}
