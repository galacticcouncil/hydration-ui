import { Modal } from "@galacticcouncil/ui/components"
import { useLocation } from "@tanstack/react-router"
import { FC, Suspense, useEffect } from "react"
import { useUpdateEffect } from "react-use"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { LINKS } from "@/config/navigation"
import { DepositFlow } from "@/modules/onramp/deposit/DepositFlow"
import { DepositManager } from "@/modules/onramp/deposit/DepositManager"
import { OnrampClosableContext } from "@/modules/onramp/hooks/useOnrampClosable"
import { useOnrampContentWidth } from "@/modules/onramp/hooks/useOnrampContentWidth"
import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"
import { WithdrawFlow } from "@/modules/onramp/withdraw/WithdrawFlow"

export const OnrampModal: FC = () => {
  const { isOpen, flow, close } = useOnrampModalStore(
    useShallow(pick(["isOpen", "flow", "close"])),
  )
  const contentWidth = useOnrampContentWidth()
  const pathname = useLocation({ select: (location) => location.pathname })

  // The modal and the /deposit, /withdraw routes share useOnrampStore, so
  // they must never render at the same time.
  const isOnrampRoute =
    pathname.startsWith(LINKS.deposit) || pathname.startsWith(LINKS.withdraw)

  useEffect(() => {
    if (isOnrampRoute && isOpen) close()
  }, [isOnrampRoute, isOpen, close])

  // Navigating from a step (e.g. a success CTA) must not leave the modal over the new page.
  useUpdateEffect(close, [pathname])

  return (
    <>
      <DepositManager />
      <Modal
        variant="popup"
        open={isOpen && !isOnrampRoute}
        onOpenChange={(open) => !open && close()}
        disableInteractOutside
        contentWidth={contentWidth}
      >
        <OnrampClosableContext.Provider value>
          <Suspense>
            {flow === "deposit" && <DepositFlow />}
            {flow === "withdraw" && <WithdrawFlow />}
          </Suspense>
        </OnrampClosableContext.Provider>
      </Modal>
    </>
  )
}
