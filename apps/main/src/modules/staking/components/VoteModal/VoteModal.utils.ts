// import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
// import { useAccount } from "@galacticcouncil/web3-connect"
// import { useForm } from "react-hook-form"
// import { useTranslation } from "react-i18next"

// import { useAssets } from "@/providers/assetsProvider"
// import { useRpcProvider } from "@/providers/rpcProvider"
// import { useAccountBalances } from "@/states/account"
// import { useTransactionsStore } from "@/states/transactions"

// type VoteType = "aye" | "nay" | "split" | "abstain"
// const CONVICTION_WEIGHTS = [0.1, 1, 2, 3, 4, 5, 6] as const
// type ConvictionWeight = (typeof CONVICTION_WEIGHTS)[number]

// type VoteModalFormValues = {
//   voteType: VoteType
//   multiplier: ConvictionWeight
//   hdxVoteValue: string
//   gigaHdxVoteValue: string
// }

export const useVoteModal = () => {
  //   const { t } = useTranslation("common")
  //   const { account } = useAccount()
  //   const { getAssetWithFallback, native } = useAssets()
  //   const { papi } = useRpcProvider()
  //   const createTransaction = useTransactionsStore((s) => s.createTransaction)
  //   const { getTransferableBalance } = useAccountBalances()
  //   const hdxBalance = getTransferableBalance(native.id)
  //   const gigaHdxBalance = getTransferableBalance(HDX_ERC20_ASSET_ID)
  //   const form = useForm<VoteModalFormValues>({
  //     mode: "onChange",
  //     defaultValues: {
  //       voteType: "aye",
  //       multiplier: 0.1,
  //       hdxVoteValue: "",
  //       gigaHdxVoteValue: "",
  //     },
  //   })
  //   return {
  //     form,
  //   }
}
