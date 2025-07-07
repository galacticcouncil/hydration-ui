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
import {
  ETH_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
} from "utils/constants"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { REVERSE_A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"

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
    isBorrowing && reserveAssetsCount + borrowAssetsCount > 3

  if (
    (assetId === GDOT_STABLESWAP_ASSET_ID ||
      assetId === GETH_STABLESWAP_ASSET_ID) &&
    !fallbackWithdraw
  ) {
    const userReserve = user?.userReservesData.find((userReserve) => {
      return args.underlyingAsset === userReserve?.underlyingAsset
    })

    return (
      <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
        <RemoveDepositModal
          assetId={REVERSE_A_TOKEN_UNDERLYING_ID_MAP[assetId]}
          onClose={close}
          balance={userReserve?.underlyingBalance ?? "0"}
          assetReceiveId={ETH_ASSET_ID}
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
