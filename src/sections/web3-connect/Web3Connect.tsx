import {
  useReferrer,
  useWeb3ConnectEagerEnable,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModal } from "./modal/Web3ConnectModal"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { useShallow } from "hooks/useShallow"

export const Web3Connect = () => {
  useWeb3ConnectEagerEnable()

  const { referrer } = useReferrer()
  const open = useWeb3ConnectStore(useShallow((state) => state.open))

  return (
    <>
      {import.meta.env.VITE_FF_REFERRALS_ENABLED === "true" && referrer && (
        <div
          css={{
            position: "fixed",
            top: 0,
            left: "50%",
            zIndex: 999,
            padding: "10px",
            color: "white",
          }}
        >
          referrer: {referrer}
        </div>
      )}
      {open ? <Web3ConnectModal /> : null}
    </>
  )
}
