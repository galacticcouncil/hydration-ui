import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useMutation } from "@tanstack/react-query"
import { useAcountAssets } from "api/assetDetails"
import { useTokenBalance } from "api/balances"
import { useBestNumber } from "api/chain"
import { useEra } from "api/era"
import {
  useAcceptedCurrencies,
  useAccountCurrency,
  useSetAsFeePayment,
} from "api/payments"
import { useSpotPrice } from "api/spotPrice"
import { useNextNonce, usePaymentInfo } from "api/transaction"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"
import {
  PROXY_WALLET_PROVIDER,
  Transaction,
  useAccountStore,
} from "state/store"
import { NATIVE_ASSET_ID, POLKADOT_APP_NAME } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_1 } from "utils/constants"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import { useWalletConnect } from "components/OnboardProvider/OnboardProvider"
import Skeleton from "react-loading-skeleton"
import { useRpcProvider } from "providers/rpcProvider"

export const ReviewTransactionForm = (
  props: {
    title?: string
    onCancel: () => void
    onSigned: (signed: SubmittableExtrinsic<"promise">) => void
  } & Omit<Transaction, "id">,
) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()
  const accountCurrency = useAccountCurrency(account?.address)
  const currencyId = [props.overrides?.currencyId, accountCurrency.data].find(
    (currencyId) => currencyId,
  )
  const feeMeta = currencyId ? assets.getAsset(currencyId) : undefined

  const feeAssetBalance = useTokenBalance(
    props.overrides?.currencyId ?? accountCurrency.data,
    account?.address,
  )

  const feeAssets = useAcountAssets(account?.address)
  const setFeeAsPayment = useSetAsFeePayment()

  const nonce = useNextNonce(account?.address)
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, feeMeta?.id)

  const { wallet } = useWalletConnect()

  const signTx = useMutation(async () => {
    const address = props.isProxy ? account?.delegate : account?.address
    const provider =
      account?.provider === "external" && props.isProxy
        ? PROXY_WALLET_PROVIDER
        : account?.provider

    if (!address) throw new Error("Missing active account")

    if (provider === "WalletConnect") {
      if (wallet == null) throw new Error("Missing wallet for Wallet Connect")
      const signer = wallet.signer
      if (!signer) throw new Error("Missing signer for Wallet Connect")

      const signature = await props.tx.signAsync(address, { signer, nonce: -1 })
      return await props.onSigned(signature)
    } else {
      const wallet = getWalletBySource(provider)

      if (wallet == null) throw new Error("Missing wallet")

      if (props.isProxy) {
        await wallet.enable(POLKADOT_APP_NAME)
      }
      const signature = await props.tx.signAsync(address, {
        signer: wallet.signer,
        // defer to polkadot/api to handle nonce w/ regard to mempool
        nonce: -1,
      })
      return await props.onSigned(signature)
    }
  })

  const json = getTransactionJSON(props.tx)
  const { data: paymentInfoData, isLoading: isPaymentInfoLoading } =
    usePaymentInfo(props.tx)
  const era = useEra(
    props.tx.era,
    bestNumber.data?.parachainBlockNumber.toString(),
    !signTx.isLoading && props.tx.era.isMortalEra,
  )

  const acceptedFeeAssets = useAcceptedCurrencies(
    feeAssets.map((feeAsset) => feeAsset.asset.id) ?? [],
  )
  const isLoading = feeAssetBalance.isLoading || isPaymentInfoLoading
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
    onSelect: (asset) =>
      setFeeAsPayment(asset.id.toString(), {
        onLoading: (
          <Trans
            t={t}
            i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
            tOptions={{
              asset: asset.symbol,
            }}
          >
            <span />
            <span className="highlight" />
          </Trans>
        ),
        onSuccess: (
          <Trans
            t={t}
            i18nKey="wallet.assets.table.actions.payment.toast.onSuccess"
            tOptions={{
              asset: asset.symbol,
            }}
          >
            <span />
            <span className="highlight" />
          </Trans>
        ),
        onError: (
          <Trans
            t={t}
            i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
            tOptions={{
              asset: asset.symbol,
            }}
          >
            <span />
            <span className="highlight" />
          </Trans>
        ),
      }),
  })

  const feePaymentBalance = getFloatingPointAmount(
    feeAssetBalance.data?.balance ?? BN_0,
    feeMeta?.decimals ?? 12,
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

  let btnText = t("liquidity.reviewTransaction.modal.confirmButton")

  if (!isLoading) {
    if (hasFeePaymentBalance === false) {
      btnText = t(
        "liquidity.reviewTransaction.modal.confirmButton.notEnoughBalance",
      )
    }

    if (signTx.isLoading) {
      btnText = t("liquidity.reviewTransaction.modal.confirmButton.loading")
    }
  }

  return (
    <ModalScrollableContent
      content={
        <>
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
        </>
      }
      footer={
        <>
          <div>
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
                          symbol: feeMeta?.symbol,
                          fixedPointScale: 12,
                          type: "token",
                        })}
                      </Text>
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
                    </div>
                  ) : (
                    <Skeleton width={100} height={16} />
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
            sx={{
              mt: 24,
              flex: "row",
              justify: "space-between",
              align: "start",
            }}
          >
            <Button
              onClick={props.onCancel}
              text={t("liquidity.reviewTransaction.modal.cancel")}
              variant="secondary"
            />
            <div sx={{ flex: "column", justify: "center", gap: 4 }}>
              <Button
                text={btnText}
                variant="primary"
                isLoading={signTx.isLoading || isLoading}
                disabled={account == null || isLoading || signTx.isLoading}
                onClick={() =>
                  hasFeePaymentBalance ? signTx.mutate() : openModal()
                }
              />
              {hasFeePaymentBalance === false && (
                <Text fs={16} color="pink600">
                  {t(
                    "liquidity.reviewTransaction.modal.confirmButton.notEnoughBalance.msg",
                  )}
                </Text>
              )}
              {signTx.isLoading && (
                <Text fs={12} lh={16} tAlign="center" color="warning300">
                  {t("liquidity.reviewTransaction.modal.confirmButton.warning")}
                </Text>
              )}
            </div>
          </div>
        </>
      }
    />
  )
}
