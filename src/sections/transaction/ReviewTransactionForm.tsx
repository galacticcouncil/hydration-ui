import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import { SDetailRow } from "./ReviewTransaction.styled"
import { Button } from "components/Button/Button"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { Transaction, useAccountStore } from "../../state/store"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import { usePaymentInfo } from "../../api/transaction"
import { useMutation } from "@tanstack/react-query"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useEra } from "../../api/era"
import { useBestNumber } from "../../api/chain"

export const ReviewTransactionForm = (
  props: {
    title?: string
    onCancel: () => void
    onSigned: (signed: SubmittableExtrinsic<"promise">) => void
  } & Transaction,
) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()

  const signTx = useMutation(async () => {
    const address = account?.address?.toString()
    const wallet = getWalletBySource(account?.provider)
    if (address == null || wallet == null)
      throw new Error("Missing active account or wallet")

    const signature = await props.tx.signAsync(address, {
      signer: wallet.signer,
    })

    return await props.onSigned(signature)
  })

  const json = getTransactionJSON(props.tx)
  const { data: paymentInfoData } = usePaymentInfo(props.tx)
  const era = useEra(
    props.tx.era,
    bestNumber.data?.parachainBlockNumber.toString(),
    !signTx.isLoading && props.tx.era.isMortalEra,
  )

  return (
    <>
      {props.title && (
        <Text color="neutralGray400" fw={400} mt={6}>
          {props.title}
        </Text>
      )}
      <Box mt={16}>
        {json && <TransactionCode name={json.method} src={json.args} />}
      </Box>
      <Box mt={10}>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.cost")}
          </Text>
          <Box flex column align="end">
            {paymentInfoData && (
              <>
                <Text color="white">
                  {t("pools.addLiquidity.modal.row.transactionCostValue", {
                    amount: paymentInfoData.partialFee,
                    fixedPointScale: 12,
                    decimalPlaces: 2,
                  })}
                </Text>
                <Text color="primary400" fs={12}>
                  {/* TODO */}
                  {/* 2% */}
                </Text>
              </>
            )}
          </Box>
        </SDetailRow>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.lifetime")}
          </Text>
          <Text color="white">
            {props.tx.era.isMortalEra
              ? t("transaction.mortal.expire", {
                  date: era?.deathDate,
                })
              : t("transaction.immortal.expire")}
          </Text>
        </SDetailRow>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.tip")}
          </Text>
          <Text color="white">
            {t("pools.addLiquidity.modal.row.transactionTip", {
              amount: props.tx.tip,
              fixedPointScale: 12,
              decimalPlaces: 2,
            })}
          </Text>
        </SDetailRow>
        <SDetailRow>
          <Text color="neutralGray300">
            {t("pools.reviewTransaction.modal.detail.nonce")}
          </Text>
          <Text color="white">{props.tx.nonce.toString()}</Text>
        </SDetailRow>
      </Box>
      <Box mt={24} flex spread>
        <Button
          onClick={props.onCancel}
          text={t("pools.reviewTransaction.modal.cancel")}
          variant="secondary"
        />
        <Button
          text={t("pools.reviewTransaction.modal.confirmButton")}
          variant="primary"
          isLoading={signTx.isLoading}
          disabled={account == null}
          onClick={() => signTx.mutate()}
        />
      </Box>
    </>
  )
}
