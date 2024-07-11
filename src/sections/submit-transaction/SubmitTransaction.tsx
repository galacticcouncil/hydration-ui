import { Alert } from "components/Alert/Alert"
import { Button } from "components/Button/Button"
import { TextArea } from "components/TextArea/TextArea"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { PasteAddressIcon } from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain.styled"
import { ToastMessage, useStore } from "state/store"
import { hexToU8a } from "@polkadot/util"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { required } from "utils/validators"
import { ApiPromise } from "@polkadot/api"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { TOAST_MESSAGES } from "state/toasts"

const validateHex = (api: ApiPromise, hex: string) => {
  try {
    const u8aCall = hexToU8a(hex)

    const decodedCall = api.registry.createType("Call", u8aCall)

    if (decodedCall) return true
  } catch (error) {
    return false
  }
}

export const SubmitTransaction = () => {
  const { api, isLoaded } = useRpcProvider()
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()

  const form = useForm<{ tx: string }>({
    mode: "onSubmit",
    defaultValues: {
      tx: "",
    },
    resolver: zodResolver(
      z.object({
        tx: required.refine(
          (value) => validateHex(api, value),
          t("submitTransaction.validation"),
        ),
      }),
    ),
  })

  const onSubmit = async (values: { tx: string }) => {
    const call = api.registry.createType("Call", hexToU8a(values.tx))

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = <Text>{t(`submitTransaction.toasts.${msType}`)}</Text>
      return memo
    }, {} as ToastMessage)

    return await createTransaction(
      {
        tx: api.tx(call),
      },
      {
        onBack: () => {},
        toast,
      },
    )
  }

  return (
    <div
      sx={{
        flex: "column",
        gap: 19,
        width: ["auto", 530],
        m: "auto",
        pt: [0, 70],
      }}
    >
      <Text fs={22} font="GeistMono" color="white">
        {t("submitTransaction.title")}
      </Text>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{ flex: "column", gap: 10 }}
      >
        <Controller
          name="tx"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <TextArea
              label={t("submitTransaction.label")}
              name={name}
              value={value}
              onChange={onChange}
              error={error?.message}
              disabled={!isLoaded}
              icon={
                isLoaded ? (
                  <PasteAddressIcon
                    onClick={async () => {
                      const text = await navigator.clipboard.readText()
                      onChange(text)
                    }}
                  />
                ) : null
              }
            />
          )}
        />

        {account ? (
          <Button fullWidth variant="primary" disabled={!isLoaded}>
            {t("submit")}
          </Button>
        ) : (
          <Web3ConnectModalButton />
        )}
      </form>
      <Alert variant="warning">{t("submitTransaction.warning")}</Alert>
    </div>
  )
}
