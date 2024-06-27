import HydraLogoFull from "assets/icons/HydraLogoFull.svg?react"
import { Spinner } from "components/Spinner/Spinner"
import { SContainer } from "./AppLoader.styled"

export const AppLoader = () => {
  return (
    <SContainer>
      <HydraLogoFull />
      <Spinner size={64} />
    </SContainer>
  )
}
