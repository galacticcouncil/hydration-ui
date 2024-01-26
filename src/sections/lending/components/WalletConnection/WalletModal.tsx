import { useWalletModalContext } from "sections/lending/hooks/useWalletModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { WalletSelector } from "./WalletSelector"

export const WalletModal = () => {
  const { isWalletModalOpen, setWalletModalOpen } = useWalletModalContext()

  return (
    <BasicModal open={isWalletModalOpen} setOpen={setWalletModalOpen}>
      <WalletSelector />
    </BasicModal>
  )
}
