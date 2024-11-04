import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEvmPaymentFee } from "api/evm"
import { useAccountFeePaymentAssets } from "api/payments"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Summary } from "components/Summary/Summary"
import { Text } from "components/Typography/Text/Text"
import { FC, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ReviewTransactionData } from "sections/transaction/ReviewTransactionData"
import {
  EthereumSigner,
  PermitResult,
} from "sections/web3-connect/signer/EthereumSigner"
import {
  useEvmAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { NATIVE_EVM_ASSET_ID, NATIVE_EVM_ASSET_SYMBOL } from "utils/evm"

type Props = {
  title?: string
  onCancel: () => void
  tx: {
    data: TransactionRequest
    abi?: string
  }
  onPermitDispatched: ({ permit }: { permit: PermitResult }) => void
  onEvmSigned: (data: { evmTx: TransactionResponse }) => void
}

export const ReviewTransactionEvmTxForm: FC<Props> = ({
  title,
  tx,
  onEvmSigned,
  onPermitDispatched,
  onCancel,
}) => {
  const { t } = useTranslation()
  const { account } = useEvmAccount()

  const { data: fee } = useQuery(["evm-fee"], async () => {
    if (wallet?.signer instanceof EthereumSigner) {
      const [gas] = await wallet.signer.getGasValues(tx.data)
      const feeData = await wallet.signer.getFeeData()
      const estimatedGas = new BigNumber(
        tx.data?.gasLimit?.toString() ?? gas.toString(),
      )
      const baseFee = new BigNumber(feeData?.maxFeePerGas?.toString() ?? "0")
      const maxPriorityFeePerGas = new BigNumber(
        feeData?.maxPriorityFeePerGas?.toString() ?? "0",
      )

      const effectiveGasPrice = baseFee.plus(maxPriorityFeePerGas)
      return estimatedGas.multipliedBy(effectiveGasPrice)
    }
  })

  const { feePaymentAssetId } = useAccountFeePaymentAssets()
  const shouldUsePermit = feePaymentAssetId !== NATIVE_EVM_ASSET_ID

  const { wallet } = useWallet()

  const { mutate: signTx, isLoading } = useMutation(async () => {
    if (!account?.address) throw new Error("Missing active account")
    if (!wallet) throw new Error("Missing wallet")
    if (!wallet.signer) throw new Error("Missing signer")

    if (wallet?.signer instanceof EthereumSigner) {
      if (shouldUsePermit) {
        const nonce = await wallet.signer.getPermitNonce()
        const permit = await wallet.signer.getPermit(tx.data, nonce)
        return onPermitDispatched({ permit })
      }
      const evmTx = await wallet.signer.sendTransaction(tx.data)
      onEvmSigned({ evmTx })
    }
  })

  return (
    <>
      {title && (
        <Text color="basic400" fw={400} sx={{ mb: 16 }}>
          {title}
        </Text>
      )}
      <ModalScrollableContent
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          p: "var(--modal-content-padding)",
          maxHeight: 280,
        }}
        css={{ backgroundColor: `rgba(${theme.rgbColors.alpha0}, .06)` }}
        content={<ReviewTransactionData evmTx={tx} />}
        footer={
          <div sx={{ mt: 15 }}>
            <Summary
              rows={[
                {
                  label: t("liquidity.reviewTransaction.modal.detail.cost"),
                  content: (
                    <Text fs={14}>
                      {t("liquidity.add.modal.row.transactionCostValue", {
                        amount: fee,
                        symbol: NATIVE_EVM_ASSET_SYMBOL,
                        type: "token",
                        fixedPointScale: 18,
                      })}
                    </Text>
                  ),
                },
              ]}
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
                onClick={onCancel}
                text={t("liquidity.reviewTransaction.modal.cancel")}
              />
              <div sx={{ flex: "column", justify: "center", gap: 4 }}>
                <Button
                  variant="primary"
                  onClick={() => signTx()}
                  isLoading={isLoading}
                  disabled={isLoading}
                  text={
                    isLoading
                      ? t(
                          "liquidity.reviewTransaction.modal.confirmButton.loading",
                        )
                      : t("liquidity.reviewTransaction.modal.confirmButton")
                  }
                />
                {isLoading && (
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
