const asset = { id: "34", symbol: "ETH", decimals: 18 }
export const useAssets = () => ({
  getAsset: () => asset,
  getAssetWithFallback: () => asset,
})
export const useAccountBalances = () => ({
  getTransferableBalance: () => window.fixture.balance,
})
export const useRpcProvider = () => ({ isReady: window.fixture.rpcReady })
export const vaultStatsQuery = () => ({ kind: "stats" })
export const depositAdmissionQuery = () => ({ kind: "admission" })
export const useQuery = ({ kind }) => ({
  data: window.fixture[kind],
  isError: window.fixture.error,
})
export const remainingCapacity = (total, cap) => ({
  remaining: Math.max(cap - total, 0),
})
export const useDeposit = () => ({
  mutate: (amount) => window.fixture.submitted.push(amount),
  isPending: false,
  isError: false,
  reset: () => {},
})
