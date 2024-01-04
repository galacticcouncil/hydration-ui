import { useNavigate, useSearch } from "@tanstack/react-location"
import { useTranslation } from "react-i18next"
import { usePrevious } from "react-use"
import {
  useAccount,
  useReferralCode,
} from "sections/web3-connect/Web3Connect.utils"
import { useToast } from "state/toasts"
import { useReferralToastStore } from "./components/ReferralsStore.utils"
import { useReferralCodes, useUserReferrer } from "api/referrals"
import { useEffect } from "react"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { getChainSpecificAddress } from "utils/formatting"

export const ReferralsConnect = () => {
  const navigate = useNavigate()
  const { account } = useAccount()
  const { t } = useTranslation()
  const search = useSearch<{
    Search: {
      referral: string
    }
  }>()
  const prevAccount = usePrevious(account)
  const { temporary } = useToast()

  const referralStore = useReferralToastStore()
  const storedReferralCodes = useReferralCode()

  const referrer = useUserReferrer(account?.address)
  const isNoReferrer = referrer.data === null

  const codes = useReferralCodes(isNoReferrer ? "all" : undefined)

  const isLoadedCodes = isNoReferrer ? !codes.isInitialLoading : false

  const queryParamReferralCode = search?.referral?.toString()

  useEffect(() => {
    // reset displaying referral toasts when switching accounts
    if (
      prevAccount?.address &&
      prevAccount?.address !== account?.address &&
      referralStore.displayed
    ) {
      referralStore.reset()
    }
  }, [prevAccount?.address, account?.address, referralStore])

  useEffect(() => {
    // I am connected, my code is loaded, all referrals coded are load
    if (account && isLoadedCodes && !account.isExternalWalletConnected) {
      // referral code stored in the local storage
      const storedReferralCode =
        storedReferralCodes.referralCode[account.address]

      if (
        (storedReferralCode || queryParamReferralCode) &&
        !referralStore.displayed
      ) {
        const state = useWeb3ConnectStore.getState()

        const isValidCode = codes.data?.find(
          (code) =>
            code?.referralCode ===
            (storedReferralCode || queryParamReferralCode),
        )
        referralStore.display()

        if (isValidCode) {
          if (
            isValidCode.accountAddress !==
            getChainSpecificAddress(account.address)
          ) {
            temporary({
              title: (
                <div>
                  <p className="referralTitle">
                    {t("referrals.toasts.storedCode.valid.title")}
                  </p>
                  <p className="referralDesc">
                    {t("referrals.toasts.storedCode.valid.desc")}
                  </p>
                </div>
              ),
            })

            if (queryParamReferralCode && !storedReferralCode) {
              state.setReferralCode(queryParamReferralCode, account.address)
            }
          } else {
            temporary({
              title: <p>{t("referrals.toasts.storedCode.invalid.myCode")}</p>,
            })
          }
        } else {
          temporary({
            title: <p>{t("referrals.toasts.storedCode.invalid.existence")}</p>,
          })
        }
        if (queryParamReferralCode) {
          navigate({
            search: {
              ...search,
              referral: undefined,
            },
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    codes.data,
    queryParamReferralCode,
    account?.address,
    isLoadedCodes,
    referralStore.displayed,
  ])

  return null
}
