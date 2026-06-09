import { BasicModal } from "@/components/primitives/BasicModal"
import { DebtSwitchModalContent } from "@/components/transactions/DebtSwitch/DebtSwitchModalContent"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

export const DebtSwitchModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
    symbol: string
  }>

  return (
    <BasicModal
      variant="popup"
      open={type === ModalType.DebtSwitch}
      setOpen={close}
      title={`Swap ${args.symbol} debt`}
    >
      <TxModalWrapper underlyingAsset={args.underlyingAsset}>
        {(params) => <DebtSwitchModalContent {...params} />}
      </TxModalWrapper>
    </BasicModal>
  )
}
