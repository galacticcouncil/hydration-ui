import { PERMISSION } from "@aave/contract-helpers"

import { BasicModal } from "@/components/primitives/BasicModal"
import { GhoBorrowModalContent } from "@/components/transactions/borrow/GhoBorrowModalContent"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useRootStore } from "@/store/root"

import { BorrowModalContent } from "./BorrowModalContent"

export const BorrowModal = () => {
  const displayGho = useRootStore((store) => store.displayGho)
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>

  const { currentMarket } = useProtocolDataContext()

  return (
    <BasicModal
      variant="popup"
      open={type === ModalType.Borrow}
      setOpen={close}
      title="Borrow"
    >
      <TxModalWrapper
        action="borrow"
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) =>
          displayGho({ symbol: params.symbol, currentMarket }) ? (
            <GhoBorrowModalContent {...params} />
          ) : (
            <BorrowModalContent {...params} />
          )
        }
      </TxModalWrapper>
    </BasicModal>
  )
}
