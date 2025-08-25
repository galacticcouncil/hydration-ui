import { Button, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { DataTable } from "@galacticcouncil/ui/components/DataTable"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Circle, Minus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"

import { useOmnipoolPositionsTableColumns } from "./PositionsTable.columns"
import { OmnipoolPositionTableData } from "./PositionsTable.utils"

export const OmnipoolPositions = ({
  pool,
  positions,
}: {
  pool: OmnipoolAssetTable
  positions: OmnipoolPositionTableData[]
}) => {
  const { t } = useTranslation("liquidity")
  const columns = useOmnipoolPositionsTableColumns(pool.isFarms)

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        sx={{
          px: getTokenPx("containers.paddings.primary"),
          pt: getTokenPx("containers.paddings.tertiary"),
          position: "sticky",
          left: 0,
        }}
      >
        <Flex
          align="center"
          gap={getTokenPx("scales.paddings.s")}
          sx={{ color: getToken("buttons.primary.high.hover") }}
        >
          <Icon component={Circle} size={12} />
          <Text fw={500} font="primary">
            {t("liquidity.positions.label.omnipool")}
          </Text>
        </Flex>

        <Button variant="tertiary" outline asChild>
          {/* <Link
            to="/liquidity/$id/remove"
            params={{
              id: pool.id,
            }}
            search={{
              all: true,
            }}
          > */}
          <Minus />
          {t("liquidity.positions.removeAll")}
          {/* </Link> */}
        </Button>
      </Flex>
      <DataTable
        data={positions}
        columns={columns}
        paginated
        pageSize={10}
        columnPinning={{
          left: ["position"],
        }}
      />
    </>
  )
}
