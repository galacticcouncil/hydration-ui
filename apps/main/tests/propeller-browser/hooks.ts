const asset = { id: "34", symbol: "ETH", decimals: 18 }
export const useAssets = () => ({
  getAsset: () => asset,
  getAssetWithFallback: () => asset,
})
export const useAccountBalances = () => ({
  getTransferableBalance: () => window.fixture.balance,
})
export const useRpcProvider = () => ({ isReady: window.fixture.rpcReady })
export const depositCapacityQuery = () => ({ kind: "capacity" })
export const useQuery = ({ kind }) => ({
  data: window.fixture[kind],
  isError: window.fixture.error,
})
export const useDeposit = () => ({
  mutate: (amount) => window.fixture.submitted.push(amount),
  isPending: false,
  isError: false,
  reset: () => {},
})
