import { Provider } from "@ethersproject/providers"

import { ChainId } from "@/ui-config/networksConfig"
import { useRootStore } from "@/store/root"

export const getProvider = (_chainId: ChainId): Provider => {
  const { provider } = useRootStore.getState()
  if (!provider) throw new Error("Provider not set")
  return provider
}

