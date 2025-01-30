import { Button, ButtonProps } from "@galacticcouncil/ui/components"
import { forwardRef } from "react"

import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"

export type Web3ConnectButtonProps = { title?: string } & ButtonProps

export const Web3ConnectButton: React.FC<Web3ConnectButtonProps> = forwardRef(
  ({ title, ...props }, ref) => {
    const { toggle } = useWeb3ConnectModal()
    return (
      <Button ref={ref} {...props} onClick={toggle}>
        {title ?? "Connect Wallet"}
      </Button>
    )
  },
)

Web3ConnectButton.displayName = "Web3ConnectButton"
