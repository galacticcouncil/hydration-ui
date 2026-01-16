import {
  AccountTile,
  AssetInput,
  FormLabel,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Stack,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainWallet, xcmTransferQuery } from "@/api/xcm"
import { AssetLogo } from "@/components/AssetLogo"
import { createDepositId } from "@/modules/onramp/config/cex"
import { useDeposit } from "@/modules/onramp/hooks/useDeposit"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { useXcmForm } from "@/modules/xcm/transfer/hooks/useXcmForm"
import { useAssets } from "@/providers/assetsProvider"
import { toBigInt, toDecimal } from "@/utils/formatting"

export type DepositTransferProps = {
  onTransferSuccess: () => void
  onBack: () => void
}

export const DepositTransfer: React.FC<DepositTransferProps> = ({
  onTransferSuccess,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common", "xcm"])
  const { account } = useAccount()
  const {
    asset,
    amount: depositAmount,
    setAmount: setDepositedAmount,
    setFinishedDeposit,
  } = useDeposit()
  const { getAsset } = useAssets()

  const address = account?.address ?? ""
  const srcChainKey = asset?.depositChain ?? ""
  const assetKey = asset?.data?.asset?.key ?? ""
  const assetMeta = asset ? getAsset(asset.assetId) : null

  const wallet = useCrossChainWallet()
  const { data: transfer, isLoading: isLoadingTransfer } = useQuery(
    xcmTransferQuery(wallet, {
      srcAddress: address,
      srcAsset: assetKey,
      srcChain: srcChainKey,
      destAddress: address,
      destAsset: assetKey,
      destChain: HYDRATION_CHAIN_KEY,
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

  const form = useXcmForm(transfer ?? null)
  const amount = form.watch("srcAmount")

  useEffect(() => {
    if (asset && transfer && depositAmount && !amount) {
      const amountToSet = Big.min(
        depositAmount,
        transfer.source.max.amount.toString(),
      )

      form.reset({
        srcChain: chainsMap.get(srcChainKey),
        srcAsset: asset.data.asset,

        destChain: chainsMap.get(HYDRATION_CHAIN_KEY),
        destAsset: asset.data.asset,

        srcAmount: toDecimal(amountToSet, transfer.source.balance.decimals),
        destAmount: toDecimal(amountToSet, transfer.source.balance.decimals),

        destAddress: address,
        destAccount: account,
      })
      form.trigger()
    }
  }, [
    account,
    address,
    amount,
    asset,
    depositAmount,
    form,
    srcChainKey,
    transfer,
  ])

  const { mutate: submitTx, isPending: isSubmitting } = useSubmitXcmTransfer({
    onSuccess: (result) => {
      console.log({ result })
      const values = form.getValues()
      if (!assetMeta) return
      const amount = toBigInt(values.srcAmount, assetMeta.decimals)
      setDepositedAmount(amount.toString())
      setFinishedDeposit(createDepositId(assetMeta.id, address))
      onTransferSuccess()
    },
  })

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("deposit.cex.transfer.title")}
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
                label={t("common:asset")}
                value={field.value}
                symbol={assetMeta?.symbol ?? ""}
                selectedAssetIcon={<AssetLogo id={asset?.assetId ?? ""} />}
                amountError={fieldState.error?.message}
                onChange={field.onChange}
                loading={isLoadingTransfer}
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
          <Stack gap={getTokenPx("scales.paddings.m")}>
            <FormLabel>{t("deposit.cex.transfer.destination")}</FormLabel>
            <AccountTile
              active
              name={account?.name ?? ""}
              address={account?.address ?? ""}
              shortenAddress={false}
            />
          </Stack>
          <ModalContentDivider sx={{ my: getTokenPx("scales.paddings.xl") }} />
          <LoadingButton
            type="submit"
            size="large"
            variant="primary"
            width="100%"
            disabled={isLoadingTransfer || isSubmitting}
            isLoading={isLoadingTransfer || isSubmitting}
          >
            {t("deposit.cex.transfer.button")}
          </LoadingButton>
        </form>
      </ModalBody>
    </FormProvider>
  )
}
