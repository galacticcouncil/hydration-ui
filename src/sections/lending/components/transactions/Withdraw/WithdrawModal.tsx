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
import { useATokens } from "api/borrow"

export const WithdrawModal = () => {
  const { user } = useAppDataContext()
  const { aTokenReverseMap } = useATokens()
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true)

  const assetId = getAssetIdFromAddress(args.underlyingAsset)

  const aTokenId = aTokenReverseMap.get(assetId)

  const isGigaAsset =
    assetId === GDOT_STABLESWAP_ASSET_ID || assetId === GETH_STABLESWAP_ASSET_ID

  if (!!aTokenId && isGigaAsset) {
    const userReserve = user?.userReservesData.find((userReserve) => {
      return args.underlyingAsset === userReserve?.underlyingAsset
    })

    return (
      <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
        <RemoveDepositModal
          assetId={aTokenId}
          onClose={close}
          balance={userReserve?.underlyingBalance ?? "0"}
          assetReceiveId={
            assetId === GETH_STABLESWAP_ASSET_ID ? ETH_ASSET_ID : undefined
          }
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
