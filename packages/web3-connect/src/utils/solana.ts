import { SolanaInjectedWindowProvider } from "@/types/solana"

export const isPhantom = (provider?: SolanaInjectedWindowProvider) => {
  return !!provider?.isPhantom
}

export const isSolflare = (provider?: SolanaInjectedWindowProvider) => {
  return !!provider?.isSolflare
}

export const isBraveSolana = (provider?: SolanaInjectedWindowProvider) => {
  return !!provider?.isBraveWallet
}
