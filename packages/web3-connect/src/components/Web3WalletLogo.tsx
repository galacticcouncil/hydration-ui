import { Wallet } from "@/types/wallet"

type Props = {
  readonly wallet: Wallet
  readonly className?: string
}

export const Web3WalletLogo = ({ wallet, className }: Props) => {
  return (
    <img
      className={className}
      loading="lazy"
      src={wallet.logo}
      alt={wallet.title}
      width={32}
      height={32}
    />
  )
}
