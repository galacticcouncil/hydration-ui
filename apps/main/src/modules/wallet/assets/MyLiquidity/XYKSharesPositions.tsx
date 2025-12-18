import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useIsolatedPoolFarms } from "@/api/farms"
import { toBig } from "@/utils/formatting"

import { SLiquidityPosition } from "./LiquidityPosition.styled"
import { XYKSharesPositionMoreActions } from "./LiquidityPositionMoreActions"
import { ShareTokenBalance } from "./MyIsolatedPoolsLiquidity.data"

export const XYKSharesPositions = ({
  position,
}: {
  position: ShareTokenBalance
}) => {
  const { t } = useTranslation(["wallet", "common", "liquidity"])
  const { data: activeFarms } = useIsolatedPoolFarms(position.amm_pool_id)

  const sharesHuman = toBig(position.shares, position.meta.decimals)

  return (
    <SLiquidityPosition sx={{ backgroundColor: "inherit" }}>
      <Text fs="p4" fw={500} color={getToken("text.tint.secondary")}>
        {t("common:shares")}
      </Text>

      <Amount
        value={t("common:currency", {
          value: sharesHuman.toString(),
          symbol: "Shares",
        })}
        displayValue={t("common:currency", {
          value: sharesHuman.times(position.price).toString(),
        })}
      />

      <div />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          asChild
          sx={{ width: "min-content", justifySelf: "flex-end" }}
        >
          <Button variant="tertiary" outline>
            {t("common:actions")}
            <Icon component={Ellipsis} size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <XYKSharesPositionMoreActions
            position={position}
            farmsToJoin={activeFarms?.filter((farm) => farm.apr !== "0") ?? []}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPosition>
  )
}
