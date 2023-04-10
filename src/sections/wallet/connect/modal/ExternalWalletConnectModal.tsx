import { Button } from "components/Button/Button"
import { ModalMeta } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { Controller, useForm } from "react-hook-form"
import { FormValues } from "utils/helpers"
import { AddressInput } from "components/AddressInput/AddressInput"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import {
  CloseIcon,
  PasteAddressIcon,
} from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain.styled"
import { SContainer } from "sections/wallet/transfer/WalletTransferAccountInput.styled"
import { externalWallet, useAccountStore } from "state/store"
import { useNavigate } from "@tanstack/react-location"
import { safeConvertAddressSS58 } from "utils/formatting"
import { SErrorMessage } from "components/AssetInput/AssetInput.styled"
import { Spacer } from "components/Spacer/Spacer"
import { useApiPromise } from "utils/api"

type ExternalWalletConnectModalProps = {
  onBack: () => void
  onClose: () => void
}

export const ExternalWalletConnectModal = ({
  onBack,
  onClose,
}: ExternalWalletConnectModalProps) => {
  const api = useApiPromise()
  const { t } = useTranslation()
  const { setAccount } = useAccountStore()
  const navigate = useNavigate()

  const form = useForm<{
    address: string
  }>({})

  const onSubmit = async (values: FormValues<typeof form>) => {
    const [delegates] = await api.query.proxy.proxies(values.address)
    const delegateList = delegates?.map((delegate) => delegate)
    console.log(delegateList, "delegates")
    setAccount({
      address: values.address,
      name: externalWallet.name,
      provider: externalWallet.provider,
      isExternalWalletConnected: true,
      delegate: delegateList?.[1]?.delegate.toString(),
    })
    onClose()
    navigate({
      search: { account: values.address },
      fromCurrent: true,
    })
  }
  return (
    <>
      <ModalMeta
        title={t("walletConnect.externalWallet.modal.title")}
        secondaryIcon={{
          icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
          name: "Back",
          onClick: onBack,
        }}
      />
      <Text color="basic400">
        {t("walletConnect.externalWallet.modal.desc")}
      </Text>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{ flex: "column", justify: "space-between", height: "100%" }}
      >
        <Controller
          name="address"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.required"),
            validate: {
              validAddress: (value) =>
                safeConvertAddressSS58(value, 0) != null ||
                t("wallet.assets.transfer.error.validAddress"),
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => {
            const rightIcon = value ? (
              <CloseIcon
                icon={<CrossIcon />}
                onClick={() => onChange("")}
                name={t("modal.closeButton.name")}
              />
            ) : (
              <PasteAddressIcon
                onClick={async () => {
                  const text = await navigator.clipboard.readText()
                  onChange(text)
                }}
              />
            )

            return (
              <>
                <SContainer error={!!error} sx={{ mt: 35 }}>
                  <AddressInput
                    name={name}
                    onChange={onChange}
                    value={value}
                    placeholder={t(
                      "walletConnect.externalWallet.modal.input.placeholder",
                    )}
                    rightIcon={rightIcon}
                    css={{ width: "100%", height: 35, padding: "0 10px" }}
                    error={error?.message}
                  />
                </SContainer>
                {error && <SErrorMessage>{error.message}</SErrorMessage>}
                <Spacer size={35} />
              </>
            )
          }}
        />
        <Button
          disabled={!!form.formState.errors.address}
          variant="primary"
          type="submit"
        >
          {t("confirm")}
        </Button>
      </form>
    </>
  )
}
