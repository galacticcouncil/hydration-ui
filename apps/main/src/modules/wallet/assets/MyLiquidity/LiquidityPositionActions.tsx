import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import {
  LiquidityPositionAction,
  LiquidityPositionMoreActions,
} from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { AccountOmnipoolPosition } from "@/states/account"

import { XYKPositionDeposit } from "./MyIsolatedPoolsLiquidity.data"

type Props = {
  readonly position: AccountOmnipoolPosition | XYKPositionDeposit
  readonly farmsToJoin: Farm[]
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
}

export const LiquidityPositionActions: FC<Props> = ({
  position,
  farmsToJoin,
  onAction,
}) => {
  const { t } = useTranslation(["common", "wallet"])

  return (
    <Flex align="center" gap={6} justify="flex-end">
      {!!farmsToJoin.length && (
        <Button
          variant="sliderTabActive"
          onClick={() => onAction(LiquidityPositionAction.Join)}
        >
          {t("wallet:myLiquidity.expanded.actions.joinFarms", {
            count: farmsToJoin.length,
          })}
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline>
            {t("actions")}
            <Icon component={Ellipsis} size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LiquidityPositionMoreActions
            position={position}
            farmsToJoin={farmsToJoin}
            onAction={onAction}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
