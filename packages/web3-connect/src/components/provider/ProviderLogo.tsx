import { Image } from "@galacticcouncil/ui/components"
import { ThemeUICSSProperties } from "@galacticcouncil/ui/types"

import { Wallet } from "@/types/wallet"

type Props = {
  readonly wallet: Wallet
  readonly className?: string
  readonly size?: ThemeUICSSProperties["size"]
}

export const ProviderLogo = ({ wallet, className, size = 32 }: Props) => {
  return (
    <Image
      className={className}
      src={wallet.logo}
      alt={wallet.title}
      sx={{ size }}
    />
  )
}
