import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Icon,
  Modal,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms"
import { LiquidityPositionMoreActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { AccountOmnipoolPosition } from "@/states/account"

import { XYKPosition } from "./MyLiquidityTable.data"
import { isXYKPosition } from "./MyLiquidityTable.data"

type Props = {
  readonly assetId: string
  readonly position: AccountOmnipoolPosition | XYKPosition
  readonly farmsToJoin: Farm[]
}

export const LiquidityPositionActions: FC<Props> = ({
  assetId,
  position,
  farmsToJoin,
}) => {
  const { t } = useTranslation(["common", "wallet"])
  const [open, setOpen] = useState(false)

  const isXyk = isXYKPosition(position)

  return (
    <>
      <Flex align="center" gap={6} justify="flex-end">
        {!!farmsToJoin.length && (
          <Button variant="sliderTabActive" onClick={() => setOpen(true)}>
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
              assetId={assetId}
              position={position}
              farmsToJoin={farmsToJoin}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      <Modal open={open} onOpenChange={setOpen}>
        <JoinFarmsWrapper
          positionId={isXyk ? position.id : position.positionId}
          poolId={isXyk ? position.amm_pool_id : assetId}
          closable
          onSubmitted={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
