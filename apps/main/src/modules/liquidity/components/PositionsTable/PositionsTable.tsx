import { LiquidityIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  CollapsibleContent,
  CollapsibleRoot,
  DataTable,
  Flex,
  Icon,
  Modal,
  Paper,
  Separator,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { Minus } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { XykDeposit } from "@/api/account"
import { Farm } from "@/api/farms"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { TJoinedFarm } from "@/modules/liquidity/components/Farms/Farms.utils"
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
import { OmnipoolPositions } from "./OmnipoolPositions"
import { PositionDetails } from "./PositionDetails"
import { PositionsHeader } from "./PositionsHeader"
import {
  getIsolatedPositionsTableColumns,
  useIsolatedPositionsTableColumns,
} from "./PositionsTable.columns"
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
  const { isMobile } = useBreakpoints()
  const [selectedPosition, setSelectedPosition] = useState<{
    joinedFarms: TJoinedFarm[]
    farmsToJoin: Farm[]
    position: XykDeposit
  } | null>(null)

  const { positions, totalInFarms, totalBalanceDisplay } =
    useIsolatedPositions(pool)

  const columns = useIsolatedPositionsTableColumns(
    Big(totalInFarms).gt(0) || pool.isFarms,
  )

  const paginationProps = useDataTableUrlPagination(
    "/liquidity/$id",
    "isolatedPage",
    10,
  )

  if (Big(totalBalanceDisplay).eq(0)) return null

  return (
    <PositionsTableBody
      totalInFarms={totalInFarms}
      totalBalanceDisplay={totalBalanceDisplay}
      positions={pool.positions}
    >
      <STableHeader sx={{ justifyContent: "space-between" }}>
        <Flex
          align="center"
          gap="s"
          color={getToken("buttons.primary.high.hover")}
        >
          <Icon component={LiquidityIcon} size="xs" />
          <Text fw={500} font="primary">
            {t("liquidity.positions.label.isolated")}
          </Text>
        </Flex>

        {!!pool.positions.length && (
          <Button variant="tertiary" outline asChild>
            <Link
              to="/liquidity/$id/remove"
              params={{
                id: pool.id,
              }}
              search={{
                selectable: true,
              }}
            >
              <Minus />
              {t("removeLiquidity")}
            </Link>
          </Button>
        )}
      </STableHeader>
      <DataTable
        data={positions}
        columns={columns}
        paginated
        {...paginationProps}
        columnVisibility={getIsolatedPositionsTableColumns(
          isMobile,
          pool.isFarms || !!pool.positions.length,
        )}
        onRowClick={(row) => {
          if (!row.position) return

          setSelectedPosition({
            joinedFarms: row.joinedFarms,
            farmsToJoin: row.farmsToJoin,
            position: row.position,
          })
        }}
        columnPinning={{
          left: ["position"],
        }}
      />
      <Modal
        open={!!selectedPosition}
        onOpenChange={() => setSelectedPosition(null)}
      >
        {selectedPosition && (
          <PositionDetails
            joinedFarms={selectedPosition.joinedFarms}
            farmsToJoin={selectedPosition.farmsToJoin}
            position={selectedPosition.position}
            onSubmitted={() => setSelectedPosition(null)}
          />
        )}
      </Modal>
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
      <OmnipoolPositions
        pool={pool}
        positions={positions}
        isFarms={Big(totalInFarms).gt(0) || pool.isFarms}
        key="omnipool"
      />,
    )
  }

  if (isVisibleABalance) {
    if (tables.length > 0) {
      tables.push(
        <Separator
          key="separator-atoken"
          sx={{ minWidth: [undefined, 900] }}
        />,
      )
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

  const onClick = () => {
    navigate({
      search: (prev) => ({ ...prev, expanded: !prev.expanded }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <CollapsibleRoot open={expanded}>
      <TableContainer as={Paper} sx={{ mt: "xxl" }}>
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
  )
}
