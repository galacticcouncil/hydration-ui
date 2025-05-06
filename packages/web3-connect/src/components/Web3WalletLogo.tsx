import { Wallet } from "@/types/wallet"

type Props = {
  readonly wallet: Wallet
  readonly className?: string
  readonly size?: number
}

export const Web3WalletLogo = ({ wallet, className, size = 32 }: Props) => {
  return (
    <img
      className={className}
      loading="lazy"
      src={wallet.logo}
      alt={wallet.title}
      width={size}
      height={size}
    />
  )
}
