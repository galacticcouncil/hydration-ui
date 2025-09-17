import { TransactionResponse } from "@ethersproject/providers"
import { FC, useMemo, useState } from "react"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  isHydrationIncompatibleAccount,
  useAccount,
  useEvmWalletReadiness,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { Transaction, useStore } from "state/store"
import { theme } from "theme"
import { ReviewTransactionData } from "./ReviewTransactionData"
import {
  isTxType,
  toSubmittableExtrinsic,
  useEditFeePaymentAsset,
  useHealthFactorChangeFromTxMetadata,
  usePolkadotJSTxUrl,
  useTransactionValues,
} from "./ReviewTransactionForm.utils"
import { ReviewTransactionSummary } from "sections/transaction/ReviewTransactionSummary"
import { HYDRATION_CHAIN_KEY } from "sections/xcm/XcmPage.utils"
import { useReferralCodesStore } from "sections/referrals/store/useReferralCodesStore"
import BN from "bignumber.js"
import { H160, isEvmAccount } from "utils/evm"
import {
  getTransactionJSON,
  isSetCurrencyExtrinsic,
} from "sections/transaction/ReviewTransaction.utils"
import {
  EthereumSigner,
  PermitResult,
} from "sections/web3-connect/signer/EthereumSigner"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { isAnyParachain } from "utils/helpers"
import {
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { getAssetHubFeeAsset } from "api/external/assethub"
import { AnyParachain } from "@galacticcouncil/xcm-core"
import { getWs } from "api/papi"
import { Binary, TxEvent } from "polkadot-api"
import { assethub } from "@polkadot-api/descriptors"
import { getPolkadotSignerFromPjs } from "polkadot-api/pjs-signer"
import { Observable, firstValueFrom, shareReplay } from "rxjs"
import { QUERY_KEYS } from "utils/queryKeys"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { WalletConnect } from "sections/web3-connect/wallets/WalletConnect"
import { TxType } from "@galacticcouncil/apps"
import { useRpcProvider } from "providers/rpcProvider"

type TxProps = Omit<Transaction, "id" | "tx" | "xcall"> & {
  tx: SubmittableExtrinsic<"promise"> | TxType
}

type Props = TxProps & {
  onCancel: () => void
  onPermitDispatched: ({ permit }: { permit: PermitResult }) => void
  onEvmSigned: (data: {
    evmTx: TransactionResponse
    tx: SubmittableExtrinsic<"promise">
  }) => void
  onSigned: (
    signed: SubmittableExtrinsic<"promise"> | Observable<TxEvent>,
  ) => void
  onSignError?: (error: unknown) => void
  isLoading: boolean
}

export const ReviewTransactionForm: FC<Props> = (props) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { setReferralCode } = useReferralCodesStore()
  const { toggle: toggleWeb3Modal } = useWeb3ConnectStore()
  const queryClient = useQueryClient()

  const extrinsic = useMemo(
    () => toSubmittableExtrinsic(api, props.tx),
    [api, props.tx],
  )

  const polkadotJSUrl = usePolkadotJSTxUrl(extrinsic)

  const shouldOpenPolkaJSUrl =
    polkadotJSUrl && account?.isExternalWalletConnected && !account?.delegate

  const { transactions } = useStore()

  const isChangingFeePaymentAsset =
    !isSetCurrencyExtrinsic(extrinsic?.toHuman()) &&
    transactions?.some(({ tx }) => {
      if (!tx) return false
      const extrinsic = toSubmittableExtrinsic(api, tx)
      return isSetCurrencyExtrinsic(extrinsic?.toHuman())
    })

  const [tipAmount, setTipAmount] = useState<BN | undefined>(undefined)
  const [customNonce, setCustomNonce] = useState<string | undefined>(undefined)

  const transactionValues = useTransactionValues({
    xcallMeta: props.xcallMeta,
    tx: extrinsic,
    overrides: props.overrides,
  })

  const {
    acceptedFeePaymentAssets,
    isEnoughPaymentBalance,
    feePaymentMeta,
    isLinkedAccount,
    storedReferralCode,
    tx,
    era,
    shouldUsePermit,
    permitNonce,
    pendingPermit,
    txWeight,
  } = transactionValues.data

  const healthFactorChange = useHealthFactorChangeFromTxMetadata(props.txMeta)

  const isHealthFactorChanged =
    !!healthFactorChange &&
    healthFactorChange.currentHealthFactor !==
      healthFactorChange.futureHealthFactor

  const displayRiskCheckbox =
    isHealthFactorChanged && !!healthFactorChange?.isHealthFactorBelowThreshold

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const isPermitTxPending = !!pendingPermit

  const isIncompatibleWalletProvider = props.xcallMeta
    ? false // allow all providers for xcm
    : isHydrationIncompatibleAccount(account)

  const isLinking = !isLinkedAccount && storedReferralCode

  const {
    openEditFeePaymentAssetModal,
    editFeePaymentAssetModal,
    isOpenEditFeePaymentAssetModal,
  } = useEditFeePaymentAsset(acceptedFeePaymentAssets, feePaymentMeta?.id)

  const { wallet } = useWallet()

  const signTx = useMutation(
    async () => {
      try {
        const address = props.isProxy ? account?.delegate : account?.address

        if (!address) throw new Error("Missing active account")
        if (!wallet) throw new Error("Missing wallet")
        if (!wallet.signer) throw new Error("Missing signer")

        if (wallet?.signer instanceof EthereumSigner) {
          const txData = tx.method.toHex()

          const shouldAddTxWeight = isTxType(props.tx)
            ? !!props.tx.extraGas
            : !!getTransactionJSON(tx)?.args?.extra_gas

          if (shouldUsePermit) {
            const nonce = customNonce
              ? parseFloat(customNonce)
              : permitNonce ?? 0

            const permit = await wallet.signer.getPermit(txData, {
              nonce,
              ...(shouldAddTxWeight && { txWeight }),
            })

            return props.onPermitDispatched({
              permit,
            })
          }

          const evmTx = await wallet.signer.sendDispatch(txData, {
            chain: props.xcallMeta?.srcChain,
            ...(shouldAddTxWeight && { txWeight }),
            onNetworkSwitch: () => {
              queryClient.refetchQueries(
                QUERY_KEYS.evmChainInfo(account?.displayAddress ?? ""),
              )
            },
          })
          return props.onEvmSigned({ evmTx, tx })
        }

        const srcChain = props?.xcallMeta?.srcChain
          ? (chainsMap.get(props.xcallMeta.srcChain) as AnyParachain)
          : null

        const isH160SrcChain =
          !!srcChain && isAnyParachain(srcChain) && srcChain.usesH160Acc

        const formattedAddress = isH160SrcChain
          ? H160.fromAccount(address)
          : address

        const { txOptions } = props
        if (srcChain && txOptions?.asset) {
          const signer = getPolkadotSignerFromPjs(
            address,
            wallet.signer.signPayload,
            wallet.signer.signRaw,
          )
          const client = await getWs(srcChain.ws)
          const papi = client.getTypedApi(assethub)
          const callData = Binary.fromHex(extrinsic.inner.toHex())
          const tx = await papi.txFromCallData(callData)
          const observer = tx
            .signSubmitAndWatch(signer, {
              asset: getAssetHubFeeAsset(txOptions.asset),
            })
            .pipe(shareReplay(1))

          const sub = observer.subscribe({
            complete: () => {
              sub.unsubscribe()
              client.destroy()
            },
          })

          await firstValueFrom(observer)
          return props.onSigned(observer)
        }

        const signature = await tx.signAsync(formattedAddress, {
          era: era?.period?.toNumber(),
          tip: tipAmount?.gte(0) ? tipAmount.toString() : undefined,
          signer: wallet.signer,
          nonce: customNonce ? parseInt(customNonce) : -1,
          withSignedTransaction: wallet instanceof WalletConnect ? false : true,
        })

        return props.onSigned(signature)
      } catch (error) {
        props.onSignError?.(error)
      }
    },
    {
      onSuccess: () =>
        isLinking && account && setReferralCode(undefined, account.address),
    },
  )

  const { data: evmWalletReady } = useEvmWalletReadiness()
  const isWalletReady =
    wallet?.signer instanceof EthereumSigner ? evmWalletReady : true

  const isLoading =
    transactionValues.isLoading ||
    signTx.isLoading ||
    isChangingFeePaymentAsset ||
    props.isLoading
  const hasMultipleFeeAssets =
    props.xcallMeta && props.xcallMeta?.srcChain !== HYDRATION_CHAIN_KEY
      ? false
      : acceptedFeePaymentAssets.length > 1
  const isEditPaymentBalance = !isEnoughPaymentBalance && hasMultipleFeeAssets

  if (isOpenEditFeePaymentAssetModal) return editFeePaymentAssetModal

  const onConfirmClick = () =>
    shouldOpenPolkaJSUrl
      ? window.open(polkadotJSUrl, "_blank")
      : isEnoughPaymentBalance
        ? signTx.mutate()
        : hasMultipleFeeAssets
          ? openEditFeePaymentAssetModal()
          : undefined

  let btnText = t("liquidity.reviewTransaction.modal.confirmButton")

  if (shouldOpenPolkaJSUrl) {
    btnText = t(
      "liquidity.reviewTransaction.modal.confirmButton.openPolkadotJS",
    )
  } else if (isEditPaymentBalance) {
    btnText = t(
      "liquidity.reviewTransaction.modal.confirmButton.notEnoughBalance",
    )
  } else if (signTx.isLoading) {
    btnText = t("liquidity.reviewTransaction.modal.confirmButton.loading")
  }

  const isEvm = isEvmAccount(account?.address)

  const isTippingEnabled = props.xcallMeta
    ? props.xcallMeta?.srcChain === "hydration" && !isEvm
    : !isEvm

  const isCustomNonceEnabled = isEvm ? shouldUsePermit : true

  const isSubmitDisabled =
    isPermitTxPending ||
    !isWalletReady ||
    !account ||
    isLoading ||
    (!isEnoughPaymentBalance && !hasMultipleFeeAssets) ||
    (displayRiskCheckbox && !healthFactorRiskAccepted)

  return (
    <>
      <ModalScrollableContent
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          p: "var(--modal-content-padding)",
          maxHeight: 280,
        }}
        css={{ backgroundColor: `rgba(${theme.rgbColors.alpha0}, .06)` }}
        content={
          <ReviewTransactionData
            tx={tx}
            evmTx={props.evmTx}
            xcallMeta={props.xcallMeta}
          />
        }
        footer={
          <>
            <div sx={{ mt: 15 }}>
              <ReviewTransactionSummary
                tx={extrinsic}
                transactionValues={transactionValues}
                editFeePaymentAssetEnabled={hasMultipleFeeAssets}
                xcallMeta={props.xcallMeta}
                openEditFeePaymentAssetModal={openEditFeePaymentAssetModal}
                onTipChange={isTippingEnabled ? setTipAmount : undefined}
                onNonceChange={
                  isCustomNonceEnabled ? setCustomNonce : undefined
                }
                referralCode={isLinking ? storedReferralCode : undefined}
                currentHealthFactor={healthFactorChange?.currentHealthFactor}
                futureHealthFactor={healthFactorChange?.futureHealthFactor}
              />
            </div>
            {isHealthFactorChanged && (
              <HealthFactorRiskWarning
                accepted={healthFactorRiskAccepted}
                onAcceptedChange={setHealthFactorRiskAccepted}
                isBelowThreshold={
                  healthFactorChange?.isHealthFactorBelowThreshold
                }
              />
            )}
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
                {isIncompatibleWalletProvider ? (
                  <Button
                    variant="primary"
                    onClick={() => toggleWeb3Modal(WalletMode.SubstrateEVM)}
                  >
                    {t(`header.walletConnect.switch.button`)}
                  </Button>
                ) : (
                  <Button
                    text={btnText}
                    variant="primary"
                    isLoading={isPermitTxPending || isLoading}
                    disabled={isSubmitDisabled}
                    onClick={onConfirmClick}
                  />
                )}

                {isIncompatibleWalletProvider && (
                  <Text fs={12} lh={16} tAlign="center" color="pink600">
                    {t(
                      "liquidity.reviewTransaction.modal.confirmButton.invalidWalletProvider.msg",
                    )}
                  </Text>
                )}

                {!isEnoughPaymentBalance && !transactionValues.isLoading && (
                  <Text fs={12} lh={16} tAlign="center" color="pink600">
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
                {!isWalletReady && (
                  <Text fs={12} lh={16} tAlign="center" color="warning300">
                    {t(
                      "liquidity.reviewTransaction.modal.walletNotReady.warning",
                    )}
                  </Text>
                )}
                {isPermitTxPending && (
                  <Text fs={12} lh={16} tAlign="center" color="warning300">
                    {t(
                      "liquidity.reviewTransaction.modal.confirmButton.pendingPermit.msg",
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
