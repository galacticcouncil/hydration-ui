import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { safeConvertSS58toH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { type Abi, encodeFunctionData, type Hex, parseUnits } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import {
  ERC20_ABI,
  EVM_CALL_GAS,
  HDCL_DEPOSIT_ZAP_ABI,
  HDCL_DEPOSIT_ZAP_ADDRESS,
  HDCL_HAS_AAVE_LAYER,
  HDCL_POOL_ABI,
  HDCL_POOL_ADDRESS,
  HDCL_PRECOMPILE_ADDRESS,
  HOLLAR_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/strategies/hdcl/constants"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

/** A single EVM call to be wrapped + bundled into a substrate batch. */
interface BatchEvmCall {
  to: Hex
  data: Hex
  abi: Abi
}

function useVaultEvmCall() {
  const { evm } = useRpcProvider()

  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))

  const submitTx = useCallback(
    async (
      to: Hex,
      data: Hex,
      abi: Abi,
      toasts: { submitted: string; success: string },
    ) => {
      const gasPrice = await evm.getGasPrice()
      const gasPricePlus = gasPrice + gasPrice / 100n

      const evmCall: ExtendedEvmCall = {
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPricePlus,
        maxPriorityFeePerGas: gasPricePlus,
        abi: safeStringify(abi),
      }

      // If account not yet bound to EVM, batch bind + evm call
      if (isBound === false) {
        const bindTx = rpc.papi.tx.EVMAccounts.bind_evm_address()
        const evmPapiTx = transformEvmCallToPapiTx(rpc.papi, evmCall)
        const batchTx = rpc.papi.tx.Utility.batch_all({
          calls: [bindTx.decodedCall, evmPapiTx.decodedCall],
        })

        return createTransaction(
          { tx: batchTx, toasts },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["hdcl-vault"] })
              queryClient.invalidateQueries(
                evmAccountBindingQuery(rpc, address),
              )
            },
          },
        )
      }

      return createTransaction(
        { tx: evmCall, toasts },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hdcl-vault"] })
          },
        },
      )
    },
    [evmAddress, isBound, rpc, address, createTransaction, queryClient, evm],
  )

  /**
   * Submit N EVM calls atomically as a single substrate `Utility.batch_all`.
   * Each call is wrapped through `transformEvmCallToPapiTx` then bundled.
   * If the user isn't yet bound to their EVM mapping, prepends the bind tx
   * to the same batch so binding happens atomically with the first call.
   *
   * Used by the deposit flow (HOLLAR.approve → vault.deposit → HDCL.approve
   * → pool.supply) and any other multi-step on-chain operation.
   */
  const submitBatch = useCallback(
    async (
      calls: BatchEvmCall[],
      toasts: { submitted: string; success: string },
      invalidateKeys: string[][] = [["hdcl-vault"]],
    ) => {
      if (calls.length === 0) {
        throw new Error("submitBatch called with no calls")
      }

      const gasPrice = await evm.getGasPrice()
      const gasPricePlus = gasPrice + gasPrice / 100n

      const evmCalls = calls.map(({ to, data, abi }) => ({
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPricePlus,
        maxPriorityFeePerGas: gasPricePlus,
        abi: safeStringify(abi),
      }))

      const papiCalls = evmCalls.map(
        (c) => transformEvmCallToPapiTx(rpc.papi, c).decodedCall,
      )

      const batchInner =
        isBound === false
          ? [
              rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              ...papiCalls,
            ]
          : papiCalls

      const batchTx = rpc.papi.tx.Utility.batch_all({ calls: batchInner })

      return createTransaction(
        { tx: batchTx, toasts },
        {
          onSuccess: () => {
            for (const k of invalidateKeys) {
              queryClient.invalidateQueries({ queryKey: k })
            }
            if (isBound === false) {
              queryClient.invalidateQueries(
                evmAccountBindingQuery(rpc, address),
              )
            }
          },
        },
      )
    },
    [evmAddress, isBound, rpc, address, createTransaction, queryClient, evm],
  )

  return { evmAddress, submitTx, submitBatch }
}

