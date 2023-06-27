import { TableStatsSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { useStakingAccountsTableSkeleton } from "./StakingAccountSkeleton.utils"
import { SContainer } from "sections/staking/StakingPage.styled"

export const StakingAccountSkeleton = () => {
  const { t } = useTranslation()
  const table = useStakingAccountsTableSkeleton()

  return (
    <SContainer sx={{ pt: [0, 20] }}>
      <TableStatsSkeleton
        table={table}
        title={t("stats.overview.table.trades.header.title")}
        css={{ backgroundImage: "none" }}
      />
    </SContainer>
  )
}
