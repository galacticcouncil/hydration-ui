import {
  Alert,
  Button,
  Flex,
  FormError,
  SectionHeader,
  Stack,
  TextArea,
} from "@galacticcouncil/ui/components"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Binary } from "polkadot-api"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod"

import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { required } from "@/utils/validators"

const validateHex = async (papi: Papi, hex: string) => {
  try {
    const tx = await papi.txFromCallData(Binary.fromHex(hex))

    return !!tx
  } catch (error) {
    return false
  }
}

export const SubmitTransactionPage = () => {
  const { t } = useTranslation("common")
  const { papi } = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const form = useForm<{ tx: string }>({
    mode: "onSubmit",
    defaultValues: {
      tx: "",
    },
    resolver: standardSchemaResolver(
      z.object({
        tx: required.refine(
          (value) => validateHex(papi, value),
          t("submitTransaction.validation"),
        ),
      }),
    ),
  })

  const onSubmit = async (data: { tx: string }) => {
    const tx = await papi.txFromCallData(Binary.fromHex(data.tx))

    if (!tx) {
      throw new Error("The encoded tx is missing")
    }

    await createTransaction({
      tx,
      toasts: {
        submitted: t("submitTransaction.toasts.submitted"),
        success: t("submitTransaction.toasts.success"),
      },
    })
  }

  return (
    <Stack width={["auto", "auto", "80%", "50%"]} mx="auto">
      <SectionHeader title={t("submitTransaction.title")} noTopPadding />
      <Flex direction="column" gap="xl" asChild>
        <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <Controller
            name="tx"
            control={form.control}
            render={({
              field: { value, name, onChange },
              fieldState: { error },
            }) => (
              <Flex direction="column" gap="s">
                <TextArea
                  label={t("submitTransaction.form.label")}
                  name={name}
                  value={value}
                  onChange={onChange}
                />
                {error && <FormError>{error.message}</FormError>}
              </Flex>
            )}
          />

          {account ? (
            <Button type="submit" disabled={false} width="100%" size="large">
              {t("submit")}
            </Button>
          ) : (
            <Web3ConnectButton size="large" />
          )}

          <Alert variant="warning" title={t("submitTransaction.warning")} />
        </form>
      </Flex>
    </Stack>
  )
}