/**
 * Deposit HOLLAR and end up holding hDCL.
 *
 * Has two paths, chosen at build-time by `HDCL_HAS_AAVE_LAYER`:
 *
 *  (a) Aave layer deployed: routes through `HDCLDepositZap`, which
 *      atomically does HOLLAR.transferFrom → vault.deposit → pool.supply
 *      and ends with the user holding aHDCL (the Aave receipt) as
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

      if (HDCL_HAS_AAVE_LAYER) {
        if (
          HDCL_DEPOSIT_ZAP_ADDRESS ===
          "0x0000000000000000000000000000000000000000"
        ) {
          throw new Error(
            "HDCLDepositZap address not configured — deploy via " +
              "`npx hardhat deploy-HDCLDepositZap` and update " +
              "HDCL_DEPOSIT_ZAP_ADDRESS in modules/strategies/hdcl/constants.ts",
          )
        }

        const hollarAllowance = await evm.readContract({
          address: HOLLAR_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [evmAddress, HDCL_DEPOSIT_ZAP_ADDRESS],
        })

        if (hollarAllowance < hollarBig) {
          calls.push({
            to: HOLLAR_ADDRESS,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "approve",
              args: [HDCL_DEPOSIT_ZAP_ADDRESS, hollarBig],
            }),
            abi: [...ERC20_ABI],
          })
        }

        calls.push({
          to: HDCL_DEPOSIT_ZAP_ADDRESS,
          data: encodeFunctionData({
            abi: HDCL_DEPOSIT_ZAP_ABI,
            functionName: "depositAndSupply",
            args: [hollarBig],
          }),
          abi: [...HDCL_DEPOSIT_ZAP_ABI],
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
        [["hdcl-vault"], ["hdcl-pool-position"]],
      )
    },
  })
}

/**
 * Request a redemption of `hdclAmount` hDCL for HOLLAR via the async queue.
 *
 *  (a) Aave layer: pool.withdraw burns the user's aHDCL into raw HDCL, then
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
    mutationFn: (hdclAmount: number) => {
      const hdclBig = parseUnits(hdclAmount.toString(), 18)

      const calls: BatchEvmCall[] = []
      if (HDCL_HAS_AAVE_LAYER) {
        calls.push({
          to: HDCL_POOL_ADDRESS,
          data: encodeFunctionData({
            abi: HDCL_POOL_ABI,
            functionName: "withdraw",
            args: [HDCL_PRECOMPILE_ADDRESS, hdclBig, evmAddress],
          }),
          abi: [...HDCL_POOL_ABI],
        })
      }
      calls.push({
        to: VAULT_ADDRESS,
        data: encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "requestRedeem",
          args: [hdclBig, evmAddress, evmAddress],
        }),
        abi: [...VAULT_ABI],
      })

      const fmt = t("currency", {
        value: hdclAmount,
        symbol: "HDCL",
        maximumFractionDigits: 2,
      })
      return submitBatch(
        calls,
        {
          submitted: `Requesting ${fmt} withdrawal...`,
          success: `${fmt} withdrawal requested`,
        },
        [["hdcl-vault"], ["hdcl-pool-position"]],
      )
    },
  })
}

/**
 * Recovery: user has raw HDCL sitting in their wallet (legacy from before
 * the batched-deposit refactor) and wants to supply it as Aave collateral.
 * Single call — Hydration's pool pulls substrate-asset collateral via the
 * precompile without an ERC20 approve gate.
 *
 *   POOL.supply(PRECOMPILE, amount, user, 0)
 *
 * Only meaningful when the Aave layer is live. Disabled in vault-only mode.
 */
