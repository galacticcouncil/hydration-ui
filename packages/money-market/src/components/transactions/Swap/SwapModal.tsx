import { BasicModal } from "@/components/primitives/BasicModal"
import { SwapModalContent } from "@/components/transactions/Swap/SwapModalContent"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

export const SwapModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
    symbol: string
  }>

  return (
    <BasicModal
      variant="popup"
      open={type === ModalType.Swap}
      setOpen={close}
      title={`Swap ${args.symbol} supply`}
    >
      <TxModalWrapper underlyingAsset={args.underlyingAsset}>
        {(params) => <SwapModalContent {...params} />}
      </TxModalWrapper>
    </BasicModal>
  )
}
