import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  MenuItemLabel,
  MenuSelectionItem,
  TableRowAction,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly assetId: string
}

export const MyLiquidityTableActions: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")

  return (
    <Flex gap={12} align="center" justify="flex-end">
      <TableRowAction variant="primary" outline={false} asChild>
        <Link to="/liquidity/$id/add" params={{ id: assetId }}>
          {t("myLiquidity.actions.addLiquidity")}
        </Link>
      </TableRowAction>
      <TableRowAction asChild>
        <Link to="/liquidity/$id" params={{ id: assetId }}>
          {t("myLiquidity.actions.poolDetails")}
        </Link>
      </TableRowAction>
      <DropdownMenu>
        <TableRowAction asChild>
          <DropdownMenuTrigger>
            <Icon component={Ellipsis} size={16} />
          </DropdownMenuTrigger>
        </TableRowAction>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <MenuSelectionItem variant="filterLink" asChild>
              <Link
                to="/liquidity/$id/remove"
                params={{ id: assetId }}
                search={{ all: true }}
              >
                <MenuItemLabel>
                  {t("myLiquidity.actions.removeAllLiquidity")}
                </MenuItemLabel>
              </Link>
            </MenuSelectionItem>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
