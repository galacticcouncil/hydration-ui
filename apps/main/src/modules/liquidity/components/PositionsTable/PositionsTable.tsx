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
import { useNavigate, useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { Circle } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
import {
  DepositPosition,
  isOmnipoolDepositFullPosition,
} from "@/states/account"

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
      positions={pool.positions}
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

  const isVisibleOmnipool = positions.length > 0
  const isVisibleABalance = Big(pool.aStableswapBalance?.toString() ?? 0).gt(0)

  const tables: React.ReactNode[] = []

  if (isVisibleOmnipool) {
    tables.push(
      <OmnipoolPositions pool={pool} positions={positions} key="omnipool" />,
    )
  }

  if (isVisibleABalance) {
    if (tables.length > 0) {
      tables.push(<Separator key="separator-atoken" sx={{ minWidth: 900 }} />)
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
      positions={pool.positions.filter(isOmnipoolDepositFullPosition)}
    >
      {tables}
    </PositionsTableBody>
  )
}

const PositionsTableBody = ({
  totalInFarms,
  totalBalanceDisplay,
  children,
  positions,
}: {
  children?: React.ReactNode
  totalInFarms: string
  totalBalanceDisplay: string
  positions: DepositPosition[]
}) => {
  const expanded =
    useSearch({
      from: "/liquidity/$id",
      select: (search) => search.expanded,
    }) ?? false

  const navigate = useNavigate({ from: "/liquidity/$id" })
  const { isTablet, isMobile } = useBreakpoints()

  const onClick = () => {
    navigate({
      search: (prev) => ({ ...prev, expanded: !prev.expanded }),
      replace: true,
    })
  }

  return (
    <>
      {(isTablet || isMobile) && !!totalInFarms && (
        <ClaimCard sx={{ mb: 12 }} positions={positions} />
      )}
      <CollapsibleRoot open={expanded}>
        <TableContainer
          as={Paper}
          sx={{ mb: getTokenPx("containers.paddings.primary") }}
        >
          <PositionsHeader
            onClick={onClick}
            showMore={expanded}
            totalInFarms={totalInFarms}
            totalBalanceDisplay={totalBalanceDisplay}
            positions={positions}
          />
          <CollapsibleContent css={{ overflowX: "auto" }}>
            {children}
          </CollapsibleContent>
        </TableContainer>
      </CollapsibleRoot>
    </>
  )
}
