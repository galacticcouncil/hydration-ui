import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToHours } from "date-fns"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import {
  nativeTokenLocksQuery,
  TokenLockType,
  useNativeTokenLocks,
} from "@/api/balances"
import {
  Conviction,
  CONVICTIONS_BLOCKS_BY_INDEX,
  ongoingReferendaQuery,
} from "@/api/democracy"
import { claimableVotingRewardsQuery } from "@/api/gigaStake"
import i18n from "@/i18n"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt } from "@/utils/formatting"
import { positive } from "@/utils/validators"

export const VOTE_TYPES = ["aye", "nay", "split", "abstain"] as const

export type VoteType = (typeof VOTE_TYPES)[number]

export const VOTE_TYPE_OPTIONS = [
  { id: "aye", label: i18n.t("staking:referenda.item.aye") },
  { id: "nay", label: i18n.t("staking:referenda.item.nay") },
  { id: "split", label: i18n.t("staking:referenda.item.split") },
  { id: "abstain", label: i18n.t("staking:referenda.item.abstain") },
] satisfies readonly { id: VoteType; label: string }[]

export type VoteModalFormValues = {
  voteType: VoteType
  multiplier: Conviction
  amount: string
  aye: string
  nay: string
  abstain: string
  asset: TAssetData
}

