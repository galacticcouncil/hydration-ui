import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Icon } from "@galacticcouncil/ui/components"
import { ComponentPropsWithoutRef, forwardRef } from "react"

import { TrackedWalletIdentity } from "@/modules/wallet/assets/Portfolio/TrackedWalletIdentity"
import { SPortfolioChainHeaderButton } from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"

type Props = ComponentPropsWithoutRef<"button"> & {
  readonly address: string
}

export const TrackedWalletHeader = forwardRef<HTMLButtonElement, Props>(
  ({ address, ...props }, ref) => (
    <SPortfolioChainHeaderButton ref={ref} {...props} isExpandable>
      <TrackedWalletIdentity
        address={address}
        glyphSize={16}
        fs="p6"
        fw={500}
        truncate={300}
      />
      <Icon size="s" component={ChevronDown} />
    </SPortfolioChainHeaderButton>
  ),
)

TrackedWalletHeader.displayName = "TrackedWalletHeader"
