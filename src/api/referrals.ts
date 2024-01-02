import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { undefinedNoop } from "utils/helpers"
import BN from "bignumber.js"

export const useReferralCodes = (accountAddress?: string | "all") => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.referralCodes(accountAddress),
    accountAddress !== undefined
      ? async () => {
          const allCodes = await getReferralCodes(api)()

          return accountAddress !== "all"
            ? [allCodes.find((code) => code.accountAddress === accountAddress)]
            : allCodes
        }
      : undefinedNoop,
    { enabled: !!accountAddress },
  )
}

const getReferralCodes = (api: ApiPromise) => async () => {
  const rawData = await api.query.referrals.referralCodes.entries()

  const data = rawData.map(([rawCode, address]) => {
    const [code] = rawCode.toHuman() as string[]

    return {
      accountAddress: address.toString(),
      referralCode: code,
    }
  })

  return data
}

export const useReferralCodeLength = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.referralCodeLength, async () => {
    const rawDara = (await api.consts.referrals.codeLength) as u32

    return rawDara.toBigNumber()
  })
}

export const useUserReferrer = (accountAddress?: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.userReferrer(accountAddress),
    !!accountAddress ? getUserReferrer(api, accountAddress) : undefinedNoop,
    {
      enabled: !!accountAddress,
    },
  )
}

const getUserReferrer =
  (api: ApiPromise, accountAddress: string) => async () => {
    const rawData = await api.query.referrals.linkedAccounts(accountAddress)
    //@ts-ignore
    const data = rawData.unwrapOr(null)

    return (data?.toString() as string) || null
  }

export const useReferrerInfo = (referrerAddress?: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.referrerInfo(referrerAddress),
    !!referrerAddress ? getReferrerInfo(api, referrerAddress) : undefinedNoop,
    {
      enabled: !!referrerAddress,
    },
  )
}

const getReferrerInfo =
  (api: ApiPromise, referrerAddress: string) => async () => {
    const rawData = await api.query.referrals.referrer(referrerAddress)
    //@ts-ignore
    const [tier, paidRewards] = rawData.unwrapOr(null) ?? []

    return {
      tier: Number(tier.type.slice(-1)),
      paidRewards: paidRewards.toBigNumber() as BN,
    }
  }

export const useAccountReferralShares = (accountAddress?: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountReferralShares(accountAddress),
    !!accountAddress
      ? getAccountReferralShares(api, accountAddress)
      : undefinedNoop,
    {
      enabled: !!accountAddress,
    },
  )
}

const getAccountReferralShares =
  (api: ApiPromise, accountAddress: string) => async () => {
    const [totalSharesRaw, accountSharesRaw] = await Promise.all([
      api.query.referrals.totalShares(),
      api.query.referrals.shares(accountAddress),
    ])

    return {
      //@ts-ignore
      accountShares: accountSharesRaw.toBigNumber() as BN,
      //@ts-ignore
      totalShares: totalSharesRaw.toBigNumber() as BN,
    }
  }

export const useReferrerAddress = (referrerCode: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.referrerAddress(referrerCode),
    !!referrerCode ? getReferrerAddress(api, referrerCode) : undefinedNoop,
    {
      enabled: !!referrerCode,
    },
  )
}

const getReferrerAddress =
  (api: ApiPromise, referrerCode: string) => async () => {
    const rawData = await api.query.referrals.referralCodes(referrerCode)
    //@ts-ignore
    const data = rawData.unwrapOr(null)

    return (data?.toString() as string) || null
  }
