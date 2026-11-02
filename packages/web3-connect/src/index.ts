export { AccountIdentity as Web3ConnectAccountIdentity } from "@/components/account/AccountIdentity"
export { type AccountIdentityProps as Web3ConnectAccountIdentityProps } from "@/components/account/AccountIdentity"
export { AccountWalletAvatar } from "@/components/account/AccountWalletAvatar"
export * from "@/components/address-book"
export { Web3ConnectButton } from "@/components/Web3ConnectButton"
export { Web3ConnectModal } from "@/components/Web3ConnectModal"
export { Web3ConnectSession } from "@/components/Web3ConnectSession"
export { Web3ConnectModalPage } from "@/config/modal"
export * from "@/hooks"
export type { MultisigConfig, MultisigStore } from "@/hooks/useMultisigStore"
export { useMultisigStore } from "@/hooks/useMultisigStore"
export { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
export * from "@/types"
export * from "@/utils"
export type {
  MultisigsByAccountIdsQuery,
  MultixSdk,
} from "@galacticcouncil/indexer/multix"
export {
  getMultixSdk,
  multisigsByAccountIdsQuery,
} from "@galacticcouncil/indexer/multix"
