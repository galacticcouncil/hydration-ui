const asset = { id: "34", symbol: "ETH", decimals: 18 }
export const useAssets = () => ({
  getAsset: () => asset,
  getAssetWithFallback: () => asset,
})
export const useAccountBalances = () => ({
  getTransferableBalance: () => window.fixture.balance,
})
export const useRpcProvider = () => ({ isReady: window.fixture.rpcReady })
export const useEvmAddress = () => "0x3088c164994890ea0e444bf53623ccac3b307217"
export const depositCapacityQuery = () => ({ kind: "capacity" })
export const vaultStatsQuery = () => ({ kind: "stats" })
export const vaultBalancesQuery = () => ({ kind: "balances" })
export const subLoopQuery = () => ({ kind: "subLoop" })
export const useQuery = ({ kind }) => ({
  data: window.fixture[kind],
  isError: window.fixture.error,
})
export const useDeposit = (_, options) => {
  window.fixture.depositSucceeded = options.onSuccess
  return {
    mutate: (amount) => window.fixture.submitted.push(amount),
    isPending: !!window.fixture.pending,
    isError: !!window.fixture.depositError,
    reset: () => window.updateFixture({ depositError: false }),
  }
}
export const useRequestRedeem = () => ({
  mutate: (request) => window.fixture.withdrawals.push(request),
  isPending: !!window.fixture.pending,
})
export const useDisplayAssetPrice = (_, value) => [
  `$${(Number(value) * window.fixture.price).toFixed(2)}`,
  { isLoading: false, isValid: true },
]

export const useClaim = () => ({
  mutate: (request) => window.fixture.claims.push(request),
})
export const usePendingClaimIds = () => window.fixture.pendingClaims ?? []

export const HYDRATION_CHAIN_KEY = "hydration"
export const WalletProviderType = { ExternalWallet: "external" }
export const TransactionType = { Onchain: "onchain" }
export const useAccount = () => ({ account: { provider: "polkadot-js" } })
export const usePolkadotJSExtrinsicUrl = () => ""
export const TransactionAlertFlag = {
  InsufficientFeeBalance: "insufficientFeeBalance",
}
export const useTransactionAlerts = () => ({ flags: [], hasAlerts: false })
export const useTransaction = () => ({
  tx: {},
  meta: { type: "onchain" },
  isLoading: window.fixture.preparing,
  isSigning: false,
  isChangingFeePaymentAsset: false,
  signAndSubmit: () => window.fixture.signatures.push("signed"),
})
