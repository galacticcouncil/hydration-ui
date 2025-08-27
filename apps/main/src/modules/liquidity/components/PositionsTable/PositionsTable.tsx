import {
  CollapsibleContent,
  CollapsibleRoot,
  DataTable,
  Icon,
  Paper,
  Separator,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Circle } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { ATokenBalanceTable } from "./ATokenBalanceTable"
import { ClaimCard } from "./ClaimCard"
import { OmnipoolPositions } from "./OmnipoolPositions"
import { PositionsHeader } from "./PositionsHeader"
import { useIsolatedPositionsTableColumns } from "./PositionsTable.columns"
import { STableHeader } from "./PositionsTable.styled"
import {
  useIsolatedPositions,
  useOmnipoolPositions,
} from "./PositionsTable.utils"

export const PositionsTable = ({
  pool,
}: {
  pool: OmnipoolAssetTable | IsolatedPoolTable
}) =>
  isIsolatedPool(pool) ? (
    <IsolatedPoolPositions pool={pool} />
  ) : (
    <OmnipoolStablepoolPositions pool={pool} />
  )

const IsolatedPoolPositions = ({ pool }: { pool: IsolatedPoolTable }) => {
  const { t } = useTranslation("liquidity")
  const columns = useIsolatedPositionsTableColumns(pool.isFarms)

  const { positions, totalInFarms, totalBalanceDisplay } =
    useIsolatedPositions(pool)

  return (
    <PositionsTableBody
      totalInFarms={totalInFarms}
      totalBalanceDisplay={totalBalanceDisplay}
    >
      <STableHeader>
        <Icon component={Circle} size={12} />
        <Text fw={500} font="primary">
          {t("liquidity.positions.label.isolated")}
        </Text>
      </STableHeader>
      <DataTable
        data={positions}
        columns={columns}
        paginated
        pageSize={10}
        columnPinning={{
          left: ["position"],
        }}
      />
    </PositionsTableBody>
  )
}

const OmnipoolStablepoolPositions = ({
  pool,
}: {
  pool: OmnipoolAssetTable
}) => {
  const {
    positions,
    totalInFarms,
    totalBalanceDisplay,
    aStableswapDisplayBalance,
  } = useOmnipoolPositions(pool)

  const isVisibleOmnipool = !pool.isStablePool || pool.isStablepoolInOmnipool
  const isVisibleABalance = Big(pool.aStableswapBalance?.toString() ?? 0).gt(0)

  const tables: React.ReactNode[] = []

  if (isVisibleOmnipool) {
    tables.push(
      <OmnipoolPositions pool={pool} positions={positions} key="omnipool" />,
    )
  }

  if (isVisibleABalance) {
    if (tables.length > 0) {
      tables.push(<Separator key="separator-atoken" />)
    }

    tables.push(
      <ATokenBalanceTable
        pool={pool}
        aStableswapDisplayBalance={aStableswapDisplayBalance}
        key="atoken"
      />,
    )
  }

  if (tables.length === 0) return null

  return (
    <PositionsTableBody
      totalInFarms={totalInFarms}
      totalBalanceDisplay={totalBalanceDisplay}
    >
      {tables}
    </PositionsTableBody>
  )
}

const PositionsTableBody = ({
  totalInFarms,
  totalBalanceDisplay,
  children,
}: {
  children?: React.ReactNode
  totalInFarms: string
  totalBalanceDisplay: string
}) => {
  const { isTablet, isMobile } = useBreakpoints()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {(isTablet || isMobile) && <ClaimCard sx={{ mb: 12 }} />}
      <CollapsibleRoot>
        <TableContainer
          as={Paper}
          sx={{ mb: getTokenPx("containers.paddings.primary") }}
        >
          <PositionsHeader
            onClick={() => setShowMore((v) => !v)}
            showMore={showMore}
            totalInFarms={totalInFarms}
            totalBalanceDisplay={totalBalanceDisplay}
          />
          <CollapsibleContent>{children}</CollapsibleContent>
        </TableContainer>
      </CollapsibleRoot>
    </>
  )
}
