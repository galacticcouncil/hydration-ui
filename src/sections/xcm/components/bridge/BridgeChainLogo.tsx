import { ReactNode } from "react"
import { SIconContainer } from "./BridgeChainLogo.styled"

export const BridgeChainLogo = (props: { icon: ReactNode }) => (
  <SIconContainer>{props.icon}</SIconContainer>
)
