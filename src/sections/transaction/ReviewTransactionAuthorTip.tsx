import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { FC, useState } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_NAN } from "utils/constants"
import { useDisplayPrice } from "utils/displayAsset"
import {
  SContainer,
  SInput,
  SInputContainer,
} from "./ReviewTransactionAuthorTip.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useDebounce } from "react-use"
import BN from "bignumber.js"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTokenBalance } from "api/balances"
import { useTranslation } from "react-i18next"

type Props = {
  onChange?: (amount: BN) => void
  feePaymentValue?: BN
  feePaymentAssetId?: string
}

export const ReviewTransactionAuthorTip: FC<Props> = ({
  onChange,
  feePaymentValue,
  feePaymentAssetId,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const { data: displayPrice } = useDisplayPrice(NATIVE_ASSET_ID)

  const asset = assets.getAsset(NATIVE_ASSET_ID)
  const { data: tokenBalance } = useTokenBalance(asset?.id, account?.address)

  const displayValue =
    displayPrice?.spotPrice && amount
      ? displayPrice.spotPrice.multipliedBy(amount)
      : BN_NAN

  const isNativePaymentAssetFee = feePaymentAssetId === NATIVE_ASSET_ID
  const amountMax =
    isNativePaymentAssetFee && tokenBalance?.balance && feePaymentValue
      ? tokenBalance.balance.minus(feePaymentValue)
      : tokenBalance?.balance ?? BN_0

  useDebounce(
    () => {
      const amountBN = amount
        ? new BN(amount).shiftedBy(asset.decimals)
        : BN_NAN

      if (amountBN.gt(amountMax)) {
        setError(t("liquidity.reviewTransaction.modal.error.tip"))
        onChange?.(BN_NAN)
      } else {
        setError("")
        onChange?.(amountBN)
      }
    },
    300,
    [amount],
  )

  return (
    <SContainer>
      <SInputContainer>
        <SInput
          placeholder={t("liquidity.reviewTransaction.modal.amount")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Text color="darkBlue200">{asset.symbol}</Text>
      </SInputContainer>
      <Text
        tAlign="right"
        fs={12}
        lh={16}
        color={error ? "red400" : "darkBlue300"}
      >
        {error ? error : <DisplayValue value={displayValue} />}
      </Text>
    </SContainer>
  )
}
