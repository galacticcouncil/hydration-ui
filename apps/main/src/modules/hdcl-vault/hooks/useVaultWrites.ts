import { safeConvertSS58toH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { type Abi, encodeFunctionData, type Hex, parseUnits } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import {
  ERC20_ABI,
  EVM_CALL_GAS,
  getVaultEvmClient,
  HDCL_DEPOSIT_ZAP_ABI,
  HDCL_DEPOSIT_ZAP_ADDRESS,
  HDCL_POOL_ABI,
  HDCL_POOL_ADDRESS,
  HDCL_PRECOMPILE_ADDRESS,
  HOLLAR_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/hdcl-vault/constants"
import { formatNumber } from "@/modules/hdcl-vault/utils/format"
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
      const gasPrice = await getVaultEvmClient().getGasPrice()
      const gasPricePlus = gasPrice + gasPrice / 100n

      const evmCall = {
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
    [evmAddress, isBound, rpc, address, createTransaction, queryClient],
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

      const gasPrice = await getVaultEvmClient().getGasPrice()
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
    [evmAddress, isBound, rpc, address, createTransaction, queryClient],
  )

  return { evmAddress, submitTx, submitBatch }
}

/**
 * Deposit HOLLAR and end up holding aHDCL (already supplied as collateral
 * on the HDCL Aave pool) in one signed transaction.
 *
 * Routes through the on-chain `HDCLDepositZap` helper, which atomically does:
 *   HOLLAR.transferFrom(user, zap, amount)
 *   VAULT.deposit(amount)              — returns hdclMinted
 *   POOL.supply(precompile, hdclMinted, user, 0)
 *
 * The previous version of this hook predicted the mint amount off-chain via
 * `vault.previewDeposit` and supplied that — which left dust in the wallet
 * whenever yield had accrued between read and execute, and intermittently
 * reverted when drift exceeded the safety margin. The zap reads the actual
 * `vault.deposit` return value on-chain so the supply step always pulls the
 * exact mint, eliminating both the dust and the failure mode.
 *
 * Substrate flow:
 *   batch_all([
 *     HOLLAR.approve(zap, hollarAmount)    — only if allowance < amount
 *     zap.depositAndSupply(hollarAmount)   — atomic deposit + supply
 *   ])
 */
export function useDeposit() {
  const { evmAddress, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (hollarAmount: number) => {
      if (
        HDCL_DEPOSIT_ZAP_ADDRESS ===
        "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error(
          "HDCLDepositZap address not configured — deploy via " +
            "`npx hardhat deploy-HDCLDepositZap` and update " +
            "HDCL_DEPOSIT_ZAP_ADDRESS in modules/hdcl-vault/constants.ts",
        )
      }

      const hollarBig = parseUnits(hollarAmount.toString(), 18)

      const hollarAllowance = await getVaultEvmClient().readContract({
        address: HOLLAR_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [evmAddress, HDCL_DEPOSIT_ZAP_ADDRESS],
      })

      const calls: BatchEvmCall[] = []

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

      const fmt = formatNumber(hollarAmount, 2)
      return submitBatch(
        calls,
        {
          submitted: `Depositing ${fmt} HOLLAR...`,
          success: `${fmt} HOLLAR deposited`,
        },
        [["hdcl-vault"], ["hdcl-pool-position"]],
      )
    },
  })
}

/**
 * Withdraw aHDCL collateral and queue it for HOLLAR redemption — atomic
 * single-signature flow.
 *
 * Two-call batch:
 *   1. POOL.withdraw(VAULT_ADDRESS, hdclAmount, user)  — burns aHDCL, returns raw HDCL
 *   2. VAULT.requestRedeem(hdclAmount)                 — queues raw HDCL for HOLLAR
 *
 * Assumes the source is the user's pool position. Legacy raw-HDCL positions
 * (pre-batched-deposit world) are surfaced as a separate row in My positions
 * with their own button → `useRequestRedeemRaw` below.
 */
