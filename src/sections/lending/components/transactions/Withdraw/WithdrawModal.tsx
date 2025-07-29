import { PERMISSION } from "@aave/contract-helpers"

import { useState } from "react"
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ModalWrapper } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { WithdrawModalContent } from "./WithdrawModalContent"
import { getAssetIdFromAddress } from "utils/evm"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssets } from "providers/assets"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { calculateMaxWithdrawAmount } from "sections/lending/components/transactions/Withdraw/utils"

export const WithdrawModal = () => {
  const { user } = useAppDataContext()
  const { getRelatedAToken } = useAssets()
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true)

  const assetId = getAssetIdFromAddress(args.underlyingAsset)

  const aTokenId = getRelatedAToken(assetId)?.id

  const isGigaAsset = MONEY_MARKET_GIGA_RESERVES.includes(args.underlyingAsset)

  if (!!aTokenId && isGigaAsset) {
    const userReserve = user?.userReservesData.find((userReserve) => {
      return args.underlyingAsset === userReserve?.underlyingAsset
    })

    const maxAmountToWithdraw = userReserve
      ? calculateMaxWithdrawAmount(
          user,
          userReserve,
          userReserve.reserve,
        ).toString()
      : "0"

    return (
      <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
        <RemoveDepositModal
          assetId={aTokenId}
          onClose={close}
          balance={userReserve?.underlyingBalance ?? "0"}
          maxBalance={maxAmountToWithdraw}
        />
      </BasicModal>
    )
  }

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
      <ModalWrapper
        title="Withdraw"
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => {
          return (
            <WithdrawModalContent
              {...params}
              unwrap={withdrawUnWrapped}
              setUnwrap={setWithdrawUnWrapped}
            />
          )
        }}
      </ModalWrapper>
    </BasicModal>
  )
}
