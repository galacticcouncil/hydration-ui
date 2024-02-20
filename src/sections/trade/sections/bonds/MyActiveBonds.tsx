import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"
import { Placeholder } from "./table/placeholder/Placeholder"
import { useBondsTableData } from "./BondsTable.utils"

type Props = {
  showTransactions?: boolean
  showTransfer?: boolean
  id?: string
  search?: string
}

export const MyActiveBonds = ({
  showTransactions,
  showTransfer,
  id,
  search,
}: Props) => {
  const { t } = useTranslation()

  const tableProps = {
    title: t("bonds.table.title"),
    showTransactions,
    showTransfer,
  }

  const { data, isLoading, isAccount, isAllAssets, setAllAssets } =
    useBondsTableData({
      id,
      search,
    })

  if (!isAccount) {
    return <Placeholder {...tableProps} />
  }

  if (isLoading) {
    return <Skeleton {...tableProps} />
  }

  if (!isLoading && !data.length) return null

  return (
    <BondsTable
      {...tableProps}
      data={data}
      allAssets={isAllAssets}
      setAllAssets={setAllAssets}
    />
  )
}
