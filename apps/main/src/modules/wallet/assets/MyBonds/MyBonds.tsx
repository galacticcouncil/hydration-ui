import { SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyBondsTable } from "@/modules/wallet/assets/MyBonds/MyBondsTable"
import { useMyBondsTableData } from "@/modules/wallet/assets/MyBonds/MyBondsTable.data"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
  readonly embedded?: boolean
  readonly showAllAssets?: boolean
}

export const MyBonds: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
  embedded = false,
  showAllAssets = false,
}) => {
  const { t } = useTranslation("wallet")

  const { data, isLoading } = useMyBondsTableData(showAllAssets)

  if (!embedded && !isLoading && data.length === 0) return null

  return (
    <>
      {!embedded && <SectionHeader title={t("myBonds.header.title")} />}
      <MyBondsTable
        data={data}
        isLoading={isLoading}
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
        sortingProps={sortingProps}
        embedded={embedded}
      />
    </>
  )
}
