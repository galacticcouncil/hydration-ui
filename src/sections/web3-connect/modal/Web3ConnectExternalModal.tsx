import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useNavigate } from "@tanstack/react-location"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { AddressInput } from "components/AddressInput/AddressInput"
import { SErrorMessage } from "components/AssetInput/AssetInput.styled"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/wallet/transfer/WalletTransferAccountInput.styled"
import {
  CloseIcon,
  PasteAddressIcon,
} from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain.styled"
import {
  WalletProviderType,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { ExternalWallet } from "sections/web3-connect/wallets/ExternalWallet"
import { PROXY_WALLET_PROVIDER } from "state/store"
import { HYDRA_ADDRESS_PREFIX, POLKADOT_APP_NAME } from "utils/api"
import { H160, isEvmAddress } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { FormValues } from "utils/helpers"

type ExternalWalletConnectModalProps = {
  onClose: () => void
  onSelect: () => void
}

export const Web3ConnectExternalModal = ({
  onClose,
  onSelect,
}: ExternalWalletConnectModalProps) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { setAccount } = useWeb3ConnectStore()
  const navigate = useNavigate()

  const form = useForm<{
    address: string
    delegates: boolean
  }>({})

  const { wallet: activeWallet } = useWallet()
  const externalWallet =
    activeWallet instanceof ExternalWallet ? activeWallet : null

  // means that a user already knows that he doesn't have delegates
  const isDelegatesError = form.formState.errors.delegates

  const onSubmit = async (values: FormValues<typeof form>) => {
    const isEvm = isEvmAddress(values.address)
    const address = isEvm
      ? new H160(values.address).toAccount()
      : values.address

    const [delegates] = await api.query.proxy.proxies(address)
    const delegateList = delegates?.map((delegate) => delegate)
    let isDelegate = false

    if (!!delegateList.length) {
      const proxyWallet = getWalletBySource(PROXY_WALLET_PROVIDER)

      if (proxyWallet?.installed) {
        await proxyWallet?.enable(POLKADOT_APP_NAME)

        const accounts = await proxyWallet?.getAccounts()

        isDelegate = accounts?.some((account) =>
          delegateList.find(
            (delegateObj) =>
              delegateObj.delegate.toString() ===
              encodeAddress(
                decodeAddress(account.address),
                HYDRA_ADDRESS_PREFIX,
              ),
          ),
        )
      }
    }

    if (!!delegateList.length && !isDelegate && !isDelegatesError) {
      form.setError("delegates", {})
      return
    }

    externalWallet?.setAddress(address)
    setAccount({
      address,
      evmAddress: isEvm ? values.address : "",
      name:
        delegateList.length && isDelegate
          ? ExternalWallet.proxyAccountName
          : ExternalWallet.accountName,
      provider: WalletProviderType.ExternalWallet,
      isExternalWalletConnected: true,
    })
    onSelect()
    navigate({
      search: { account: isEvm ? values.address.slice(2) : address },
      fromCurrent: true,
    })

    if (!delegateList.length || (delegateList.length && isDelegatesError)) {
      onClose()
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{ flex: "column", minHeight: "100%" }}
    >
      <Text color="basic400">
        {t("walletConnect.externalWallet.modal.desc")}
      </Text>
      <Controller
        name="address"
        control={form.control}
        rules={{
          required: t("wallet.assets.transfer.error.required"),
          validate: {
            validAddress: (value) =>
              safeConvertAddressSS58(value, 0) !== null ||
              isEvmAddress(value) ||
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
              onClick={() => {
                onChange("")
                form.clearErrors("delegates")
              }}
              name={t("modal.closeButton.name")}
            />
          ) : (
            <PasteAddressIcon
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                onChange(text)
                form.clearErrors("delegates")
              }}
            />
          )

          return (
            <>
              <SContainer error={!!error} sx={{ mt: 35 }}>
                <AddressInput
                  name={name}
                  onChange={(value) => {
                    onChange(value)
                    form.clearErrors("delegates")
                  }}
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
            </>
          )
        }}
      />
      <Controller
        name="delegates"
        control={form.control}
        render={({ fieldState: { error } }) =>
          error ? (
            <>
              <Spacer size={15} />
              <Text color="red400" font="ChakraPetchBold" fs={12}>
                {t("walletConnect.accountSelect.proxyAccount.error")}
              </Text>
              <Spacer size={6} />
              <Text fw={400} color="red400" fs={12}>
                {t("walletConnect.accountSelect.proxyAccount.errorDesc")}
              </Text>
            </>
          ) : (
            <div />
          )
        }
      />

      <Spacer size={35} />
      <Button
        disabled={!!form.formState.errors.address}
        variant="primary"
        type="submit"
        sx={{ mt: "auto" }}
      >
        {form.formState.errors.delegates
          ? t("walletConnect.accountSelect.viewAsWallet")
          : t("confirm")}
      </Button>
    </form>
  )
}
