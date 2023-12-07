import { Controller, useForm } from "react-hook-form"
import { FormValues } from "utils/helpers"
import { WavySeparator } from "components/WavySeparator/WavySeparator"
import { CodeInput } from "sections/referrals/components/CodeInput/CodeInput"
import { CodePreview } from "sections/referrals/components/CodePreview/CodePreview"
import { Account, useAccountStore } from "state/store"
import { Button } from "components/Button/Button"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useTranslation } from "react-i18next"
import { BN_0, BN_100 } from "utils/constants"
import BN from "bignumber.js"
import {
  REFERRAL_CODE_MAX_LENGTH,
  REFERRAL_CODE_REGEX,
} from "sections/referrals/ReferralsPage.utils"

const IS_FUNDED = true

type CodeFormValues = {
  referralCode: string
}

const defaultCodeFormValues: CodeFormValues = {
  referralCode: "",
}

enum UserState {
  FUNDED,
  NOT_FUNDED,
  DISCONECTED,
  UNKNOWN,
}

export const CodeForm = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  // @TODO: check actual user wallet balance
  const balance = IS_FUNDED ? BN_100 : BN_0

  const form = useForm<CodeFormValues>({
    mode: "onChange",
    defaultValues: defaultCodeFormValues,
  })

  const referralCode = form.watch("referralCode")

  const onSubmit = async (values: FormValues<typeof form>) => {
    // @TODO: handle submit
    console.log(values)
  }

  const isDisabled = !account?.address || balance.isZero()

  const state = getUserState(account, balance)

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{ flex: ["column", "row"], gap: 12 }}
      >
        <Controller
          name="referralCode"
          control={form.control}
          rules={{
            required: t("referrals.input.error.required"),
            validate: {
              alphanumeric: (value) =>
                REFERRAL_CODE_REGEX.test(value) ||
                t("referrals.input.error.alphanumeric"),
              maxLength: (value) =>
                value.length <= REFERRAL_CODE_MAX_LENGTH ||
                t("referrals.input.error.maxLength", {
                  length: REFERRAL_CODE_MAX_LENGTH,
                }),
            },
          }}
          render={({ field, fieldState }) => (
            <CodeInput
              {...field}
              disabled={isDisabled}
              error={fieldState.error?.message}
              sx={{ width: ["100%", "50%"] }}
              placeholder={
                state === UserState.FUNDED
                  ? t("referrals.input.placeholder.referralCode")
                  : state === UserState.NOT_FUNDED
                  ? t("referrals.input.placeholder.deposit")
                  : state === UserState.DISCONECTED
                  ? t("referrals.input.placeholder.connect")
                  : ""
              }
            />
          )}
        />
        {state === UserState.FUNDED && (
          <Button variant="primary">{t("referrals.button.sign")}</Button>
        )}
        {state === UserState.NOT_FUNDED && (
          <Button variant="primary">
            {t("referrals.button.depositFunds")}
          </Button>
        )}
        {state === UserState.DISCONECTED && (
          <WalletConnectButton sx={{ height: "auto", px: 30 }} />
        )}
      </form>
      <WavySeparator sx={{ my: 20, opacity: 0.15 }} />
      <CodePreview disabled={isDisabled} code={referralCode} />
    </>
  )
}

function getUserState(account?: Account, balance?: BN): UserState {
  if (!account?.address) {
    return UserState.DISCONECTED
  }

  if (balance?.gt(BN_0)) {
    return UserState.FUNDED
  }

  if (balance?.lte(BN_0)) {
    return UserState.NOT_FUNDED
  }

  return UserState.UNKNOWN
}
