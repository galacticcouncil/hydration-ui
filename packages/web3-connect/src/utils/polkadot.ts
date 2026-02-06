export function isNovaWalletApp() {
  return !!window?.walletExtension?.isNovaWallet
}

export function isNovaWallet(accessor: string) {
  const injectedExtension = window?.injectedWeb3?.[accessor]

  return !!(injectedExtension && isNovaWalletApp())
}
