import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { shortenAccountAddress } from "utils/formatting"
import { TReferralsTableData } from "./data/ReferralsTableData.utils"
import { useReferrerInfo } from "api/referrals"
import { useAccountIdentity } from "api/stats"
import Skeleton from "react-loading-skeleton"
import { referralRewards } from "sections/referrals/ReferralsPage.utils"
import { BN_NAN } from "utils/constants"

const AccountTier = ({ address }: { address: string }) => {
  const referrerInfo = useReferrerInfo(address)

  if (referrerInfo.isInitialLoading) return <Skeleton height={16} width={60} />

  return (
    <Text color="white" css={{ whiteSpace: "nowrap" }}>
      {referrerInfo.data?.tier ?? "-"}
    </Text>
  )
}

const AccountName = ({ address }: { address: string }) => {
  const identity = useAccountIdentity(address)

  if (identity.data?.identity) return <>{identity.data.identity}</>

  return <Text color="white">{shortenAccountAddress(address)}</Text>
}

const Rewards = ({ address }: { address: string }) => {
  const { t } = useTranslation()
  const referrerInfo = useReferrerInfo(address)

  const currentTierData =
    referrerInfo.data && referrerInfo.data.tier !== undefined
      ? referralRewards[referrerInfo.data.tier]
      : undefined

  if (referrerInfo.isLoading) return <Skeleton height={16} width={60} />

  return (
    <Text color="white" css={{ whiteSpace: "nowrap" }}>
      {t("value.percentage", { value: currentTierData?.referrer ?? BN_NAN })}
    </Text>
  )
}

export const useReferralsTable = (
  data: TReferralsTableData,
  { onTipUser }: { onTipUser: (address: string) => void },
) => {
  const { t } = useTranslation()

  const { accessor, display } =
    createColumnHelper<TReferralsTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const columnVisibility: VisibilityState = {
    account: true,
    rewards: true,
    tier: true,
    actions: true,
  }

  const columns = [
    accessor("account", {
      id: "account",
      header: t("referrals.table.header.account"),
      sortingFn: (a, b) => a.original.account.localeCompare(b.original.account),
      cell: ({ row }) => <AccountName address={row.original.account} />,
    }),
    accessor("account", {
      id: "tier",
      header: t("referrals.table.header.tier"),
      cell: ({ row }) => <AccountTier address={row.original.account} />,
    }),
    accessor("account", {
      id: "rewards",
      header: t("referrals.table.header.rewards"),
      cell: ({ row }) => <Rewards address={row.original.account} />,
    }),

    display({
      id: "actions",
      cell: ({ row }) => (
        <div css={{ whiteSpace: "nowrap" }} sx={{ pr: 20 }}>
          <Button
            size="micro"
            onClick={() => onTipUser(row.original.account)}
            sx={{ width: ["auto", 146], height: 24 }}
          >
            {t("referrals.table.btn.tipUser")}
          </Button>
        </div>
      ),
    }),
  ]

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
