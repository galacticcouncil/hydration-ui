import { pick } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { useWeb3Connect } from "@/hooks/useWeb3Connect"

export const useWeb3ConnectModal = () => {
  return useWeb3Connect(useShallow(pick(["open", "toggle", "meta"])))
}