export const useVoteModal = (
  referendumId: number,
  onSubmitted?: () => void,
  isGigaStaking?: boolean,
) => {
  const { account } = useAccount()
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { getBalance } = useAccountBalances()
  const { data: locks } = useNativeTokenLocks()
  const hdxBalance = getBalance(native.id)

  const governanceLocks = locks?.get(TokenLockType.OpenGov) ?? 0n
  const governanceLocksHuman = scaleHuman(governanceLocks, native.decimals)
  const allLocks = Big.max(
    locks?.get(TokenLockType.Staking)?.toString() ?? 0,
    governanceLocks.toString(),
  )
  const allLocksHuman = scaleHuman(allLocks.toString(), native.decimals)
  const ghdxLocks = locks?.get(TokenLockType.GigaStaking) ?? 0n
  const ghdxLocksHuman = scaleHuman(ghdxLocks.toString(), native.decimals)

  const totalHdxBalance = hdxBalance?.free?.toString() ?? "0"
  const totalHdxBalanceHuman = scaleHuman(totalHdxBalance, native.decimals)

  const hdxAtomic = (v: string) => toBigInt(v || "0", native.decimals)

  const form = useForm<VoteModalFormValues>({
    mode: "onChange",
    defaultValues: {
      voteType: "aye",
      multiplier: 0,
      amount: isGigaStaking ? ghdxLocksHuman : "",
      aye: "",
      nay: "",
      abstain: "",
      asset: native,
    },
    resolver: standardSchemaResolver(
      z
        .object({
          amount: z.string(),
          aye: z.string(),
          nay: z.string(),
          abstain: z.string(),
          asset: z.custom<TAssetData>(),
          voteType: z.enum(VOTE_TYPES),
          multiplier: z.custom<Conviction>(),
        })
        .superRefine((data, { addIssue }) => {
          const parseHuman = (raw: string, path: VoteType) => {
            try {
              return new Big(raw || "0")
            } catch {
              addIssue({
                code: "custom",
                message: t("error.validNumber"),
                path: [path],
              })
              return null
            }
          }

          const assertNonNegative = (value: Big, path: VoteType) => {
            if (value.lt(0)) {
              addIssue({
                code: "custom",
                message: t("error.positive"),
                path: [path],
              })
              return false
            }
            return true
          }

          if (data.voteType === "split") {
            const ayeNum = parseHuman(data.aye, "aye")
            const nayNum = parseHuman(data.nay, "nay")

            if (ayeNum === null || nayNum === null) {
              return
            }

            if (ayeNum.lte(0) && nayNum.lte(0)) {
              addIssue({
                code: "custom",
                message: t("error.positive"),
                path: ["aye"],
              })

              return
            }

            if (
              !assertNonNegative(ayeNum, "aye") ||
              !assertNonNegative(nayNum, "nay")
            ) {
              return
            }

            if (ayeNum.plus(nayNum).gt(totalHdxBalanceHuman)) {
              const msg = t("error.maxBalance")
              addIssue({ code: "custom", message: msg, path: ["aye"] })
              addIssue({ code: "custom", message: msg, path: ["nay"] })
            }
            return
          }

          if (data.voteType === "abstain") {
            const ayeNum = parseHuman(data.aye, "aye")
            const nayNum = parseHuman(data.nay, "nay")
            const abstainNum = parseHuman(data.abstain, "abstain")

            if (ayeNum === null || nayNum === null || abstainNum === null) {
              return
            }

            if (ayeNum.lte(0) && nayNum.lte(0) && abstainNum.lte(0)) {
              addIssue({
                code: "custom",
                message: t("error.positive"),
                path: ["aye"],
              })

              return
            }

            if (
              !assertNonNegative(ayeNum, "aye") ||
              !assertNonNegative(nayNum, "nay") ||
              !assertNonNegative(abstainNum, "abstain")
            ) {
              return
            }
            if (ayeNum.plus(nayNum).plus(abstainNum).gt(totalHdxBalanceHuman)) {
              const msg = t("error.maxBalance")
              addIssue({ code: "custom", message: msg, path: ["aye"] })
              addIssue({ code: "custom", message: msg, path: ["nay"] })
              addIssue({ code: "custom", message: msg, path: ["abstain"] })
            }
            return
          }

          const amountParsed = positive.safeParse(data.amount)

          if (!amountParsed.success) {
            addIssue({
              code: "custom",
              message:
                amountParsed.error.issues[0]?.message ?? t("error.positive"),
              path: ["amount"],
            })
            return
          }
          if (Big(data.amount || "0").gt(totalHdxBalanceHuman)) {
            addIssue({
              code: "custom",
              message: t("error.maxBalance"),
              path: ["amount"],
            })
          }
        }),
    ),
  })

  const voteType = form.watch("voteType")
  const [multiplier, amount, aye, nay, abstain] = form.watch([
    "multiplier",
    "amount",
    "aye",
    "nay",
    "abstain",
  ])

  const lockedBlocks = CONVICTIONS_BLOCKS_BY_INDEX[multiplier] ?? 0
  const lockedDays = millisecondsToHours(lockedBlocks * rpc.slotDurationMs) / 24
  const totalVotes = (() => {
    if (voteType === "split") {
      return Big(aye || "0")
        .add(nay || "0")
        .toString()
    }
    if (voteType === "abstain") {
      return Big(aye || "0")
        .add(nay || "0")
        .add(abstain || "0")
        .toString()
    }
    return Big(amount || "0").toString()
  })()

  const totalVotesWithMultiplier =
    voteType === "aye" || voteType === "nay"
      ? Big(totalVotes)
          .mul(multiplier || 0.1)
          .toString()
      : totalVotes

  const mutation = useMutation({
    mutationFn: async ({
      voteType,
      multiplier,
      amount,
      aye,
      nay,
      abstain: abstainAmount,
    }: VoteModalFormValues) => {
      const buildAccountVote = () => {
        if (voteType === "aye" || voteType === "nay") {
          const isAye = voteType === "aye"
          const balance = hdxAtomic(amount)
          return {
            type: "Standard" as const,
            value: {
              vote: (isAye ? 0x80 : 0x00) | (multiplier & 0x7f),
              balance,
            },
          }
        }
        if (voteType === "split") {
          return {
            type: "Split" as const,
            value: {
              aye: hdxAtomic(aye),
              nay: hdxAtomic(nay),
            },
          }
        }
        return {
          type: "SplitAbstain" as const,
          value: {
            aye: hdxAtomic(aye),
            nay: hdxAtomic(nay),
            abstain: hdxAtomic(abstainAmount),
          },
        }
      }

      const tx = rpc.papi.tx.ConvictionVoting.vote({
        poll_index: referendumId,
        vote: buildAccountVote(),
      })

      const toasts = {
        submitted: t("staking:referenda.vote.modal.toasts.submitted", {
          referendumId,
        }),
        success: t("staking:referenda.vote.modal.toasts.success", {
          referendumId,
        }),
      }

      const executedTransfarableAmount = Big(totalVotes)
        .minus(
          scaleHuman(hdxBalance?.frozen?.toString() ?? "0", native.decimals),
        )
        .toString()

      const invalidateQueriesBase = [
        ["accountOpenGovVotes"],
        ["openGovReferenda"],
        nativeTokenLocksQuery(rpc, account?.address ?? "").queryKey,
        ongoingReferendaQuery(rpc).queryKey,
      ]

      const invalidateQueries = isGigaStaking
        ? [
            ...invalidateQueriesBase,
            claimableVotingRewardsQuery(rpc, account?.address ?? "").queryKey,
          ]
        : invalidateQueriesBase

      return createTransaction(
        {
          tx,
          invalidateQueries,
          toasts,
          executedAmount: {
            amount: executedTransfarableAmount,
            assetId: native.id,
          },
        },
        { onSubmitted },
      )
    },
  })

  const onSubmit = (data: VoteModalFormValues) => {
    mutation.mutate(data)
  }

  return {
    form,
    totalHdxBalance,
    totalHdxBalanceHuman,
    lockedDays,
    totalVotesWithMultiplier,
    ghdxLocksHuman,
    onSubmit,
    governanceLocksHuman,
    allLocksHuman,
  }
}
