import {
  AreaChart,
  Flex,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { MOCK_CURVE_DATA } from "@galacticcouncil/ui/components/Chart/utils"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

import { AvailableFarm } from "./AvailableFarm"
import { Farm } from "./AvailableFarms"

type AvailableFarmModalBodyProps = {
  farm: Farm | null
}

export const AvailableFarmModalBody = ({
  farm,
}: AvailableFarmModalBodyProps) => {
  const { t } = useTranslation("liquidity")
  const theme = useTheme()
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(farm?.assetId ?? "")

  return (
    <>
      <ModalHeader
        title={t("liquidity.availableFarms.modal.title", {
          symbol: meta?.symbol,
        })}
      />
      <ModalBody>
        {farm && (
          <AvailableFarm
            farm={farm}
            sx={{ pb: getTokenPx("containers.paddings.secondary") }}
          />
        )}

        <Flex
          sx={{
            flexDirection: "column",
            gap: 40,
            px: 20,
            py: getTokenPx("containers.paddings.primary"),
            backgroundColor: getToken("surfaces.containers.mid.primary"),
            borderRadius: getTokenPx(
              "containers.cornerRadius.containersPrimary",
            ),
          }}
        >
          <Text fw={500} fs="h7" font="primary">
            {t("liquidity.availableFarms.modal.graph.title")}
          </Text>
          <AreaChart
            aspectRatio="16 / 9"
            data={MOCK_CURVE_DATA}
            xAxisProps={{
              type: "number",
              tickCount: 12,
              height: 50,
            }}
            yAxisProps={{
              padding: { bottom: 16 },
            }}
            yAxisLabel={t("liquidity.availableFarms.modal.graph.yAxisLabel")}
            yAxisLabelProps={{
              dx: 0,
              fill: theme.getToken("text.tint.primary"),
            }}
            xAxisLabelProps={{
              dx: 0,
              dy: 0,
              fill: theme.getToken("text.tint.primary"),
              position: "insideBottom",
            }}
            xAxisLabel={t("liquidity.availableFarms.modal.graph.xAxisLabel")}
            strokeWidth={4}
            withoutReferenceLine
            withoutTooltip
            horizontalGridHidden={false}
            gradient="none"
            config={{
              xAxisKey: "x",
              tooltipType: "none",
              series: [
                {
                  key: "y",
                  label: "Value",
                  color: theme.getToken("text.tint.primary"),
                },
              ],
            }}
          />
        </Flex>

        <Text
          fs="p2"
          color={getToken("text.tint.primary")}
          sx={{
            textAlign: "center",
            py: getTokenPx("containers.paddings.secondary"),
          }}
        >
          {t("liquidity.availableFarms.modal.graph.description")}
        </Text>
      </ModalBody>
    </>
  )
}
