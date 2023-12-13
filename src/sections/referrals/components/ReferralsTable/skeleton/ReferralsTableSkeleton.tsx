import { TableStatsSkeleton } from "components/Table/TableSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useReferralsTableSkeleton } from "./ReferralsTableSkeleton.utils"

export const ReferralsTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useReferralsTableSkeleton()

  return (
    <TableStatsSkeleton
      table={table}
      title={
        <Text fs={15} lh={20} color="white" font="FontOver">
          {t("referrals.table.header.title")}
        </Text>
      }
    />
  )
}
