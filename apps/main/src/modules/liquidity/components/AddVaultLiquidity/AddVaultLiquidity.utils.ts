import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { safeConvertAnyToH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Abi, encodeFunctionData, Hex, parseAbi } from "viem"
import z from "zod/v4"

import { useAccountBalances } from "@/api/balances/account.hooks"
import { estimateGasLimit } from "@/api/borrow"
import { VaultState } from "@/api/vaults"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required } from "@/utils/validators"

// u128, not uint256: Hydration's asset precompiles hold balances as u128, so a
// MaxUint256 approval overflows and reverts.
const U128_MAX = (1n << 128n) - 1n

const EVM_CALL_GAS = 700_000

export const ERC20_APPROVE_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
])

export const UNIPROXY_ABI = parseAbi([
  "function deposit(uint256 deposit0, uint256 deposit1, address to, address pos, uint256[4] minIn) returns (uint256)",
  "function getDepositAmount(address pos, address token, uint256 _deposit) view returns (uint256 amountStart, uint256 amountEnd)",
])

/** Pair amount the vault accepts alongside `amount` of `token`, as a tolerance band */
export const useVaultDepositAmount = (
  vault: VaultState | null,
  token: Hex | undefined,
  amount: bigint | undefined,
) => {
  const { evm } = useRpcProvider()

  return useQuery({
    queryKey: ["vaultDepositAmount", vault?.address, token, amount?.toString()],
    enabled: !!vault && !!token && !!amount && amount > 0n,
    queryFn: async () => {
      if (!vault || !token || !amount) return null

      const [start, end] = await evm.readContract({
        abi: UNIPROXY_ABI,
        address: vault.uniProxy,
        functionName: "getDepositAmount",
        args: [vault.address, token, amount],
      })

      return { start, end, mid: (start + end) / 2n }
    },
  })
}

type DepositArgs = {
  vault: VaultState
  token0: Hex
  token1: Hex
  amount0: bigint
  amount1: bigint
}

// Approve both tokens and deposit in one signature. The spender is the
// Hypervisor (it runs safeTransferFrom), but deposit must go through the
// UniProxy, which applies the ClearingV2 guards. minIn is zeroed because
// directDeposit is off, so no position is minted here.
export const useVaultDeposit = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createBatchTx = useCreateBatchTx()

  const evmAddress = safeConvertAnyToH160(account?.address ?? "") as Hex

  return useCallback(
    async ({ vault, token0, token1, amount0, amount1 }: DepositArgs) => {
      const calls: { to: Hex; data: Hex; abi: Abi }[] = []

      const approvals: [Hex, bigint][] = [
        [token0, amount0],
        [token1, amount1],
      ]

      for (const [token, amount] of approvals) {
        if (amount === 0n) continue

        const allowance = await rpc.evm.readContract({
          abi: ERC20_APPROVE_ABI,
          address: token,
          functionName: "allowance",
          args: [evmAddress, vault.address],
        })

        if (allowance >= amount) continue

        calls.push({
          to: token,
          data: encodeFunctionData({
            abi: ERC20_APPROVE_ABI,
            functionName: "approve",
            args: [vault.address, U128_MAX],
          }),
          abi: [...ERC20_APPROVE_ABI],
        })
      }

      calls.push({
        to: vault.uniProxy,
        data: encodeFunctionData({
          abi: UNIPROXY_ABI,
          functionName: "deposit",
          args: [amount0, amount1, evmAddress, vault.address, [0n, 0n, 0n, 0n]],
        }),
        abi: [...UNIPROXY_ABI],
      })

      const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
        await estimateGasLimit({
          evm: rpc.evm,
          gasLimit: EVM_CALL_GAS.toString(),
        })

      const evmCalls: ExtendedEvmCall[] = calls.map(({ to, data, abi }) => ({
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit,
        maxFeePerGas: maxFeePerGas[0],
        maxPriorityFeePerGas: maxPriorityFeePerGas[0],
        abi: safeStringify(abi),
      }))

      return createBatchTx({
        txs: evmCalls.map((call) => transformEvmCallToPapiTx(rpc.papi, call)),
        transaction: {
          toasts: {
            submitted: "Depositing into the vault",
            success: "Deposited into the vault",
          },
          invalidateQueries: [["vault"], ["pools", "v3"]],
        },
      })
    },
    [evmAddress, rpc, createBatchTx],
  )
}

