import { TransactionResponse } from "@ethersproject/providers"
import { FC } from "react"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useMutation } from "@tanstack/react-query"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { MetaMaskSigner } from "sections/web3-connect/wallets/MetaMask/MetaMaskSigner"
import { Transaction } from "state/store"
import Skeleton from "react-loading-skeleton"
import { theme } from "theme"
import { ReviewTransactionData } from "./ReviewTransactionData"
import {
  useEditFeePaymentAsset,
  useTransactionValues,
} from "./ReviewTransactionForm.utils"

type TxProps = Omit<Transaction, "id" | "tx" | "xcall" | "xcallMeta"> & {
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

  const transactionValues = useTransactionValues({
    tx: props.tx,
    feePaymentId: props.overrides?.currencyId,
    fee: props.overrides?.fee,
  })

  const {
    acceptedFeePaymentAssets,
    isEnoughPaymentBalance,
    displayFeePaymentValue,
    feePaymentMeta,
    era,
    nonce,
  } = transactionValues.data

  const {
    openEditFeePaymentAssetModal,
    editFeePaymentAssetModal,
    isOpenEditFeePaymentAssetModal,
  } = useEditFeePaymentAsset(acceptedFeePaymentAssets, feePaymentMeta?.id)

  const { wallet } = useWallet()

  const signTx = useMutation(async () => {
    const address = props.isProxy ? account?.delegate : account?.address

    if (!address) throw new Error("Missing active account")
    if (!wallet) throw new Error("Missing wallet")
    if (!wallet.signer) throw new Error("Missing signer")

    if (wallet?.signer instanceof MetaMaskSigner) {
      const tx = await wallet.signer.sendDispatch(props.tx.method.toHex())
      return props.onEvmSigned(tx)
    }

    const signature = await props.tx.signAsync(address, {
      signer: wallet.signer,
      // defer to polkadot/api to handle nonce w/ regard to mempool
      nonce: -1,
    })

    return props.onSigned(signature)
  })

  const isLoading = transactionValues.isLoading || signTx.isLoading
  const hasMultipleFeeAssets = acceptedFeePaymentAssets.length > 1
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
        content={
          <ReviewTransactionData address={account?.address} tx={props.tx} />
        }
        footer={
          <>
            <div>
              <Spacer size={15} />
              <Summary
                rows={[
                  {
                    label: t("liquidity.reviewTransaction.modal.detail.cost"),
                    content: !transactionValues.isLoading ? (
                      <div sx={{ flex: "row", gap: 6, align: "center" }}>
                        <Text>
                          {t("liquidity.add.modal.row.transactionCostValue", {
                            amount: displayFeePaymentValue,
                            symbol: feePaymentMeta?.symbol,
                            type: "token",
                          })}
                        </Text>
                        {hasMultipleFeeAssets && (
                          <div
                            tabIndex={0}
                            role="button"
                            onClick={openEditFeePaymentAssetModal}
                            css={{ cursor: "pointer" }}
                          >
                            <Text color="brightBlue300">
                              {t("liquidity.reviewTransaction.modal.edit")}
                            </Text>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Skeleton width={100} height={16} />
                    ),
                  },
                  {
                    label: t(
                      "liquidity.reviewTransaction.modal.detail.lifetime",
                    ),
                    content: props.tx.era.isMortalEra
                      ? t("transaction.mortal.expire", {
                          date: era?.deathDate,
                        })
                      : t("transaction.immortal.expire"),
                  },
                  {
                    label: t("liquidity.reviewTransaction.modal.detail.nonce"),
                    content: nonce?.toString(),
                  },
                ]}
              />
            </div>
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
          </>
        }
      />
    </>
  )
}
