import { PERMISSION } from "@aave/contract-helpers"
import { useState } from "react"
import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ModalWrapper } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"
import { BorrowModalContent } from "./BorrowModalContent"
import { useRootStore } from "sections/lending/store/root"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { GhoBorrowModalContent } from "sections/lending/components/transactions/Borrow/GhoBorrowModalContent"

export const BorrowModal = () => {
  const displayGho = useRootStore((store) => store.displayGho)
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>

  const [borrowUnWrapped, setBorrowUnWrapped] = useState(false)
  const { currentMarket } = useProtocolDataContext()

  const handleBorrowUnwrapped = (borrowUnWrapped: boolean) => {
    setBorrowUnWrapped(borrowUnWrapped)
  }

  return (
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      <ModalWrapper
        action="borrow"
        title="Borrow"
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!borrowUnWrapped}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) =>
          displayGho({ symbol: params.symbol, currentMarket }) ? (
            <GhoBorrowModalContent {...params} />
          ) : (
            <BorrowModalContent
              {...params}
              unwrap={borrowUnWrapped}
              setUnwrap={handleBorrowUnwrapped}
            />
          )
        }
      </ModalWrapper>
    </BasicModal>
  )
}
