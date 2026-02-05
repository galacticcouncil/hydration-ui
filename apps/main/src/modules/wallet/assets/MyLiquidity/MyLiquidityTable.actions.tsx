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
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      <Flex gap="m" align="center" justify="flex-end">
        <TableRowAction
          variant="primary"
          outline={false}
          onClick={() => setIsAddOpen(true)}
        >
          {t("myLiquidity.actions.addLiquidity")}
        </TableRowAction>
        <TableRowAction asChild>
          <Link to="/liquidity/$id" params={{ id: assetId }}>
            {t("myLiquidity.actions.poolDetails")}
          </Link>
        </TableRowAction>
        <DropdownMenu modal={false}>
          <TableRowAction asChild>
            <DropdownMenuTrigger>
              <Icon component={Ellipsis} size="m" />
            </DropdownMenuTrigger>
          </TableRowAction>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <MenuSelectionItem variant="filterLink" asChild>
                <div>
                  <MenuItemLabel
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setIsRemoveAllModalOpen(true)
                    }}
                  >
                    {t("myLiquidity.actions.removeLiquidity")}
                  </MenuItemLabel>
                </div>
              </MenuSelectionItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      <Modal open={isRemoveAllModalOpen} onOpenChange={setIsRemoveAllModalOpen}>
        <RemoveLiquidity
          poolId={assetId}
          selectable
          closable
          onSubmitted={() => setIsRemoveAllModalOpen(false)}
        />
      </Modal>
      <Modal variant="popup" open={isAddOpen} onOpenChange={setIsAddOpen}>
        <AddLiquidityModalContent
          id={assetId}
          closable
          onSubmitted={() => setIsAddOpen(false)}
        />
      </Modal>
    </>
  )
}
