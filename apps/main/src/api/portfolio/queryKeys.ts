export const portfolioBalanceQueryKey = (address: string, chainKey: string) =>
  ["portfolio", "balances", address, chainKey] as const
