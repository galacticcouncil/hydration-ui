import { PERMISSION } from "@aave/contract-helpers"
import {
  getAssetIdFromAddress,
  MONEY_MARKET_STRATEGY_ASSETS,
} from "@galacticcouncil/utils"

import { BasicModal } from "@/components/primitives/BasicModal"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { SupplyModalContent } from "./SupplyModalContent"

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>

  const isStrategyAsset = MONEY_MARKET_STRATEGY_ASSETS.includes(
    getAssetIdFromAddress(args.underlyingAsset),
  )

  return (
    <BasicModal
      variant="popup"
      open={type === ModalType.Supply}
      setOpen={close}
      title="Supply"
    >
      <TxModalWrapper
        action="supply"
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) =>
          isStrategyAsset ? (
            <>TODO STRATEGY SUPPLY</>
          ) : (
            <SupplyModalContent {...params} />
          )
        }
      </TxModalWrapper>
    </BasicModal>
  )
}
