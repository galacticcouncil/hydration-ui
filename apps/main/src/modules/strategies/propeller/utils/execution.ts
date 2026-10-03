import {
  decodeFunctionResult,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  type PublicClient,
  zeroAddress,
} from "viem"

import {
  EXECUTION_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

export type ExecutionFill = {
  lane: Hex
  amountIn: bigint
  amountOut: bigint
}

// This tightens the contract's independent oracle floor; it never replaces it.
export const DEPOSIT_QUOTE_DRIFT_BPS = 2n
const MAX_NATIVE_TX_GAS = 1n << 24n

export const executionQuotes = (
  fills: readonly ExecutionFill[],
  driftBps = DEPOSIT_QUOTE_DRIFT_BPS,
) => {
  if (driftBps < 0n || driftBps >= 10_000n || !fills.length)
    throw new Error("No executable deposit quote is available")
  const lanes = new Set<string>()
  return fills.map(({ lane, amountIn, amountOut }) => {
    if (amountIn <= 0n || amountOut <= 0n || lanes.has(lane.toLowerCase()))
      throw new Error("Invalid or repeated deposit quote route")
    lanes.add(lane.toLowerCase())
    const minOut = (amountOut * (10_000n - driftBps)) / 10_000n
    if (!minOut) throw new Error("Deposit quote output is too small")
    return { lane, amountIn, minOut }
  })
}

/** Prepare only after approval is confirmed: preview executes the real transfer. */
export const prepareControlledDeposit = async (
  client: PublicClient,
  {
    vault,
    asset,
    owner,
    amount,
  }: { vault: Hex; asset: Hex; owner: Hex; amount: bigint },
  wait = () => new Promise<void>((resolve) => setTimeout(resolve, 1_000)),
) => {
  if (amount <= 0n || owner === zeroAddress)
    throw new Error("A positive deposit and connected account are required")

  // The reference must be older than the execution block. Wait briefly when
  // an approval has just landed and is not present in the previous block yet.
  let head = await client.getBlock({ blockTag: "latest" })
  let block = await client.getBlock({ blockNumber: head.number - 1n })
  for (let attempt = 0; ; attempt++) {
    const allowance = await client.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, vault],
      blockNumber: block.number,
    })
    if (allowance >= amount) break
    if (attempt >= 15)
      throw new Error(
        "Approval is not confirmed at the quote block. Please retry.",
      )
    await wait()
    head = await client.getBlock({ blockTag: "latest" })
    block = await client.getBlock({ blockNumber: head.number - 1n })
  }
  const controller = await client.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "executionController",
    blockNumber: block.number,
  })
  if (controller === zeroAddress)
    throw new Error("Controlled deposits are not configured for this vault")

  const data = encodeFunctionData({
    abi: VAULT_ABI,
    functionName: "deposit",
    args: [amount, owner],
  })
  const [maxAge, maxBlocks, preview] = await Promise.all([
    client.readContract({
      address: controller,
      abi: EXECUTION_ABI,
      functionName: "maxQuoteAge",
      blockNumber: block.number,
    }),
    client.readContract({
      address: controller,
      abi: EXECUTION_ABI,
      functionName: "maxQuoteBlocks",
      blockNumber: block.number,
    }),
    client.simulateContract({
      account: owner,
      address: controller,
      abi: EXECUTION_ABI,
      functionName: "preview",
      args: [vault, data],
      blockNumber: block.number,
      gas: MAX_NATIVE_TX_GAS,
    }),
  ])
  const [result, fills] = preview.result
  const shares = decodeFunctionResult({
    abi: VAULT_ABI,
    functionName: "deposit",
    data: result,
  })
  if (!shares) throw new Error("The deposit would receive no shares")
  const quotes = executionQuotes(fills)
  const deadline = block.timestamp + (maxAge < 90n ? maxAge : 90n)
  const current = await client.getBlock({ blockTag: "latest" })
  if (
    current.timestamp >= deadline ||
    current.number <= block.number ||
    current.number - block.number > maxBlocks
  )
    throw new Error(
      "The deposit quote expired. Please retry for a fresh quote.",
    )

  const request = {
    account: owner,
    address: controller,
    abi: EXECUTION_ABI,
    functionName: "execute",
    args: [vault, data, block.number, block.hash, deadline, quotes],
  } as const
  // Covers controller overhead and the complete native swap route. A fixed
  // ERC20-style gas limit is insufficient for this contract stack.
  const estimate = await client.estimateContractGas(request)
  const gas = (estimate * 120n + 99n) / 100n
  if (gas > MAX_NATIVE_TX_GAS || gas > current.gasLimit)
    throw new Error(
      "This deposit exceeds the transaction gas limit. Try a smaller amount.",
    )

  return {
    to: controller,
    data: encodeFunctionData(request),
    abi: EXECUTION_ABI,
    gas,
    quotedBlock: block.number,
    deadline,
    shares,
  }
}
