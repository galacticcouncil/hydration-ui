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
}

export const MyBonds: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
}) => {
  const { t } = useTranslation("wallet")

  const { data, isLoading } = useMyBondsTableData()

  if (!isLoading && data.length === 0) return null

  return (
    <>
      <SectionHeader title={t("myBonds.header.title")} />
      <MyBondsTable
        data={data}
        isLoading={isLoading}
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
        sortingProps={sortingProps}
      />
    </>
  )
}
