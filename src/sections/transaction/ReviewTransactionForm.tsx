import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { SDetailRow } from "./ReviewTransaction.styled"
import { Button } from "components/Button/Button"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { Transaction, useAccountStore } from "state/store"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import { useNextNonce, usePaymentInfo } from "api/transaction"
import { useMutation } from "@tanstack/react-query"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useEra } from "api/era"
import { useBestNumber } from "api/chain"
import { useAccountCurrency } from "../../api/payment"
import { useAssetMeta } from "../../api/assetMeta"
import { useSpotPrice } from "api/spotPrice"
import { NATIVE_ASSET_ID } from "utils/api"

import BigNumber from "bignumber.js"
export const ReviewTransactionForm = (
  props: {
    title?: string
    onCancel: () => void
    onSigned: (signed: SubmittableExtrinsic<"promise">) => void
  } & Omit<Transaction, "id">,
) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()
  const accountCurrency = useAccountCurrency(account?.address)
  const feeMeta = useAssetMeta(accountCurrency.data)

  const nonce = useNextNonce(account?.address)
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, feeMeta.data?.id)

  const signTx = useMutation(async () => {
    const address = account?.address?.toString()
    const wallet = getWalletBySource(account?.provider)
    if (address == null || wallet == null)
      throw new Error("Missing active account or wallet")

    const signature = await props.tx.signAsync(address, {
      signer: wallet.signer,
      // defer to polkadot/api to handle nonce w/ regard to mempool
      nonce: -1,
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
    <div
      sx={{
        flex: "column",
        justify: "space-between",
        height: "calc(100% - var(--modal-header-title-height))",
      }}
    >
      <div>
        {props.title && (
          <Text color="basic400" fw={400} sx={{ mt: 6 }}>
            {props.title}
          </Text>
        )}
        <div sx={{ mt: 16 }}>
          {json && <TransactionCode name={json.method} src={json.args} />}
        </div>
        <div sx={{ mt: 10 }}>
          <SDetailRow>
            <Text color="darkBlue200">
              {t("pools.reviewTransaction.modal.detail.cost")}
            </Text>
            <div sx={{ flex: "column", align: "end" }}>
              {paymentInfoData && (
                <>
                  <Text color="white">
                    {t("pools.addLiquidity.modal.row.transactionCostValue", {
                      amount: new BigNumber(
                        paymentInfoData.partialFee.toHex(),
                      ).multipliedBy(spotPrice.data?.spotPrice ?? 1),
                      symbol: feeMeta.data?.symbol,
                      fixedPointScale: 12,
                      decimalPlaces: 2,
                    })}
                  </Text>
                  <Text color="brightBlue200" fs={12}>
                    {/* TODO */}
                    {/* 2% */}
                  </Text>
                </>
              )}
            </div>
          </SDetailRow>
          <SDetailRow>
            <Text color="darkBlue200">
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
            <Text color="darkBlue200">
              {t("pools.reviewTransaction.modal.detail.nonce")}
            </Text>
            <Text color="white">{nonce.data?.toString()}</Text>
          </SDetailRow>
        </div>
      </div>
      <div sx={{ mt: 24, flex: "row", justify: "space-between" }}>
        <Button
          onClick={props.onCancel}
          text={t("pools.reviewTransaction.modal.cancel")}
          variant="secondary"
        />
        <Button
          text={t(
            signTx.isLoading
              ? "pools.reviewTransaction.modal.confirmButton.loading"
              : "pools.reviewTransaction.modal.confirmButton",
          )}
          variant="primary"
          isLoading={signTx.isLoading}
          disabled={account == null}
          onClick={() => signTx.mutate()}
        />
      </div>
    </div>
  )
}
