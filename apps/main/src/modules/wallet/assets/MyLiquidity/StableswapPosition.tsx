import {
  Ellipsis,
  SuppliedLiquidityIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useFormatOmnipoolPositionData } from "@/states/liquidity"

import { SLiquidityPosition } from "./LiquidityPosition.styled"
import {
  LiquidityPositionAction,
  StableswapPositionMoreActions,
} from "./LiquidityPositionMoreActions"
import { StableswapPosition } from "./MyLiquidityTable.data"

type StableswapPositionProps = {
  readonly position: StableswapPosition
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Add,
  ) => void
}

export const StableswapLiquidityPosition = ({
  position,
  onAction,
}: StableswapPositionProps) => {
  const { t } = useTranslation(["wallet", "common", "liquidity"])
  const format = useFormatOmnipoolPositionData()

  return (
    <SLiquidityPosition sx={{ backgroundColor: "inherit" }}>
      <Flex align="center" gap={2}>
        <Icon
          component={SuppliedLiquidityIcon}
          size={12}
          color={getToken("text.tint.secondary")}
        />
        <Text fs="p4" fw={500} color={getToken("text.tint.secondary")}>
          {t("liquidity:stablepoolShares")}
        </Text>
      </Flex>

      <div />

      <Amount
        label={t("common:currentValue")}
        value={format(position.data)}
        displayValue={t("common:currency", {
          value: position.data.currentTotalDisplay,
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
          <StableswapPositionMoreActions onAction={onAction} />
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPosition>
  )
}
