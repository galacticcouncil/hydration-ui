import { LiquidityIcon } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal, Text } from "@galacticcouncil/ui/components"
import { DataTable } from "@galacticcouncil/ui/components/DataTable"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { Minus } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { TJoinedFarm } from "@/modules/liquidity/components/Farms/Farms.utils"
import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import {
  isOmnipoolDepositPosition,
  OmnipoolDepositFullWithData,
} from "@/states/account"

import { PositionDetails } from "./PositionDetails"
import {
  isOmnipoolPosition,
  useOmnipoolPositionsTableColumns,
} from "./PositionsTable.columns"
import { STableHeader } from "./PositionsTable.styled"
import {
  BalanceTableData,
  OmnipoolPositionTableData,
} from "./PositionsTable.utils"

export const OmnipoolPositions = ({
  pool,
  positions,
}: {
  pool: OmnipoolAssetTable
  positions: (OmnipoolPositionTableData | BalanceTableData)[]
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [selectedPosition, setSelectedPosition] = useState<{
    joinedFarms: TJoinedFarm[]
    farmsToJoin: Farm[]
    position: OmnipoolDepositFullWithData
  } | null>(null)
  const columns = useOmnipoolPositionsTableColumns(pool.isFarms)

  return (
    <>
      <STableHeader sx={{ justifyContent: "space-between" }}>
        <Flex
          align="center"
          gap={getTokenPx("scales.paddings.s")}
          color={getToken("buttons.primary.high.hover")}
        >
          <Icon component={LiquidityIcon} size={12} />
          <Text fw={500} font="primary">
            {t("common:liquidity")}
          </Text>
        </Flex>

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
            {t("liquidity.positions.removeAll")}
          </Link>
        </Button>
      </STableHeader>
      <DataTable
        data={positions}
        columns={columns}
        onRowClick={(row) => {
          if (isOmnipoolPosition(row) && isOmnipoolDepositPosition(row)) {
            setSelectedPosition({
              joinedFarms: row.joinedFarms,
              farmsToJoin: row.farmsToJoin,
              position: row,
            })
          }
        }}
        paginated
        pageSize={10}
        columnPinning={{
          left: ["position"],
        }}
        sx={{ minWidth: 900 }}
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
          />
        )}
      </Modal>
    </>
  )
}
