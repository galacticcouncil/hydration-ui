import { LiquidityIcon } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal, Text } from "@galacticcouncil/ui/components"
import { DataTable } from "@galacticcouncil/ui/components/DataTable"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { Minus } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePrevious } from "react-use"

import { OmnipoolPosition } from "@/api/account"
import { Farm } from "@/api/farms"
import { TJoinedFarm } from "@/modules/liquidity/components/Farms/Farms.utils"
import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms"
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
  isFarms,
}: {
  pool: OmnipoolAssetTable
  isFarms: boolean
  positions: (OmnipoolPositionTableData | BalanceTableData)[]
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [selectedPosition, setSelectedPosition] = useState<{
    joinedFarms: TJoinedFarm[]
    farmsToJoin: Farm[]
    position: OmnipoolDepositFullWithData | OmnipoolPosition
  } | null>(null)
  const previousSelectedPosition = usePrevious(selectedPosition)
  const columns = useOmnipoolPositionsTableColumns(isFarms)
  const position = selectedPosition ?? previousSelectedPosition

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
          if (isOmnipoolPosition(row) && row.canJoinFarms) {
            setSelectedPosition({
              joinedFarms: row.joinedFarms,
              farmsToJoin: row.farmsToJoin,
              position: row,
            })
          }
        }}
        getIsClickable={(row) => isOmnipoolPosition(row) && row.canJoinFarms}
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
        {position ? (
          isOmnipoolDepositPosition(position.position) ? (
            <PositionDetails
              joinedFarms={position.joinedFarms}
              farmsToJoin={position.farmsToJoin}
              position={position.position as OmnipoolDepositFullWithData}
              onSubmitted={() => setSelectedPosition(null)}
            />
          ) : (
            <JoinFarmsWrapper
              positionId={position.position.positionId}
              poolId={position.position.assetId}
              closable
              onSubmitted={() => setSelectedPosition(null)}
            />
          )
        ) : null}
      </Modal>
    </>
  )
}
