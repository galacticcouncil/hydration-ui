import { Button } from "@mui/material"
import React, { lazy, Suspense } from "react"
import { useWalletModalContext } from "sections/lending/hooks/useWalletModal"

const WalletModal = lazy(async () => ({
  default: (await import("./WalletModal.js")).WalletModal,
}))

export interface ConnectWalletProps {
  funnel?: string
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = ({
  funnel,
}) => {
  const { setWalletModalOpen } = useWalletModalContext()

  return (
    <>
      <Button
        variant="gradient"
        onClick={() => {
          setWalletModalOpen(true)
        }}
      >
        <span>Connect wallet</span>
      </Button>
      <Suspense>
        <WalletModal />
      </Suspense>
    </>
  )
}
