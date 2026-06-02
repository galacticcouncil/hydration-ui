import { createContext, useContext } from "react"

import type { StableBondConfig } from "@/modules/strategies/stable-bonds/config/bonds"

const StableBondsConfigContext = createContext<StableBondConfig | undefined>(
  undefined,
)

export const useStableBondsConfig = () => {
  const config = useContext(StableBondsConfigContext)

  if (!config) {
    throw new Error(
      "useStableBondsConfig must be used within StableBondsConfigProvider",
    )
  }

  return config
}

type StableBondsConfigProviderProps = {
  children: React.ReactNode
  config: StableBondConfig
}

export const StableBondsConfigProvider: React.FC<
  StableBondsConfigProviderProps
> = ({ children, config }) => {
  return (
    <StableBondsConfigContext.Provider value={config}>
      {children}
    </StableBondsConfigContext.Provider>
  )
}
