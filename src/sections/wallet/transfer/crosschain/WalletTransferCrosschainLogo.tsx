import { ReactNode } from "react"
import { SIconContainer } from "./WalletTransferCrosschainLogo.styled"

export const WalletTransferCrosschainLogo = (props: { icon: ReactNode }) => (
  <SIconContainer>{props.icon}</SIconContainer>
)
