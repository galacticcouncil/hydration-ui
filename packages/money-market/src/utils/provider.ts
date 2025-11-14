import { Provider } from "@ethersproject/providers"

import { useRootStore } from "@/store/root"
import { ChainId } from "@/ui-config/networksConfig"

export const getProvider = (_chainId: ChainId): Provider => {
  const { provider } = useRootStore.getState()
  if (!provider) throw new Error("Provider not set")
  return provider
}
