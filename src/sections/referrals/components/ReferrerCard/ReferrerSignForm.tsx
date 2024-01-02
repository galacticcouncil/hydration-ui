import { Controller, useForm } from "react-hook-form"
import { FormValues } from "utils/helpers"
import { SInput } from "sections/referrals/components/CodeInput/CodeInput.styled"
import { Button } from "components/Button/Button"
import { useReferralCodeLength, useReferralCodes } from "api/referrals"
import {
  REFERRAL_CODE_MAX_LENGTH,
  REFERRAL_CODE_REGEX,
} from "sections/referrals/ReferralsPage.utils"
import { Trans, useTranslation } from "react-i18next"
import { ErrorMessage } from "components/Label/Label.styled"
import { useRpcProvider } from "providers/rpcProvider"
import {
  useAccount,
  useReferralCode,
} from "sections/web3-connect/Web3Connect.utils"
import { ToastMessage, useStore } from "state/store"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Text } from "components/Typography/Text/Text"
import { TOAST_MESSAGES } from "state/toasts"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { getAddressVariants } from "utils/formatting"
import { PreviewReferrer } from "sections/referrals/components/PreviewReferrer/PreviewReferrer"

export const ReferrerSignForm = () => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { setReferralCode } = useWeb3ConnectStore()

  const { t } = useTranslation()
  const referralCodes = useReferralCodes("all")
  const referralCodeLength = useReferralCodeLength()

  const storedReferralCodes = useReferralCode()

  const storedReferralCode = account?.address
    ? storedReferralCodes.referralCode[account.address]
    : undefined

  const form = useForm<{ code: string }>({
    mode: "onChange",
    values: { code: storedReferralCode ?? "" },
  })

  const value = form.watch("code")

  const referral = referralCodes.data?.find(
    (referralCode) => referralCode?.referralCode === value,
  )

  const onSubmit = async (values: FormValues<typeof form>) => {
    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <>
          <Trans
            i18nKey={`referrals.toasts.linkCode.${msType}`}
            tOptions={{
              code: values.code,
            }}
          >
            <span />
          </Trans>
        </>
      )
      return memo
    }, {} as ToastMessage)

    const transaction = await createTransaction(
      {
        tx: api.tx.referrals.linkCode(values.code),
      },
      { toast },
    )

    if (!transaction.isError) {
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.referralCodes(
          account?.address
            ? getAddressVariants(account.address).hydraAddress
            : undefined,
        ),
      })
      account && setReferralCode(undefined, account.address)
    }
  }

  const referralCodeMaxLength =
    referralCodeLength.data?.toNumber() || REFERRAL_CODE_MAX_LENGTH

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{ width: "100%" }}
    >
      <div sx={{ flex: "column", gap: 16 }}>
        <Text fs={14} color="brightBlue300">
          {t("referrals.signForm.desc")}
        </Text>
        <div sx={{ flex: "row", gap: 8, flexWrap: ["wrap", "nowrap"] }}>
          <Controller
            name="code"
            control={form.control}
            rules={{
              required: t("referrals.input.error.required"),
              validate: {
                alphanumeric: (value) =>
                  REFERRAL_CODE_REGEX.test(value) ||
                  t("referrals.input.error.alphanumeric"),
                length: (value) =>
                  value.length === referralCodeMaxLength ||
                  t("referrals.input.error.maxLength", {
                    length: referralCodeMaxLength,
                  }),
                validCode: (value) => {
                  const code = referralCodes.data?.find(
                    (referralCode) => referralCode?.referralCode === value,
                  )

                  if (code) {
                    if (
                      account?.address &&
                      code.accountAddress !==
                        getAddressVariants(account.address).hydraAddress
                    )
                      return true

                    return t("referrals.input.error.myCode")
                  }

                  return t("referrals.input.error.invalidCode")
                },
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <div css={{ flex: 1, minWidth: 120, flexBasis: "60%" }}>
                <SInput
                  autoComplete="off"
                  disabled={
                    !account?.address || account.isExternalWalletConnected
                  }
                  hasError={!!error}
                  sx={{ height: 38 }}
                  placeholder={t("referrals.signForm.placeholder")}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                {error && (
                  <ErrorMessage css={{ position: "absolute" }}>
                    {error.message}
                  </ErrorMessage>
                )}
              </div>
            )}
          />
          <Button
            variant="blue"
            css={{ whiteSpace: "nowrap", flex: 1 }}
            size="small"
            disabled={!account?.address || account.isExternalWalletConnected}
          >
            {t("referrals.signForm.btn")}
          </Button>
        </div>
      </div>

      <PreviewReferrer referrerAddress={referral?.accountAddress} isPopover />
    </form>
  )
}