export type DepositBlockerKey =
  | "vaults.add.blocked.twap"
  | "vaults.add.blocked.cap"
  | "vaults.add.blocked.supplyCap"

export const orders = ["assetA", "assetB"] as const
type Order = (typeof orders)[number]

export type TAddVaultLiquidityFormValues = {
  lastUpdated: Order
  amountA: string
  amountB: string
  assetA: TAsset
  assetB: TAsset
}

// No fee headroom is reserved: an EVM call pays its fee in the account's
// fee-payment asset, which is neither leg of this pair.
const useAddVaultLiquidityZod = (balances: {
  amountA: string
  amountB: string
}) => {
  const { t } = useTranslation("liquidity")

  return z
    .object({
      amountA: required.pipe(positive),
      amountB: required.pipe(positive),
      assetA: z.custom<TAsset>(),
      assetB: z.custom<TAsset>(),
      lastUpdated: z.literal(["assetA", "assetB"]),
    })
    .refine(({ amountA }) => Big(amountA || "0").lte(balances.amountA), {
      error: t("liquidity.add.modal.validation.maxBalance"),
      path: ["amountA"],
    })
    .refine(({ amountB }) => Big(amountB || "0").lte(balances.amountB), {
      error: t("liquidity.add.modal.validation.maxBalance"),
      path: ["amountB"],
    })
}

