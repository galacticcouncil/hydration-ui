import {
  TurnkeyProvider as TurnkeySDKProvider,
  useTurnkey,
  AuthState,
  ClientState,
} from "@turnkey/react-wallet-kit"
import "@turnkey/react-wallet-kit/styles.css"
import { createEIP1193Provider } from "@turnkey/eip-1193-provider"
import { EIP1193Provider } from "viem"
import {
  setTurnkeyConfig,
  setTurnkeyLoginHandler,
  useWeb3Connect,
  WalletProviderStatus,
  toStoredAccount,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { ReactNode, useCallback, useEffect, useRef } from "react"

const organizationId = import.meta.env.VITE_TURNKEY_ORGANIZATION_ID || ""
const authProxyConfigId =
  import.meta.env.VITE_TURNKEY_AUTH_PROXY_CONFIG_ID || ""
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

const HYDRATION_EVM_CHAIN_ID = Number(
  import.meta.env.VITE_EVM_CHAIN_ID || 222222,
)
const HYDRATION_EVM_CHAIN_ID_HEX = `0x${HYDRATION_EVM_CHAIN_ID.toString(16)}`
const HYDRATION_RPC_URL =
  import.meta.env.VITE_PROVIDER_URL?.replace("wss://", "https://") ||
  "https://rpc.nice.hydration.cloud"

/**
 * Wrap Turnkey's EIP-1193 provider to handle wallet_* methods
 * that viem's walletClient.switchChain and requestNetworkSwitch call.
 * Turnkey's provider only supports core Ethereum JSON-RPC, not wallet_* methods.
 */
function wrapProviderForHydration(provider: EIP1193Provider): EIP1193Provider {
  const originalRequest = provider.request.bind(provider)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider.request = (async (args: any) => {
    switch (args.method) {
      case "wallet_switchEthereumChain":
        return null
      case "wallet_addEthereumChain":
        return null
      case "wallet_requestPermissions":
        return [{ parentCapability: "eth_accounts" }]
      case "eth_chainId":
        return HYDRATION_EVM_CHAIN_ID_HEX
      case "eth_signTypedData_v4": {
        // EthereumSigner passes typed data as a JSON string — parse it.
        // Also remove EIP712Domain from types: Turnkey's provider (viem-based)
        // auto-generates it from the domain and rejects duplicates.
        const params = args.params ? [...args.params] : []
        if (typeof params[1] === "string") {
          params[1] = JSON.parse(params[1])
        }
        if (params[1]?.types?.EIP712Domain) {
          const { EIP712Domain: _, ...rest } = params[1].types
          params[1] = { ...params[1], types: rest }
        }
        return originalRequest({ ...args, params })
      }
      default:
        return originalRequest(args)
    }
  }) as EIP1193Provider["request"]
  return provider
}

const hydrationEvmAccount = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  path: "m/44'/60'/0'/0/0",
  addressFormat: "ADDRESS_FORMAT_ETHEREUM" as const,
}

const turnkeyConfig = {
  organizationId,
  authProxyConfigId,
  auth: {
    methods: {
      passkeyAuthEnabled: true,
      googleOauthEnabled: !!googleClientId,
    },
    oauthConfig: {
      googleClientId,
    },
    createSuborgParams: {
      emailOtpAuth: {
        customWallet: {
          walletName: "Hydration EVM Wallet",
          walletAccounts: [hydrationEvmAccount],
        },
      },
      passkeyAuth: {
        customWallet: {
          walletName: "Hydration EVM Wallet",
          walletAccounts: [hydrationEvmAccount],
        },
      },
      oauth: {
        customWallet: {
          walletName: "Hydration EVM Wallet",
          walletAccounts: [hydrationEvmAccount],
        },
      },
    },
  },
  ui: {
    darkMode: true,
  },
}

