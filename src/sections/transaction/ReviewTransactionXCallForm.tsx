import { TransactionResponse } from "@ethersproject/providers"
import { evmChains } from "@galacticcouncil/xcm-cfg"
import { useMutation } from "@tanstack/react-query"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { ReviewTransactionData } from "sections/transaction/ReviewTransactionData"
import {
  isEvmXCall,
  useTransactionCost,
} from "sections/transaction/ReviewTransactionXCallForm.utils"
import {
  useEvmAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { MetaMaskSigner } from "sections/web3-connect/wallets/MetaMask/MetaMaskSigner"
import { Transaction } from "state/store"
import { theme } from "theme"

type TxProps = Required<Pick<Transaction, "xcallMeta" | "xcall">>

type Props = TxProps & {
  title?: string
  onCancel: () => void
  onEvmSigned: (receipt: TransactionResponse) => void
}

export const ReviewTransactionXCallForm: FC<Props> = (props) => {
  const { t } = useTranslation()
  const { account } = useEvmAccount()

  const { wallet } = useWallet()

  const tx = {
    from: account?.address ?? "",
    to: props.xcall.to,
    data: props.xcall.data,
  }

  const transactionCost = useTransactionCost({
    signer: wallet?.signer,
    tx,
  })

  const chainProps = evmChains[props.xcallMeta?.srcChain] || {}
  const nativeCurrency = chainProps?.nativeCurrency

  const { mutate: signTx, isLoading } = useMutation(async () => {
    if (!account?.address) throw new Error("Missing active account")
    if (!wallet) throw new Error("Missing wallet")
    if (!wallet.signer) throw new Error("Missing signer")
    if (!isEvmXCall(props.xcall)) throw new Error("Missing xcall")

    if (wallet?.signer instanceof MetaMaskSigner) {
      const { srcChain } = props.xcallMeta

      const tx = await wallet.signer.sendTransaction({
        chain: srcChain,
        from: account.address,
        to: props.xcall.to,
        data: props.xcall.data,
      })

      props.onEvmSigned(tx)
    }
  })

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
          <ReviewTransactionData
            address={account?.address}
            xcall={props.xcall}
          />
        }
        footer={
          <>
            <div>
              <Spacer size={15} />
              <Summary
                rows={[
                  {
                    label: t("liquidity.reviewTransaction.modal.detail.cost"),
                    content: !transactionCost.isLoading ? (
                      <div sx={{ flex: "row", gap: 6, align: "center" }}>
                        <Text>
                          {account?.chainId === chainProps?.id
                            ? t("value.tokenWithSymbol", {
                                value: transactionCost.data,
                                symbol: nativeCurrency?.symbol,
                                fixedPointScale: nativeCurrency?.decimals,
                              })
                            : "-"}
                        </Text>
                      </div>
                    ) : (
                      <Skeleton width={100} height={16} />
                    ),
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
          </>
        }
      />
    </>
  )
}
