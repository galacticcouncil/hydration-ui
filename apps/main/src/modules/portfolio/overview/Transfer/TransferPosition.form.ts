import {
  isH160Address,
  safeConvertAddressH160,
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod/v4"

import {
  useFormMaxBalanceWithFee,
  ValidateFormMaxBalanceWithFee,
} from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale } from "@/utils/formatting"
import { positive, required, requiredObject } from "@/utils/validators"

const useSchema = (validateBalance: ValidateFormMaxBalanceWithFee) => {
  const { t } = useTranslation("wallet")
  const { account } = useAccount()
  const currentPublicKey = account?.publicKey

  return z
    .object({
      address: required
        .refine(
          (value) =>
            !!safeConvertAddressSS58(value, 0) ||
            !!safeConvertAddressH160(value),
          {
            error: t("transfer.error.validAddress"),
          },
        )
        .refine(
          (value) => {
            if (!currentPublicKey) return false

            const isEvm = isH160Address(value)

            const ss58Format = isEvm
              ? safeConvertH160toSS58(value)
              : safeConvertAddressSS58(value)

            const publicKey = safeConvertSS58toPublicKey(ss58Format)

            return publicKey !== currentPublicKey
          },
          {
            error: t("transfer.error.notSame"),
          },
        ),
      asset: requiredObject<TAsset>(),
      amount: required.pipe(positive),
    })
    .check(validateBalance("amount", (form) => [form.asset, form.amount]))
}

export type TransferPositionFormValues = z.infer<ReturnType<typeof useSchema>>

type Props = {
  readonly assetId?: string
}

export const useTransferPosition = (props?: Props) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const { papi } = useRpcProvider()
  const asset = props?.assetId ? (getAsset(props.assetId) ?? null) : null

  const defaultValues: TransferPositionFormValues = {
    address: "",
    asset: asset,
    amount: "",
  }

  const normalizedDest =
    safeConvertAddressSS58(account?.address ?? "") || account?.address || ""

  const tx = papi.tx.Currencies.transfer({
    currency_id: asset ? Number(asset.id) : 0,
    dest: normalizedDest,
    amount: BigInt(scale(1, asset?.decimals ?? 12)),
  })

  const { getMaxBalance, validateBalance } = useFormMaxBalanceWithFee(tx)

  const form = useForm<TransferPositionFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema(validateBalance)),
  })

  return {
    form,
    getMaxBalance,
  }
}
