import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  EIP1193Provider,
  erc20Abi,
  http,
  numberToHex,
  parseUnits,
} from "viem"
import { arbitrum } from "viem/chains"

/**
 * Arbitrum is Hyperliquid's only canonical deposit route: native USDC sent to
 * the Bridge2 escrow, credited to the *sending* address. The Ethereum/Base/
 * Polygon addresses in Hyperliquid's own UI are per-user routing addresses
 * operated by a third party, not this contract.
 */
export const HL_BRIDGE2 = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7" as const

/**
 * Native Arbitrum USDC. USDC.e (the older bridged token) is a different
 * contract and is NOT credited — sending it to Bridge2 loses the funds.
 */
export const ARBITRUM_USDC =
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as const

export const USDC_DECIMALS = 6

/** Deposits under this are not credited and are effectively unrecoverable. */
export const MIN_DEPOSIT_USDC = 5

const publicClient = createPublicClient({ chain: arbitrum, transport: http() })

export const getArbitrumUsdcBalance = (address: string) =>
  publicClient.readContract({
    address: ARBITRUM_USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as Address],
  })

/**
 * Moves USDC from the user's Arbitrum balance into their Hyperliquid account.
 * Credits whichever address signs, so this must be the same account used to
 * trade. Finalises on Hyperliquid roughly a minute after the tx confirms.
 */
export const depositToHyperliquid = async (
  provider: EIP1193Provider,
  address: string,
  amount: string,
) => {
  const value = parseUnits(amount, USDC_DECIMALS)

  if (value < parseUnits(String(MIN_DEPOSIT_USDC), USDC_DECIMALS)) {
    throw new Error(
      `Hyperliquid does not credit deposits under ${MIN_DEPOSIT_USDC} USDC`,
    )
  }

  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: numberToHex(arbitrum.id) }],
  })

  const wallet = createWalletClient({
    account: address as Address,
    chain: arbitrum,
    transport: custom(provider),
  })

  const hash = await wallet.writeContract({
    address: ARBITRUM_USDC,
    abi: erc20Abi,
    functionName: "transfer",
    args: [HL_BRIDGE2, value],
  })

  return publicClient.waitForTransactionReceipt({ hash })
}
