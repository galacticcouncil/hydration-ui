import {
  clearAgentSession,
  createAgentSession,
  getAgentWallet,
  isAgentApproved,
  isAgentRejectedError,
  readAgentSession,
  storeAgentSession,
} from "@galacticcouncil/hyperliquid/agent"
import { createHyperliquidWallet } from "@galacticcouncil/hyperliquid/client"
import {
  createOrderClient,
  OrderClient,
  PlaceOrderParams,
} from "@galacticcouncil/hyperliquid/order"
import { hyperliquidQueryKeys } from "@galacticcouncil/hyperliquid/queries"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EIP1193Provider } from "viem"

import { HYPERLIQUID } from "@/config/hyperliquid"

const builder = { address: HYPERLIQUID.builder, fee: HYPERLIQUID.fee }

type Signer = { address: string; provider: EIP1193Provider }

/**
 * One client per account, kept for the page's lifetime. Creating one verifies
 * or mints the session key and loads the symbol table — several round-trips,
 * far too slow to repeat on every click. Caching the promise also means two
 * orders racing on an empty cache share one agent approval prompt instead of
 * each asking the wallet for their own.
 */
const clients = new Map<string, Promise<OrderClient>>()

const clientKey = (user: string) =>
  `${HYPERLIQUID.isTestnet}:${user.toLowerCase()}`

const getOrderClient = ({ address: user, provider }: Signer) => {
  const key = clientKey(user)
  const cached = clients.get(key)

  if (cached) return cached

  const client = (async () => {
    const { isTestnet } = HYPERLIQUID

    const stored = readAgentSession(isTestnet, user)
    const valid =
      stored &&
      (await isAgentApproved(isTestnet, user, stored.address, Date.now()))

    if (stored && !valid) clearAgentSession(isTestnet, user)

    let session = valid ? stored : null

    if (!session) {
      session = await createAgentSession(
        isTestnet,
        createHyperliquidWallet(user, provider),
        "Hydration",
      )
      storeAgentSession(isTestnet, user, session)
    }

    return createOrderClient(
      isTestnet,
      getAgentWallet(session.privateKey),
      builder,
    )
  })()

  clients.set(key, client)
  // A declined approval or a network failure leaves nothing to retry against.
  client.catch(() => clients.delete(key))

  return client
}

/** Drops a client whose agent Hyperliquid no longer accepts, so the next order mints a new one. */
const forgetOrderClient = (user: string) => {
  clients.delete(clientKey(user))
  clearAgentSession(HYPERLIQUID.isTestnet, user)
}

/**
 * Session handling is identical for every write, so orders, leverage changes
 * and cancels all go through this rather than each re-implementing it.
 */
const useOrderAction = <TArgs, TResult>(
  run: (client: OrderClient, args: TArgs) => Promise<TResult>,
) => {
  const wallet = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: TArgs) => {
      const signer = wallet?.signer

      if (!isEthereumSigner(signer)) {
        throw new Error("An EVM-compatible account is required to trade")
      }

      try {
        return await run(await getOrderClient(signer), args)
      } catch (error) {
        if (isAgentRejectedError(error)) forgetOrderClient(signer.address)
        throw error
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: hyperliquidQueryKeys.all }),
  })
}

export const useSetLeverage = () =>
  useOrderAction(
    (client, { symbol, leverage }: { symbol: string; leverage: number }) =>
      client.setLeverage(symbol, leverage),
  )

export const useCancelOrder = () =>
  useOrderAction((client, { symbol, oid }: { symbol: string; oid: number }) =>
    client.cancelOrder(symbol, oid),
  )

export const usePlaceOrder = () =>
  useOrderAction((client, params: PlaceOrderParams) =>
    client.placeOrder(params),
  )
