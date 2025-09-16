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

import { JoinFarms } from "@/modules/liquidity/components/JoinFarms"
import { LiquidityPositionMoreActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"

type Props = {
  readonly assetId: string
  readonly positionId: string
}

export const LiquidityPositionActions: FC<Props> = ({
  assetId,
  positionId,
}) => {
  const { t } = useTranslation(["common", "wallet"])

  return (
    <Flex align="center" gap={6}>
      <ModalRoot>
        <Button variant="sliderTabActive" asChild>
          <ModalTrigger>
            {/* TODO show real count and hide if 0 */}
            {t("wallet:myLiquidity.expanded.actions.joinFarms", { count: 1 })}
          </ModalTrigger>
        </Button>
        <ModalContent>
          <JoinFarms positionId={positionId} poolId={assetId} />
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
            positionId={positionId}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
