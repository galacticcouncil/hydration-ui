import { pick } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { useWeb3Connect } from "@/hooks/useWeb3Connect"

export const useAccount = () => {
  const state = useWeb3Connect(
    useShallow(pick(["account", "accounts", "disconnect"])),
  )
  return {
    ...state,
    isConnected: !!state.account,
  }
}
