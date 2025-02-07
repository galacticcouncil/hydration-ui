import { pick } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { useWeb3Connect } from "@/hooks/useWeb3Connect"

export const Web3ConnectError = () => {
  const { error } = useWeb3Connect(useShallow(pick(["error"])))
  return <div>{error}</div>
}
