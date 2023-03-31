import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { Transaction, useAccountStore } from "state/store"
import {
  getTransactionJSON,
  useSendTransactionMutation,
} from "./ReviewTransaction.utils"
import { useNextNonce, usePaymentInfo } from "api/transaction"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useEra } from "api/era"
import { useBestNumber } from "api/chain"
import { useAcceptedCurrencies, useAccountCurrency } from "api/payments"
import { useAssetMeta } from "api/assetMeta"
import { useSpotPrice } from "api/spotPrice"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import BigNumber from "bignumber.js"
import { BN_0, BN_1 } from "utils/constants"
import { Summary } from "components/Summary/Summary"
import { Spacer } from "components/Spacer/Spacer"
import { useTokenBalance } from "api/balances"
import { getFloatingPointAmount } from "utils/balance"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"
import { useAssetAccountDetails } from "api/assetDetails"
import { ModalMeta } from "components/Modal/Modal"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { Spinner } from "components/Spinner/Spinner.styled"
import { QUERY_KEYS } from "utils/queryKeys"

export const ReviewTransactionForm = (
  props: {
    title?: string
    onCancel?: () => void
    onBack: () => void
    onSigned: (signed: SubmittableExtrinsic<"promise">) => void
  } & Omit<Transaction, "id">,
) => {
  const api = useApiPromise()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()
  const accountCurrency = useAccountCurrency(account?.address)
  const feeMeta = useAssetMeta(
    props.overrides?.currencyId ?? accountCurrency.data,
  )
  const { data: feeAssetBalance } = useTokenBalance(
    props.overrides?.currencyId ?? accountCurrency.data,
    account?.address,
  )

  const sendAssetPaymentTx = useSendTransactionMutation()

  const signAssetPaymentTx = useMutation(async (tokenId: string) => {
    const address = account?.address?.toString()
    const wallet = getWalletBySource(account?.provider)

    if (address == null || wallet == null)
      throw new Error("Missing active account or wallet")

    const signature = await api.tx.multiTransactionPayment
      .setCurrency(tokenId)
      .signAsync(address, {
        signer: wallet.signer,
        // defer to polkadot/api to handle nonce w/ regard to mempool
        nonce: -1,
      })

    return await sendAssetPaymentTx.mutateAsync(signature).then(() =>
      queryClient.refetchQueries({
        queryKey: QUERY_KEYS.accountCurrency(account?.address),
      }),
    )
  })

  const feeAssets = useAssetAccountDetails(account?.address)

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

  const acceptedFeeAssets = useAcceptedCurrencies(
    feeAssets.data?.map((feeAsset) => feeAsset.id) ?? [],
  )

  const {
    openModal,
    modal,
    isOpen: isOpenSelectAssetModal,
  } = useAssetsModal({
    title: t("liquidity.reviewTransaction.modal.selectAsset"),
    hideInactiveAssets: true,
    allowedAssets:
      acceptedFeeAssets
        .filter(
          (acceptedFeeAsset) =>
            acceptedFeeAsset.data?.accepted &&
            acceptedFeeAsset.data?.id !== accountCurrency.data,
        )
        .map((acceptedFeeAsset) => acceptedFeeAsset.data?.id) ?? [],
    onSelect: (asset) => signAssetPaymentTx.mutate(asset.id.toString()),
  })

  const feePaymentBalance = getFloatingPointAmount(
    feeAssetBalance?.balance ?? BN_0,
    feeMeta.data?.decimals.toString() ?? 12,
  )
  const paymentFee = paymentInfoData
    ? getFloatingPointAmount(
        BigNumber(
          props.overrides?.fee ?? paymentInfoData.partialFee.toHex(),
        ).multipliedBy(spotPrice.data?.spotPrice ?? BN_1),
        12,
      )
    : null

  const hasFeePaymentBalance =
    paymentFee && feePaymentBalance.minus(paymentFee).gt(0)

  if (isOpenSelectAssetModal) return modal

  return (
    <div
      sx={{
        flex: "column",
        justify: "space-between",
        flexGrow: 1,
      }}
    >
      <ModalMeta
        title={t("liquidity.reviewTransaction.modal.title")}
        withoutOutsideClose
        secondaryIcon={{
          icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
          name: "Back",
          onClick: props.onBack,
        }}
      />
      <div>
        {props.title && (
          <Text color="basic400" fw={400} sx={{ mt: 6 }}>
            {props.title}
          </Text>
        )}
        <Text fs={16} fw={400} color="basic400">
          {t("liquidity.reviewTransaction.modal.desc")}
        </Text>
        <div sx={{ mt: 16 }}>
          {json && <TransactionCode name={json.method} src={json.args} />}
        </div>
        <Spacer size={15} />
        <Summary
          rows={[
            {
              label: t("liquidity.reviewTransaction.modal.detail.cost"),
              content: paymentInfoData ? (
                <div sx={{ flex: "row", gap: 6, align: "center" }}>
                  <Text>
                    {t("liquidity.add.modal.row.transactionCostValue", {
                      amount: (
                        props.overrides?.fee ??
                        new BigNumber(paymentInfoData.partialFee.toHex())
                      ).multipliedBy(spotPrice.data?.spotPrice ?? BN_1),
                      symbol: feeMeta.data?.symbol,
                      fixedPointScale: 12,
                      type: "token",
                    })}
                  </Text>
                  {sendAssetPaymentTx.isLoading ? (
                    <Spinner width={14} height={14} />
                  ) : (
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={openModal}
                      css={{ cursor: "pointer" }}
                    >
                      <Text color="brightBlue300">
                        {t("liquidity.reviewTransaction.modal.edit")}
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                ""
              ),
            },
            {
              label: t("liquidity.reviewTransaction.modal.detail.lifetime"),
              content: props.tx.era.isMortalEra
                ? t("transaction.mortal.expire", {
                    date: era?.deathDate,
                  })
                : t("transaction.immortal.expire"),
            },
            {
              label: t("liquidity.reviewTransaction.modal.detail.nonce"),
              content: nonce.data?.toString(),
            },
          ]}
        />
      </div>
      <div
        sx={{ mt: 24, flex: "row", justify: "space-between", align: "start" }}
      >
        <Button
          onClick={props.onCancel}
          text={t("liquidity.reviewTransaction.modal.cancel")}
          variant="secondary"
        />
        <div sx={{ flex: "column", justify: "center", gap: 4 }}>
          <Button
            text={t(
              signTx.isLoading
                ? "liquidity.reviewTransaction.modal.confirmButton.loading"
                : !hasFeePaymentBalance
                ? "liquidity.reviewTransaction.modal.confirmButton.notEnoughBalance"
                : "liquidity.reviewTransaction.modal.confirmButton",
            )}
            variant="primary"
            isLoading={signTx.isLoading}
            disabled={
              account == null ||
              !hasFeePaymentBalance ||
              sendAssetPaymentTx.isLoading
            }
            onClick={() => signTx.mutate()}
          />
          {signTx.isLoading && (
            <Text fs={12} lh={16} tAlign="center" color="warning300">
              {t("liquidity.reviewTransaction.modal.confirmButton.warning")}
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}
