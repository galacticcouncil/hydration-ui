import { useNavigate, useSearch } from "@tanstack/react-location"
import { useTranslation } from "react-i18next"
import { usePrevious } from "react-use"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useToast } from "state/toasts"
import { useReferralToastStore } from "./components/ReferralsStore.utils"
import { useReferralCodes, useUserReferrer } from "api/referrals"
import { useEffect } from "react"
import { getChainSpecificAddress } from "utils/formatting"
import { useReferralCodesStore } from "sections/referrals/store/useReferralCodesStore"

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
  const storedReferralCodes = useReferralCodesStore()
  const storedReferralCode = account
    ? storedReferralCodes.referralCodes[account.address]
    : undefined

  const queryParamReferralCode = search?.referral?.toString()

  const activeReferralCode = storedReferralCode ?? queryParamReferralCode

  const { data: referrer } = useUserReferrer(account?.address)
  const isNoReferrer = referrer === null

  const { data: codes, isInitialLoading } = useReferralCodes(
    isNoReferrer && activeReferralCode ? "all" : undefined,
  )

  const isLoadedCodes = isNoReferrer ? !isInitialLoading : false

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

      if (activeReferralCode && !referralStore.displayed) {
        const state = useReferralCodesStore.getState()

        const isValidCode = codes?.find(
          (code) => code?.referralCode === activeReferralCode,
        )
        referralStore.display()

        if (isValidCode) {
          if (
            isValidCode.accountAddress !==
            getChainSpecificAddress(account.address)
          ) {
            temporary({
              hideTime: 6000,
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
    codes,
    queryParamReferralCode,
    account?.address,
    isLoadedCodes,
    referralStore.displayed,
  ])

  return null
}
