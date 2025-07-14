import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { FC, useState } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_NAN } from "utils/constants"
import {
  SContainer,
  SInput,
  SInputContainer,
} from "./ReviewTransactionAuthorTip.styled"
import { useDebounce } from "react-use"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { Switch } from "components/Switch/Switch"
import { useAssets } from "providers/assets"
import { useAccountBalances } from "api/deposits"
import { useAssetsPrice } from "state/displayPrice"

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
  const { native } = useAssets()
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [visible, setVisible] = useState(false)
  const { getAssetPrice } = useAssetsPrice([NATIVE_ASSET_ID])
  const displayPrice = getAssetPrice(NATIVE_ASSET_ID).price

  const accountAssets = useAccountBalances()

  const asset = native
  const tokenBalance = asset
    ? accountAssets.data?.accountAssetsMap.get(asset.id)?.balance
    : undefined

  const displayValue = amount ? BN(displayPrice).multipliedBy(amount) : BN_NAN

  const isNativePaymentAssetFee = feePaymentAssetId === NATIVE_ASSET_ID
  const amountMax =
    isNativePaymentAssetFee && tokenBalance?.transferable && feePaymentValue
      ? BN(tokenBalance.transferable).minus(feePaymentValue)
      : tokenBalance?.transferable ?? BN_0

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
    <div sx={{ flex: "column", gap: 8 }}>
      <Switch
        size="small"
        value={visible}
        onCheckedChange={(value) => {
          setVisible(value)

          if (!value) setAmount("")
        }}
        name={"liquidity.reviewTransaction.modal.detail.tip.name"}
        css={{ justifyContent: "end" }}
      />

      {visible && (
        <SContainer>
          <SInputContainer>
            <SInput
              sx={{ maxWidth: 124, pr: 38 }}
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
      )}
    </div>
  )
}
