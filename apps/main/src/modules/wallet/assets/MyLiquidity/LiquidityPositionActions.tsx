import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Icon,
  ModalContent,
  ModalRoot,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms"
import { LiquidityPositionMoreActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { AccountOmnipoolPosition } from "@/states/account"

type Props = {
  readonly assetId: string
  readonly position: AccountOmnipoolPosition
  readonly farmsToJoin: Farm[]
}

export const LiquidityPositionActions: FC<Props> = ({
  assetId,
  position,
  farmsToJoin,
}) => {
  const { t } = useTranslation(["common", "wallet"])

  return (
    <Flex align="center" gap={6} justify="flex-end">
      <ModalRoot>
        {!!farmsToJoin.length && (
          <Button variant="sliderTabActive" asChild>
            <ModalTrigger>
              {t("wallet:myLiquidity.expanded.actions.joinFarms", {
                count: farmsToJoin.length,
              })}
            </ModalTrigger>
          </Button>
        )}
        <ModalContent>
          <JoinFarmsWrapper positionId={position.positionId} poolId={assetId} />
        </ModalContent>
      </ModalRoot>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline>
            {t("actions")}
            <Icon component={Ellipsis} size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LiquidityPositionMoreActions
            assetId={assetId}
            position={position}
            farmsToJoin={farmsToJoin}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