export function useRequestRedeem() {
  const { evmAddress, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: (hdclAmount: number) => {
      const hdclBig = parseUnits(hdclAmount.toString(), 18)

      const calls: BatchEvmCall[] = [
        {
          to: HDCL_POOL_ADDRESS,
          data: encodeFunctionData({
            abi: HDCL_POOL_ABI,
            functionName: "withdraw",
            args: [HDCL_PRECOMPILE_ADDRESS, hdclBig, evmAddress],
          }),
          abi: [...HDCL_POOL_ABI],
        },
        {
          to: VAULT_ADDRESS,
          data: encodeFunctionData({
            abi: VAULT_ABI,
            functionName: "requestRedeem",
            args: [hdclBig],
          }),
          abi: [...VAULT_ABI],
        },
      ]

      const fmt = formatNumber(hdclAmount, 2)
      return submitBatch(
        calls,
        {
          submitted: `Requesting ${fmt} HDCL withdrawal...`,
          success: `${fmt} HDCL withdrawal requested`,
        },
        [["hdcl-vault"], ["hdcl-pool-position"]],
      )
    },
  })
}

/**
 * Recovery: user has raw HDCL sitting in their wallet (e.g. left over from a
 * partial deposit batch) and wants to complete the deposit by supplying it
 * as collateral. Single call — Hydration's pool pulls substrate-asset
 * collateral via the precompile without an ERC20 approve gate.
 *
 *   POOL.supply(PRECOMPILE, amount, user, 0)
 *
 * The amount is read fresh from `vault.balanceOf(user)` at mutation time
 * rather than reused from the cached `userBalances.hdclRaw` Number — that
 * Number is `Number(formatUnits(bigint, 18))` and loses precision past
 * ~16 sig figs, so re-parsing it through parseUnits can produce a wei
 * value that's slightly larger than the on-chain balance and reverts
 * pool.supply with insufficient balance. Reading the bigint directly
 * eliminates the round-trip entirely.
 *
 * The `hdclAmountHint` arg is for the toast text only.
 */
export function useSupplyRawHdcl() {
  const { evmAddress, submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (hdclAmountHint: number) => {
      const hdclBig = await getVaultEvmClient().readContract({
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

      const fmt = formatNumber(hdclAmountHint, 2)
      return submitTx(HDCL_POOL_ADDRESS, data, [...HDCL_POOL_ABI], {
        submitted: `Supplying ${fmt} HDCL as collateral...`,
        success: `${fmt} HDCL supplied`,
      })
    },
  })
}

/**
 * Edge-case path: user holds raw HDCL in their wallet (legacy from before
 * the batched-deposit refactor) and wants to redeem it directly without
 * round-tripping through the pool. Single call:
 *
 *   VAULT.requestRedeem(hdclAmount)
 *
 * Surfaced via the secondary "raw" row in My positions, which only appears
 * when `useUserBalances.hdclRaw > 0`. New deposits never produce raw HDCL
 * (they're auto-supplied), so this row eventually disappears for everyone.
 */
export function useRequestRedeemRaw() {
  const { submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (hdclAmount: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [parseUnits(hdclAmount.toString(), 18)],
      })

      const fmt = formatNumber(hdclAmount, 2)
      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: `Requesting ${fmt} HDCL withdrawal...`,
        success: `${fmt} HDCL withdrawal requested`,
      })
    },
  })
}

/**
 * Cancel a queued redemption request and put the freed HDCL back to work
 * as collateral — atomic single-signature flow.
 *
 * The contract returns un-fulfilled HDCL to the user's wallet as raw HDCL,
 * but the user-facing model is that "HDCL" always lives in the pool. So we:
 *   1. Read `vault.getRedemptionRequest(requestId)` to know the un-fulfilled amount
 *   2. VAULT.cancelRedeem(requestId)        — raw HDCL returned to wallet
 *   3. VAULT.approve(POOL, returnAmount)     — let the pool pull it
 *   4. POOL.supply(VAULT, returnAmount, user, 0)  — re-mints aHDCL to user
 *
 * Steps 2-4 are bundled. The "approve" step is unconditional here for
 * simplicity — a previous deposit may have left non-max allowance and the
 * exact-match approval keeps state simple.
 */
export function useCancelRedeem() {
  const { evmAddress, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: async (requestId: number) => {
      // Read the request to predict how much HDCL will be returned. Steps
      // 2-4 sit in the same atomic batch so the state read here is the
      // state the cancelRedeem will see (modulo concurrent fulfillments,
      // which would revert the whole batch).
      const [, hdclAmount, hdclFulfilled, active] =
        await getVaultEvmClient().readContract({
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

      const returnAmount = hdclAmount - hdclFulfilled

      // Two-call batch: cancel returns raw HDCL → re-supply back into the
      // pool. Assumes HDCL pool is whitelisted in EVMAccounts, same as
      // `useDeposit` — once whitelisted, no precompile.approve is needed.
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
