import { stringEquals } from "@galacticcouncil/utils"
import {
  addressToPublicKey,
  getWalletModeByAddress,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod/v4"

import { useTrackedWallets } from "@/states/trackedWallets"

export const MAX_TRACKED_WALLETS = 5

export type ManageTrackedWalletsFormValues = z.infer<
  ReturnType<typeof useManageTrackedWalletsSchema>
>

const useManageTrackedWalletsSchema = () => {
  const { t } = useTranslation(["wallet"])
  const { account } = useAccount()
  const wallets = useTrackedWallets()

  const accountPublicKey = account ? addressToPublicKey(account.address) : ""

  return z.object({
    address: z
      .string()
      .trim()
      .min(1, t("myAssets.tracked.manage.error.invalid"))
      .refine(
        (value) => {
          const publicKey = addressToPublicKey(value)
          return !!publicKey && !!getWalletModeByAddress(value)
        },
        { error: t("myAssets.tracked.manage.error.invalid") },
      )
      .refine(
        (value) => {
          const publicKey = addressToPublicKey(value)
          return !publicKey || !stringEquals(publicKey, accountPublicKey)
        },
        { error: t("myAssets.tracked.manage.error.own") },
      )
      .refine(
        (value) => {
          const publicKey = addressToPublicKey(value)
          return (
            !publicKey ||
            !wallets.some((wallet) => stringEquals(wallet.publicKey, publicKey))
          )
        },
        { error: t("myAssets.tracked.manage.error.duplicate") },
      )
      .refine(() => wallets.length < MAX_TRACKED_WALLETS, {
        error: t("myAssets.tracked.manage.error.limit", {
          max: MAX_TRACKED_WALLETS,
        }),
      }),
  })
}

export const useManageTrackedWalletsForm = () => {
  return useForm<ManageTrackedWalletsFormValues>({
    mode: "onChange",
    defaultValues: {
      address: "",
    },
    resolver: standardSchemaResolver(useManageTrackedWalletsSchema()),
  })
}
