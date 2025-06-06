import { PERMISSION } from "@aave/contract-helpers"

import { BasicModal } from "@/components/primitives/BasicModal"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { WithdrawModalContent } from "./WithdrawModalContent"

export const WithdrawModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>

  // @TODO GDOT withdraw
  // const assetId = getAssetIdFromAddress(args.underlyingAsset)

  /* const reserveAssetsCount =
    user?.userReservesData.filter(
      ({ scaledATokenBalance }) => scaledATokenBalance !== "0",
    ).length ?? 0
  const borrowAssetsCount =
    user?.userReservesData.filter(
      ({ variableBorrows }) => variableBorrows !== "0",
    ).length ?? 0
  const isBorrowing = user?.totalBorrowsUSD !== "0"
  const fallbackWithdraw =
    isBorrowing && reserveAssetsCount + borrowAssetsCount > 3 */

  /* if (assetId === GDOT_STABLESWAP_ASSET_ID && !fallbackWithdraw) {
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
  } */

  return (
    <BasicModal
      open={type === ModalType.Withdraw}
      setOpen={close}
      title="Withdraw"
    >
      <TxModalWrapper
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => <WithdrawModalContent {...params} />}
      </TxModalWrapper>
    </BasicModal>
  )
}
