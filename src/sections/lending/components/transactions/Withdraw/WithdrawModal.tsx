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
import { useAssets } from "providers/assets"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { useAccountBalances } from "api/deposits"
import BN from "bignumber.js"
import { BN_NAN } from "utils/constants"

const WithdrawGigaAssetModal: React.FC<{
  assetId: string
  onClose: () => void
}> = ({ assetId, onClose }) => {
  const { getAsset } = useAssets()
  const { data: accountAssets } = useAccountBalances()

  const asset = getAsset(assetId)
  const accountAsset = accountAssets?.accountAssetsMap.get(assetId)

  const depositBalance = asset
    ? new BN(accountAsset?.balance?.total || "0").shiftedBy(-asset.decimals)
    : BN_NAN

  const maxBalance = asset
    ? new BN(accountAsset?.balance?.transferable || "0").shiftedBy(
        -asset.decimals,
      )
    : BN_NAN

  return (
    <RemoveDepositModal
      assetId={assetId}
      onClose={onClose}
      balance={depositBalance.toString()}
      maxBalance={maxBalance.toString()}
    />
  )
}

export const WithdrawModal = () => {
  const { getRelatedAToken } = useAssets()
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true)

  const assetId = getAssetIdFromAddress(args.underlyingAsset)

  const aTokenId = getRelatedAToken(assetId)?.id

  const isGigaAsset = MONEY_MARKET_GIGA_RESERVES.includes(args.underlyingAsset)

  if (!!aTokenId && isGigaAsset) {
    return (
      <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
        <WithdrawGigaAssetModal assetId={aTokenId} onClose={close} />
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
