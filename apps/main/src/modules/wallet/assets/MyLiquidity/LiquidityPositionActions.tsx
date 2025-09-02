import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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
      <Button variant="sliderTabActive" asChild>
        <Link
          to="/liquidity/$id/join"
          params={{ id: assetId }}
          search={{ positionId: positionId }}
        >
          {/* TODO show real count and hide if 0 */}
          {t("wallet:myLiquidity.expanded.actions.joinFarms", { count: 1 })}
        </Link>
      </Button>
      <DropdownMenu>
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
