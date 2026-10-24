import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid"
import { AbstractWallet } from "@nktkas/hyperliquid/signing"
import {
  Address,
  createWalletClient,
  custom,
  CustomTransport,
  EIP1193Provider,
  JsonRpcAccount,
  WalletClient,
} from "viem"

const transports = new Map<boolean, HttpTransport>()

export const getTransport = (isTestnet: boolean) => {
  const cached = transports.get(isTestnet)

  if (cached) return cached

  const transport = new HttpTransport({ isTestnet })
  transports.set(isTestnet, transport)

  return transport
}

export const getInfoClient = (isTestnet: boolean) =>
  new InfoClient({ transport: getTransport(isTestnet) })

/**
 * Spelled out because the inferred type points into viem's internal
 * `_types/actions/*` paths, which declaration emit cannot name.
 */
export type HyperliquidWallet = WalletClient<
  CustomTransport,
  undefined,
  JsonRpcAccount
>

/**
 * The SDK signs through any viem JSON-RPC account. `EthereumSigner` builds its
 * wallet client without an account, which viem's `signTypedData` rejects, so
 * bind the connected address here instead of reusing that client.
 *
 * `signatureChainId` is intentionally left unset — the SDK then signs with the
 * wallet's current chain id, which keeps wallets from rejecting typed data for
 * a chain they are not connected to.
 */
export const createHyperliquidWallet = (
  address: string,
  provider: EIP1193Provider,
): HyperliquidWallet =>
  createWalletClient({
    account: address as Address,
    transport: custom(provider),
  })

/** Accepts the browser wallet client or a local agent (session) account. */
export const getExchangeClient = (isTestnet: boolean, wallet: AbstractWallet) =>
  new ExchangeClient({ transport: getTransport(isTestnet), wallet })