export const useAddVaultLiquidity = ({
  vault,
  onSubmitted,
}: {
  vault: VaultTable
  onSubmitted: () => void
}) => {
  const { getTransferableBalance } = useAccountBalances()
  const deposit = useVaultDeposit()
  const [assetA, assetB] = vault.tokens
  const state = vault.vault

  const getMaxBalance = useCallback(
    (asset: TAsset) =>
      scaleHuman(getTransferableBalance(asset.id), asset.decimals),
    [getTransferableBalance],
  )

  const balances = useMemo(
    () => ({ amountA: getMaxBalance(assetA), amountB: getMaxBalance(assetB) }),
    [getMaxBalance, assetA, assetB],
  )

  const zodSchema = useAddVaultLiquidityZod(balances)

  const form = useForm<TAddVaultLiquidityFormValues>({
    mode: "onChange",
    defaultValues: {
      lastUpdated: "assetA",
      amountA: "",
      amountB: "",
      assetA,
      assetB,
    },
    resolver: standardSchemaResolver(zodSchema),
  })

  const lastUpdated = form.watch("lastUpdated")
  const amountA = form.watch("amountA")
  const amountB = form.watch("amountB")

  const typed = lastUpdated === "assetA" ? amountA : amountB
  const typedAsset = lastUpdated === "assetA" ? assetA : assetB
  const typedRaw = typed ? BigInt(scale(typed, typedAsset.decimals)) : 0n

  const { data: pair, isLoading: isPairLoading } = useVaultDepositAmount(
    state,
    lastUpdated === "assetA" ? state?.token0 : state?.token1,
    typedRaw,
  )

  const raw0 =
    lastUpdated === "assetA"
      ? typedRaw
      : amountA
        ? BigInt(scale(amountA, assetA.decimals))
        : 0n
  const raw1 =
    lastUpdated === "assetB"
      ? typedRaw
      : amountB
        ? BigInt(scale(amountB, assetB.decimals))
        : 0n

  /** Mirrors `Hypervisor.deposit`: value both legs in token1, then take a share */
  const shares = useMemo(() => {
    if (!state || raw0 === 0n) return null

    const PRECISION = 10n ** 18n
    const sqrt = vault.pool.sqrtPriceX96
    const price = (sqrt * sqrt * PRECISION) >> 192n

    const deposited = raw1 + (raw0 * price) / PRECISION
    if (state.totalSupply === 0n) return deposited

    const held = (state.total0 * price) / PRECISION + state.total1
    if (held === 0n) return deposited

    return (deposited * state.totalSupply) / held
  }, [state, raw0, raw1, vault.pool.sqrtPriceX96])

  const shareOfVault =
    shares && state
      ? Big(shares.toString())
          .div(Big(state.totalSupply.toString()).plus(shares.toString()))
          .times(100)
          .toString()
      : undefined

  // token1 per token0. The vault's composition is the rate a deposit is taken
  // at; an empty vault has none, so fall back to the pool's spot price.
  const price = useMemo(() => {
    if (state && state.total0 > 0n && state.total1 > 0n) {
      return Big(state.total1.toString())
        .div(Big(10).pow(assetB.decimals))
        .div(Big(state.total0.toString()).div(Big(10).pow(assetA.decimals)))
        .toString()
    }

    const sqrt = Big(vault.pool.sqrtPriceX96.toString())

    return sqrt
      .pow(2)
      .div(Big(2).pow(192))
      .times(Big(10).pow(assetA.decimals - assetB.decimals))
      .toString()
  }, [state, assetA.decimals, assetB.decimals, vault.pool.sqrtPriceX96])

  // getDepositAmount returns a band, not an answer: an empty vault accepts any
  // ratio and says so with [0, uint256 max]. Size from the rate, clamp to the band.
  const pairedAmount = useMemo(() => {
    if (!typed || typedRaw === 0n || !price) return undefined

    const rate = Big(price)
    if (!rate.gt(0)) return undefined

    const outDecimals =
      lastUpdated === "assetA" ? assetB.decimals : assetA.decimals

    // price is token1 per token0, so multiply going A->B and divide going B->A
    const estimate =
      lastUpdated === "assetA" ? Big(typed).times(rate) : Big(typed).div(rate)

    let raw = BigInt(scale(estimate.toFixed(outDecimals), outDecimals))

    if (pair) {
      if (raw < pair.start) raw = pair.start
      if (raw > pair.end) raw = pair.end
    }

    return scaleHuman(raw.toString(), outDecimals)
  }, [
    typed,
    typedRaw,
    price,
    pair,
    lastUpdated,
    assetA.decimals,
    assetB.decimals,
  ])

  // Each of these reverts on-chain, so disable the form with the reason instead
  // of letting the user sign a guaranteed failure.
  const blocker = useMemo<
    { key: DepositBlockerKey; symbol?: string } | undefined
  >(() => {
    if (!state) return undefined

    if (!state.twapOk) return { key: "vaults.add.blocked.twap" }

    if (raw0 > state.deposit0Max)
      return { key: "vaults.add.blocked.cap", symbol: assetA.symbol }
    if (raw1 > state.deposit1Max)
      return { key: "vaults.add.blocked.cap", symbol: assetB.symbol }

    if (
      state.supplyCap > 0n &&
      shares !== null &&
      state.totalSupply + shares > state.supplyCap
    )
      return { key: "vaults.add.blocked.supplyCap" }

    return undefined
  }, [state, raw0, raw1, shares, assetA.symbol, assetB.symbol])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if (!state || raw0 === 0n || raw1 === 0n || blocker) return

    setIsSubmitting(true)
    try {
      await deposit({
        vault: state,
        token0: state.token0,
        token1: state.token1,
        amount0: raw0,
        amount1: raw1,
      })
      onSubmitted()
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    assetA,
    assetB,
    getMaxBalance,
    pair,
    pairedAmount,
    isPairLoading,
    price,
    shares,
    shareOfVault,
    blocker,
    submit,
    isSubmitting,
  }
}
