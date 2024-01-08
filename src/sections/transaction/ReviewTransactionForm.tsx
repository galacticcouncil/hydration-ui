import { TransactionResponse } from "@ethersproject/providers"
import { FC } from "react"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useMutation } from "@tanstack/react-query"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { MetaMaskSigner } from "sections/web3-connect/wallets/MetaMask/MetaMaskSigner"
import { Transaction } from "state/store"
import { theme } from "theme"
import { ReviewTransactionData } from "./ReviewTransactionData"
import {
  useEditFeePaymentAsset,
  useTransactionValues,
} from "./ReviewTransactionForm.utils"
import { ReviewTransactionSummary } from "sections/transaction/ReviewTransactionSummary"
import { HYDRADX_CHAIN_KEY } from "sections/xcm/XcmPage.utils"
import { useReferralCodesStore } from "sections/referrals/store/useReferralCodesStore"

type TxProps = Omit<Transaction, "id" | "tx" | "xcall"> & {
  tx: SubmittableExtrinsic<"promise">
}

type Props = TxProps & {
  title?: string
  onCancel: () => void
  onEvmSigned: (tx: TransactionResponse) => void
  onSigned: (signed: SubmittableExtrinsic<"promise">) => void
}

export const ReviewTransactionForm: FC<Props> = (props) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { setReferralCode } = useReferralCodesStore()

  const transactionValues = useTransactionValues({
    xcallMeta: props.xcallMeta,
    tx: props.tx,
    feePaymentId: props.overrides?.currencyId,
    fee: props.overrides?.fee,
  })

  const {
    acceptedFeePaymentAssets,
    isEnoughPaymentBalance,
    feePaymentMeta,
    isLinkedAccount,
    storedReferralCode,
    tx,
  } = transactionValues.data

  const isLinking = !isLinkedAccount && storedReferralCode

  const {
    openEditFeePaymentAssetModal,
    editFeePaymentAssetModal,
    isOpenEditFeePaymentAssetModal,
  } = useEditFeePaymentAsset(acceptedFeePaymentAssets, feePaymentMeta?.id)

  const { wallet } = useWallet()

  const signTx = useMutation(
    async () => {
      const address = props.isProxy ? account?.delegate : account?.address

      if (!address) throw new Error("Missing active account")
      if (!wallet) throw new Error("Missing wallet")
      if (!wallet.signer) throw new Error("Missing signer")

      if (wallet?.signer instanceof MetaMaskSigner) {
        const txSigner = await wallet.signer.sendDispatch(tx.method.toHex())
        return props.onEvmSigned(txSigner)
      }

      const signature = await tx.signAsync(address, {
        signer: wallet.signer,
        // defer to polkadot/api to handle nonce w/ regard to mempool
        nonce: -1,
      })

      return props.onSigned(signature)
    },
    {
      onSuccess: () =>
        isLinking && account && setReferralCode(undefined, account.address),
    },
  )

  const isLoading = transactionValues.isLoading || signTx.isLoading
  const hasMultipleFeeAssets =
    props.xcallMeta && props.xcallMeta?.srcChain !== HYDRADX_CHAIN_KEY
      ? false
      : acceptedFeePaymentAssets.length > 1
  const isEditPaymentBalance = !isEnoughPaymentBalance && hasMultipleFeeAssets

  if (isOpenEditFeePaymentAssetModal) return editFeePaymentAssetModal

  const onConfirmClick = () =>
    isEnoughPaymentBalance
      ? signTx.mutate()
      : hasMultipleFeeAssets
      ? openEditFeePaymentAssetModal()
      : undefined

  let btnText = t("liquidity.reviewTransaction.modal.confirmButton")

  if (isEditPaymentBalance) {
    btnText = t(
      "liquidity.reviewTransaction.modal.confirmButton.notEnoughBalance",
    )
  } else if (signTx.isLoading) {
    btnText = t("liquidity.reviewTransaction.modal.confirmButton.loading")
  }

  return (
    <>
      {props.title && (
        <Text color="basic400" fw={400} sx={{ mb: 16 }}>
          {props.title}
        </Text>
      )}
      <ModalScrollableContent
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          p: "var(--modal-content-padding)",
          maxHeight: 280,
        }}
        css={{ backgroundColor: `rgba(${theme.rgbColors.alpha0}, .06)` }}
        content={<ReviewTransactionData address={account?.address} tx={tx} />}
        footer={
          <div sx={{ mt: 15 }}>
            <ReviewTransactionSummary
              tx={props.tx}
              transactionValues={transactionValues}
              hasMultipleFeeAssets={hasMultipleFeeAssets}
              xcallMeta={props.xcallMeta}
              openEditFeePaymentAssetModal={openEditFeePaymentAssetModal}
              referralCode={isLinking ? storedReferralCode : undefined}
            />
            <div
              sx={{
                mt: ["auto", 24],
                flex: "row",
                justify: "space-between",
                align: "start",
              }}
            >
              <Button
                onClick={props.onCancel}
                text={t("liquidity.reviewTransaction.modal.cancel")}
              />
              <div sx={{ flex: "column", justify: "center", gap: 4 }}>
                <Button
                  text={btnText}
                  variant="primary"
                  isLoading={isLoading}
                  disabled={
                    !account ||
                    isLoading ||
                    (!isEnoughPaymentBalance && !hasMultipleFeeAssets)
                  }
                  onClick={onConfirmClick}
                />
                {!isEnoughPaymentBalance && !transactionValues.isLoading && (
                  <Text fs={16} color="pink600">
                    {t(
                      "liquidity.reviewTransaction.modal.confirmButton.notEnoughBalance.msg",
                    )}
                  </Text>
                )}
                {signTx.isLoading && (
                  <Text fs={12} lh={16} tAlign="center" color="warning300">
                    {t(
                      "liquidity.reviewTransaction.modal.confirmButton.warning",
                    )}
                  </Text>
                )}
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}
