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
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"

import { SLiquidityPosition } from "./LiquidityPosition.styled"
import {
  LiquidityPositionAction,
  XYKSharesPositionMoreActions,
} from "./LiquidityPositionMoreActions"
import { ShareTokenBalance } from "./MyIsolatedPoolsLiquidity.data"

export const XYKSharesPositions = ({
  position,
  onAction,
  farms,
  minJoinAmount,
}: {
  position: ShareTokenBalance
  onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
  farms: Farm[]
  minJoinAmount?: string
}) => {
  const { t } = useTranslation(["wallet", "common", "liquidity"])

  const sharesHuman = bigShift(
    position.shares.toString(),
    -position.meta.decimals,
  )
  const canJoinFarms = Big(position.shares.toString()).gt(minJoinAmount ?? 0)

  return (
    <SLiquidityPosition sx={{ backgroundColor: "inherit" }}>
      <Text fs="p4" fw={500} color={getToken("text.tint.secondary")}>
        {t("common:shares")}
      </Text>

      <Amount
        value={t("common:currency", {
          value: sharesHuman.toString(),
          symbol: t("common:shares"),
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
            farmsToJoin={canJoinFarms ? farms : []}
            onAction={onAction}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPosition>
  )
}