export function useSupplyRawHdcl() {
  const { t } = useTranslation(["common"])
  const { evm } = useRpcProvider()
  const { evmAddress, submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (hdclAmountHint: number) => {
      if (!HDCL_HAS_AAVE_LAYER) {
        throw new Error(
          "Cannot supply HDCL as collateral — Aave layer not deployed on this network",
        )
      }
      const hdclBig = await evm.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "balanceOf",
        args: [evmAddress],
      })

      if (hdclBig === 0n) {
        throw new Error("No raw HDCL balance to supply")
      }

      const data = encodeFunctionData({
        abi: HDCL_POOL_ABI,
        functionName: "supply",
        args: [HDCL_PRECOMPILE_ADDRESS, hdclBig, evmAddress, 0],
      })

      const fmt = t("currency", {
        value: hdclAmountHint,
        symbol: "HDCL",
        maximumFractionDigits: 2,
      })
      return submitTx(HDCL_POOL_ADDRESS, data, [...HDCL_POOL_ABI], {
        submitted: `Supplying ${fmt} as collateral...`,
        success: `${fmt} supplied`,
      })
    },
  })
}

/**
 * Direct vault redeem-request when the user already holds raw hDCL — same
 * codepath that `useRequestRedeem` lands on in vault-only mode, but exposed
 * as its own hook for the (legacy) "raw HDCL in wallet" recovery row.
 *
 * New signature: requestRedeem(shares, controller, owner) — caller's EVM
 * address fills both controller and owner.
 */
export function useRequestRedeemRaw() {
  const { t } = useTranslation(["common"])
  const { evmAddress, submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (hdclAmount: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [parseUnits(hdclAmount.toString(), 18), evmAddress, evmAddress],
      })

      const fmt = t("currency", {
        value: hdclAmount,
        symbol: "HDCL",
        maximumFractionDigits: 2,
      })
      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: `Requesting ${fmt} withdrawal...`,
        success: `${fmt} withdrawal requested`,
      })
    },
  })
}

/**
 * Cancel a queued redemption request.
 *
 *  (a) Aave layer: cancel returns the unsettled hDCL to the user's wallet,
 *      then a follow-up `pool.supply` re-supplies it as aHDCL collateral.
 *      The 5-tuple from `getRedemptionRequest` is used to size the resupply.
 *
 *  (b) Vault-only: single `vault.cancelRedeem(requestId)` call. The
 *      unsettled hDCL lands in the user's wallet as raw hDCL.
 *
 * `getRedemptionRequest` tuple changed at lark-2:
 *   (user, hdclAmount, hdclSettled, hollarOwed, active) — was 4-tuple.
 *   The "still queued" portion = hdclAmount - hdclSettled. The settled
 *   portion stays claimable via `redeem` / `withdraw` and is NOT returned
 *   by cancel.
 */
export function useCancelRedeem() {
  const { evm } = useRpcProvider()
  const { evmAddress, submitTx, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (requestId: number) => {
      const [, hdclAmount, hdclSettled, , active] = await evm.readContract({
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

      const returnAmount = hdclAmount - hdclSettled

      if (!HDCL_HAS_AAVE_LAYER) {
        const data = encodeFunctionData({
          abi: VAULT_ABI,
          functionName: "cancelRedeem",
          args: [BigInt(requestId)],
        })
        return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
          submitted: "Cancelling withdrawal...",
          success: "Withdrawal cancelled",
        })
      }

      const calls: BatchEvmCall[] = [
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
          to: HDCL_POOL_ADDRESS,
          data: encodeFunctionData({
            abi: HDCL_POOL_ABI,
            functionName: "supply",
            args: [HDCL_PRECOMPILE_ADDRESS, returnAmount, evmAddress, 0],
          }),
          abi: [...HDCL_POOL_ABI],
        },
      ]

      return submitBatch(
        calls,
        {
          submitted: "Cancelling withdrawal...",
          success: "Withdrawal cancelled",
        },
        [["hdcl-vault"], ["hdcl-pool-position"]],
      )
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
        symbol: "HDCL",
        maximumFractionDigits: 2,
      })
      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: `Claiming ${fmt} → HOLLAR...`,
        success: `Claim sent`,
      })
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
      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: enabled
          ? "Enabling auto-claim..."
          : "Disabling auto-claim...",
        success: enabled ? "Auto-claim enabled" : "Auto-claim disabled",
      })
    },
  })
}
