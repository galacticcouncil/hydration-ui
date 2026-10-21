import { AbstractWallet } from "@nktkas/hyperliquid/signing"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

import { getExchangeClient, getInfoClient } from "@/client"

export type AgentSession = {
  privateKey: `0x${string}`
  address: `0x${string}`
  name: string
}

/**
 * Mints a session key and approves it with the user's main wallet, so orders
 * sign locally instead of prompting the wallet each time. An agent key can
 * trade but cannot withdraw or transfer funds.
 *
 * Persisting the key is deliberately left to the caller — it is a secret, and
 * where it lives is a security decision this layer should not make.
 */
export const createAgentSession = async (
  isTestnet: boolean,
  wallet: AbstractWallet,
  name: string,
): Promise<AgentSession> => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)

  await getExchangeClient(isTestnet, wallet).approveAgent({
    agentAddress: address,
    agentName: name,
  })

  return { privateKey, address, name }
}

/** Exchange wallet that signs L1 actions with a previously approved session key. */
export const getAgentWallet = (privateKey: `0x${string}`) =>
  privateKeyToAccount(privateKey)

const storageKey = (isTestnet: boolean, user: string) =>
  `hydration.hyperliquid.${isTestnet ? "testnet" : "mainnet"}.agent.${user.toLowerCase()}`

const isHex = (value: unknown, bytes: number): value is `0x${string}` =>
  typeof value === "string" &&
  new RegExp(`^0x[0-9a-fA-F]{${bytes * 2}}$`).test(value)

/** Storage is shared with everything else on the origin, so never trust its shape. */
const isAgentSession = (value: unknown): value is AgentSession =>
  typeof value === "object" &&
  value !== null &&
  isHex((value as AgentSession).privateKey, 32) &&
  isHex((value as AgentSession).address, 20) &&
  typeof (value as AgentSession).name === "string"

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * Session keys live in `sessionStorage`, so they are dropped when the tab
 * closes and the user re-approves once per session. Keyed by network and main
 * wallet address so switching either never reuses another key.
 */
export const storeAgentSession = (
  isTestnet: boolean,
  user: string,
  session: AgentSession,
) =>
  sessionStorage.setItem(storageKey(isTestnet, user), JSON.stringify(session))

export const readAgentSession = (
  isTestnet: boolean,
  user: string,
): AgentSession | null => {
  const key = storageKey(isTestnet, user)
  const stored = sessionStorage.getItem(key)

  if (!stored) return null

  const parsed = parseJson(stored)

  if (isAgentSession(parsed)) return parsed

  sessionStorage.removeItem(key)

  return null
}

export const clearAgentSession = (isTestnet: boolean, user: string) =>
  sessionStorage.removeItem(storageKey(isTestnet, user))

/**
 * A stored key is useless once revoked or expired on chain, and orders signed
 * with it fail with a bare "does not exist". Check before trusting it.
 */
export const isAgentApproved = async (
  isTestnet: boolean,
  user: string,
  agentAddress: string,
  now: number,
) => {
  const agents = await getInfoClient(isTestnet).extraAgents({
    user: user as `0x${string}`,
  })

  return agents.some(
    ({ address, validUntil }) =>
      address.toLowerCase() === agentAddress.toLowerCase() &&
      (validUntil === null || validUntil > now),
  )
}

/**
 * Hyperliquid answers an action signed by a revoked or expired agent with
 * "User or API Wallet … does not exist". Once that happens the stored key is
 * worthless and the caller should mint a new session.
 */
export const isAgentRejectedError = (error: unknown) =>
  error instanceof Error && /api wallet|does not exist/i.test(error.message)
