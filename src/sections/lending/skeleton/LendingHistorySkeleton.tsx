import { Search } from "components/Search/Search"
import { TableSkeleton } from "components/Skeleton/TableSkeleton"
import { defaultPaginationState } from "components/Table/TablePagination"
import { useTranslation } from "react-i18next"
import { noop } from "utils/helpers"

export const LendingHistorySkeleton = () => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <Search
        value=""
        onChange={noop}
        placeholder={t("lending.history.search.placeholder")}
        disabled
      />
      <TableSkeleton
        rowCount={defaultPaginationState.pageSize}
        colCount={2}
        colSizes={[20, 80]}
        background="transparent"
      />
    </div>
  )
}