export function TurnkeyProviderWrapper({
  children,
}: {
  children: ReactNode
}) {
  if (!organizationId || !authProxyConfigId) {
    return <>{children}</>
  }

  return (
    <TurnkeySDKProvider config={turnkeyConfig}>
      <TurnkeyBridge />
      {children}
    </TurnkeySDKProvider>
  )
}

function TurnkeyBridge() {
  const {
    authState,
    clientState,
    wallets,
    httpClient,
    handleLogin,
    createWallet,
    refreshWallets,
  } = useTurnkey()
  const providerCreatedRef = useRef(false)
  const walletCreationAttemptedRef = useRef(false)

  // Register the login handler so TurnkeyWallet.enable() can trigger it
  const login = useCallback(async () => {
    await handleLogin()
  }, [handleLogin])

  useEffect(() => {
    setTurnkeyLoginHandler(login)
  }, [login])

  // After authentication, create EIP-1193 provider and set config
  useEffect(() => {
    if (
      authState !== AuthState.Authenticated ||
      clientState !== ClientState.Ready ||
      providerCreatedRef.current
    ) {
      return
    }

    if (!httpClient) return

    const setupWallet = async () => {
      const currentWallets = wallets

      // If no wallets loaded yet, try creating one (may already exist) and refresh
      if (currentWallets.length === 0) {
        if (walletCreationAttemptedRef.current) return
        walletCreationAttemptedRef.current = true
        try {
          await createWallet({
            walletName: "Hydration EVM Wallet",
            accounts: ["ADDRESS_FORMAT_ETHEREUM"],
          })
        } catch {
          // Wallet may already exist from a previous session
        }
        await refreshWallets()
        return
      }

      const ethAccount = currentWallets
        .flatMap((w) => w.accounts)
        .find((a) => a.address?.startsWith("0x"))

      if (!ethAccount) {
        return
      }

      const walletId = currentWallets[0]?.walletId
      if (!walletId) return

      providerCreatedRef.current = true

      try {
        const eip1193Provider = await createEIP1193Provider({
          turnkeyClient: httpClient as any,
          organizationId:
            organizationId as `${string}-${string}-${string}-${string}-${string}`,
          walletId:
            walletId as `${string}-${string}-${string}-${string}-${string}`,
          chains: [
            {
              chainId: `0x${HYDRATION_EVM_CHAIN_ID.toString(16)}`,
              chainName: "Hydration",
              rpcUrls: [HYDRATION_RPC_URL],
            },
          ],
        })

        const wrappedProvider = wrapProviderForHydration(
          eip1193Provider as EIP1193Provider,
        )
        setTurnkeyConfig({
          eip1193Provider: wrappedProvider,
          address: ethAccount.address,
        })

        // On page refresh, useWeb3Enable isn't running — auto-connect here
        const { getStatus } = useWeb3Connect.getState()
        const isPending =
          getStatus(WalletProviderType.Turnkey) ===
          WalletProviderStatus.Pending

        if (!isPending) {
          const wallet = getWallet(WalletProviderType.Turnkey)
          if (wallet) {
            await wallet.enable()
            const accounts = await wallet.getAccounts()
            const { setAccounts, setStatus } = useWeb3Connect.getState()
            setAccounts(
              accounts.map(toStoredAccount),
              WalletProviderType.Turnkey,
            )
            setStatus(
              WalletProviderType.Turnkey,
              WalletProviderStatus.Connected,
            )
          }
        }
      } catch (err) {
        console.error("[Turnkey] Failed to setup wallet provider:", err)
        providerCreatedRef.current = false
      }
    }

    setupWallet()
  }, [authState, clientState, wallets, httpClient, createWallet, refreshWallets])

  // Clean up on logout
  useEffect(() => {
    if (
      authState === AuthState.Unauthenticated &&
      providerCreatedRef.current
    ) {
      providerCreatedRef.current = false
      walletCreationAttemptedRef.current = false
      setTurnkeyConfig(null)
    }
  }, [authState])

  return null
}
