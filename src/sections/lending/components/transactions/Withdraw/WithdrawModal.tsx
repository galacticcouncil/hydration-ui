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
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const WithdrawModal = () => {
  const { user } = useAppDataContext()
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true)

  const assetId = getAssetIdFromAddress(args.underlyingAsset)

  const reserveAssetsCount =
    user?.userReservesData.filter(
      ({ scaledATokenBalance }) => scaledATokenBalance !== "0",
    ).length ?? 0
  const borrowAssetsCount =
    user?.userReservesData.filter(
      ({ variableBorrows }) => variableBorrows !== "0",
    ).length ?? 0
  const isBorrowing = user?.totalBorrowsUSD !== "0"
  const fallbackWithdraw =
    isBorrowing && reserveAssetsCount + borrowAssetsCount > 4

  if (assetId === GDOT_STABLESWAP_ASSET_ID && !fallbackWithdraw) {
    const userReserve = user?.userReservesData.find((userReserve) => {
      return args.underlyingAsset === userReserve?.underlyingAsset
    })
    return (
      <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
        <RemoveDepositModal
          assetId={GDOT_ERC20_ASSET_ID}
          onClose={close}
          balance={userReserve?.underlyingBalance ?? "0"}
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
