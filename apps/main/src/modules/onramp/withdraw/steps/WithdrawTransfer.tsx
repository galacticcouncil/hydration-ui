import {
  AccountInput,
  Alert,
  AssetInput,
  Flex,
  FormLabel,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  isEvmParachain,
  isEvmParachainAccount,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainWallet, xcmTransferQuery } from "@/api/xcm"
import { AssetLogo } from "@/components/AssetLogo"
import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { useWithdraw } from "@/modules/onramp/hooks/useWithdraw"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { useAssets } from "@/providers/assetsProvider"
import { toDecimal } from "@/utils/formatting"

export type WithdrawTransferProps = {
  onTransferSuccess: () => void
  onBack: () => void
}

export const WithdrawTransfer: React.FC<WithdrawTransferProps> = ({
  onTransferSuccess,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common", "xcm"])
  const { account } = useAccount()
  const { asset, cexId, setAmount: setWithdrawnAmount } = useWithdraw()
  const { getAsset } = useAssets()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)
  const address = account?.address ?? ""
  const destChainKey = asset?.withdrawalChain ?? ""
  const assetKey = asset?.data?.asset?.key ?? ""
  const assetMeta = asset ? getAsset(asset.assetId) : null

  const srcChain = chainsMap.get(HYDRATION_CHAIN_KEY)
  const destChain = chainsMap.get(destChainKey)

  const wallet = useCrossChainWallet()
  const { data: transfer, isLoading: isLoadingTransfer } = useQuery(
    xcmTransferQuery(wallet, {
      srcChain: HYDRATION_CHAIN_KEY,
      srcAsset: assetKey,
      destChain: destChainKey,
      destAsset: assetKey,
      srcAddress: address,
      destAddress: address,
    }),
  )

  const transferData = useMemo(() => {
    if (!transfer)
      return {
        balance: 0n,
        min: 0n,
        max: 0n,
        symbol: "",
        decimals: 0,
      }

    const { balance, min, max } = transfer.source

    return {
      symbol: balance.symbol,
      decimals: balance.decimals,
      balance: balance.amount,
      min: min.amount,
      max: max.amount,
    }
  }, [transfer])

  const form = useXcmForm(transfer ?? null, {
    srcChain: srcChain ?? null,
    destChain: destChain ?? null,
    srcAsset: asset?.data.asset ?? null,
    destAsset: asset?.data.asset ?? null,
  })

  const { mutate: submitTx, isPending: isSubmitting } = useSubmitXcmTransfer({
    onSuccess: async () => {
      setWithdrawnAmount(form.getValues("srcAmount"))
      onTransferSuccess()
      /* if (destChain && isParachain(destChain) && !!asset) {
        const api = destChain.client.getUnsafeApi<typeof hydration>()

        const values = form.getValues()

        const halfEd = ed.div(2)
        const adjustedAmount = receivedAmount.minus(paymentFee).minus(halfEd)

        await createTransaction({
          tx: api.tx.Tokens.transfer({
            currency_id: Number(
              destChain.getAssetId(asset.data.asset).toString(),
            ),
            dest: values.destAddress,
            amount: BigInt(amountScaled),
          }),
        })
      } */
    },
  })

  const isAccountAllowed = isEvmParachainAccount(address)
    ? !!destChain && isEvmParachain(destChain)
    : true

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("withdraw.cex.transfer.title", {
          cex: activeCex?.title,
        })}
        onBack={onBack}
        align="center"
        closable={false}
      />
      <ModalBody>
        <form
          onSubmit={form.handleSubmit((values) => {
            console.log({ values, transfer })
            return transfer && submitTx([values, transfer])
          })}
        >
          <Controller
            name="srcAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <AssetInput
                sx={{ p: 0 }}
                disabled={!isAccountAllowed}
                label={t("common:asset")}
                value={field.value}
                symbol={assetMeta?.symbol ?? ""}
                selectedAssetIcon={<AssetLogo id={asset?.assetId ?? ""} />}
                onChange={field.onChange}
                loading={isLoadingTransfer}
                amountError={fieldState.error?.message}
                maxButtonBalance={toDecimal(
                  transferData.max,
                  transferData.decimals,
                )}
                maxBalance={toDecimal(
                  transferData.balance,
                  transferData.decimals,
                )}
              />
            )}
          />
          <ModalContentDivider my={getTokenPx("scales.paddings.xl")} />
          <Controller
            name="destAddress"
            control={form.control}
            render={({ field, fieldState }) => (
              <Flex direction="column" gap={getTokenPx("scales.paddings.m")}>
                <FormLabel asChild>
                  <label htmlFor={field.name}>Destination address</label>
                </FormLabel>
                <AccountInput
                  id={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("withdraw.transfer.destination.placeholder")}
                  isError={!!fieldState.error}
                />
              </Flex>
            )}
          />

          <ModalContentDivider sx={{ my: getTokenPx("scales.paddings.xl") }} />
          {isAccountAllowed ? (
            <Alert
              description={t("withdraw.disclaimer.cex.title", {
                cex: activeCex?.title,
                symbol: asset?.data.asset.originSymbol,
              })}
              action={
                <Flex as="label" gap={10} align="center">
                  <Toggle
                    size="large"
                    checked={disclaimerAccepted}
                    onCheckedChange={setDisclaimerAccepted}
                  />
                  <Text fs={13}>
                    {t("withdraw.disclaimer.cex.description")}
                  </Text>
                </Flex>
              }
            />
          ) : (
            <Alert
              variant="error"
              description={t("withdraw.cex.account.evmError", {
                symbol: asset?.data.asset.originSymbol,
              })}
            />
          )}
          <ModalContentDivider sx={{ my: getTokenPx("scales.paddings.xl") }} />
          <LoadingButton
            type="submit"
            size="large"
            variant="primary"
            width="100%"
            disabled={
              isLoadingTransfer ||
              isSubmitting ||
              !isAccountAllowed ||
              !disclaimerAccepted
            }
            isLoading={isLoadingTransfer || isSubmitting}
          >
            {t("withdraw.transfer.button")}
          </LoadingButton>
        </form>
      </ModalBody>
    </FormProvider>
  )
}
