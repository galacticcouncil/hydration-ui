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
  Modal,
  ModalContent,
  ModalRoot,
  ModalTrigger,
  TableRowAction,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"

type Props = {
  readonly assetId: string
}

export const MyLiquidityTableActions: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")
  const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false)

  return (
    <>
      <Flex gap={12} align="center" justify="flex-end">
        <ModalRoot>
          <TableRowAction variant="primary" outline={false} asChild>
            <ModalTrigger>{t("myLiquidity.actions.addLiquidity")}</ModalTrigger>
          </TableRowAction>
          <ModalContent>
            <AddLiquidityModalContent id={assetId} closable />
          </ModalContent>
        </ModalRoot>
        <TableRowAction asChild>
          <Link to="/liquidity/$id" params={{ id: assetId }}>
            {t("myLiquidity.actions.poolDetails")}
          </Link>
        </TableRowAction>
        <DropdownMenu modal={false}>
          <TableRowAction asChild>
            <DropdownMenuTrigger>
              <Icon component={Ellipsis} size={16} />
            </DropdownMenuTrigger>
          </TableRowAction>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <MenuSelectionItem variant="filterLink" asChild>
                <div>
                  <MenuItemLabel
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsRemoveAllModalOpen(true)
                    }}
                  >
                    {t("myLiquidity.actions.removeAllLiquidity")}
                  </MenuItemLabel>
                </div>
              </MenuSelectionItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      <Modal open={isRemoveAllModalOpen} onOpenChange={setIsRemoveAllModalOpen}>
        <RemoveLiquidity poolId={assetId} all closable />
      </Modal>
    </>
  )
}
