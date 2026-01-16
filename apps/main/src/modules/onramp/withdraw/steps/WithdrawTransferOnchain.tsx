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
import { useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { useWithdraw } from "@/modules/onramp/hooks/useWithdraw"
import { useTransferPositionForm } from "@/modules/wallet/assets/Transfer/TransferPosition.form"
import { useSubmitTransferPosition } from "@/modules/wallet/assets/Transfer/TransferPositionModal.submit"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { toDecimal } from "@/utils/formatting"

export type WithdrawTransferOnchainProps = {
  onTransferSuccess: () => void
  onBack: () => void
}

export const WithdrawTransferOnchain: React.FC<
  WithdrawTransferOnchainProps
> = ({ onTransferSuccess, onBack }) => {
  const { t } = useTranslation(["onramp", "common", "xcm"])
  const { asset, cexId, setAmount: setWithdrawnAmount } = useWithdraw()
  const { getAsset } = useAssets()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const { getTransferableBalance } = useAccountBalances()

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)
  const assetMeta = asset ? getAsset(asset.assetId) : null

  const form = useTransferPositionForm({ assetId: assetMeta?.id })
  const { mutate: transfer, isPending: isSubmitting } =
    useSubmitTransferPosition({
      onClose: () => {},
      onSuccess: () => {
        setWithdrawnAmount(form.getValues("amount"))
        onTransferSuccess()
      },
    })

  const maxBalance = assetMeta
    ? toDecimal(getTransferableBalance(assetMeta.id), assetMeta.decimals)
    : 0n

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
            return transfer(values)
          })}
        >
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <AssetInput
                sx={{ p: 0 }}
                label={t("common:asset")}
                value={field.value}
                symbol={assetMeta?.symbol ?? ""}
                selectedAssetIcon={<AssetLogo id={asset?.assetId ?? ""} />}
                onChange={field.onChange}
                maxBalance={maxBalance.toString()}
                amountError={fieldState.error?.message}
              />
            )}
          />
          <ModalContentDivider my={getTokenPx("scales.paddings.xl")} />
          <Controller
            name="address"
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
                <Text fs={13}>{t("withdraw.disclaimer.cex.description")}</Text>
              </Flex>
            }
          />

          <ModalContentDivider sx={{ my: getTokenPx("scales.paddings.xl") }} />
          <LoadingButton
            type="submit"
            size="large"
            variant="primary"
            width="100%"
            disabled={!disclaimerAccepted || isSubmitting}
            isLoading={isSubmitting}
          >
            {t("withdraw.transfer.button")}
          </LoadingButton>
        </form>
      </ModalBody>
    </FormProvider>
  )
}
