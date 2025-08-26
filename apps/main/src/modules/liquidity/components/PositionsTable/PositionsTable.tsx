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
import { StableswapBalanceTable } from "./StableswapBalanceTable"

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

  const { positions, totalBalance, totalInFarms, totalBalanceDisplay } =
    useIsolatedPositions(pool)

  return (
    <PositionsTableBody
      symbol={pool.meta.symbol}
      totalBalance={totalBalance}
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
    totalBalance,
    totalHubBalance,
    totalInFarms,
    totalBalanceDisplay,
  } = useOmnipoolPositions(pool)

  const isVisibleOmnipool = !pool.isStablePool || pool.isStablepoolInOmnipool
  const isVisibleABalance = Big(pool.aStableswapBalance?.toString() ?? 0).gt(0)
  const isVisibleStableswapBalance = Big(
    pool.stableswapBalance?.toString() ?? 0,
  ).gt(0)

  const tables: React.ReactNode[] = []

  if (isVisibleOmnipool) {
    tables.push(
      <OmnipoolPositions pool={pool} positions={positions} key="omnipool" />,
    )
  }

  if (isVisibleStableswapBalance) {
    if (tables.length > 0) {
      tables.push(<Separator key="separator-stableswap" />)
    }

    tables.push(<StableswapBalanceTable pool={pool} key="balance" />)
  }

  if (isVisibleABalance) {
    if (tables.length > 0) {
      tables.push(<Separator key="separator-atoken" />)
    }

    tables.push(<ATokenBalanceTable pool={pool} key="atoken" />)
  }

  if (tables.length === 0) return null

  return (
    <PositionsTableBody
      symbol={pool.meta.symbol}
      totalBalance={totalBalance}
      totalHubBalance={totalHubBalance}
      totalInFarms={totalInFarms}
      totalBalanceDisplay={totalBalanceDisplay}
    >
      {tables}
    </PositionsTableBody>
  )
}

const PositionsTableBody = ({
  symbol,
  totalBalance,
  totalHubBalance,
  totalInFarms,
  totalBalanceDisplay,
  children,
}: {
  symbol: string
  children?: React.ReactNode
  totalBalance: string
  totalInFarms: string
  totalBalanceDisplay: string
  totalHubBalance?: string
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
            symbol={symbol}
            totalBalance={totalBalance}
            totalHubBalance={totalHubBalance}
            totalInFarms={totalInFarms}
            totalBalanceDisplay={totalBalanceDisplay}
          />
          <CollapsibleContent>{children}</CollapsibleContent>
        </TableContainer>
      </CollapsibleRoot>
    </>
  )
}
