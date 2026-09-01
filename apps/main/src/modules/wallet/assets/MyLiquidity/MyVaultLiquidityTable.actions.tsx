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

import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { RemoveVaultLiquidity } from "@/modules/liquidity/components/RemoveLiquidity/RemoveVaultLiquidity"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

type Props = {
  readonly vault: VaultTable
}

export const MyVaultLiquidityTableActions: FC<Props> = ({ vault }) => {
  const { t } = useTranslation("wallet")
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      <Flex gap="m" align="center" justify="flex-end">
        <TableRowAction
          variant="primary"
          outline={false}
          disabled={!vault.canDeposit}
          onClick={() => setIsAddOpen(true)}
        >
          {t("myLiquidity.actions.addLiquidity")}
        </TableRowAction>
        <TableRowAction asChild>
          <Link to="/liquidity/vault/$address" params={{ address: vault.id }}>
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
                      setIsRemoveOpen(true)
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
      <Modal variant="popup" open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        {isRemoveOpen && (
          <RemoveVaultLiquidity
            vault={vault}
            closable
            onSubmitted={() => setIsRemoveOpen(false)}
          />
        )}
      </Modal>
      <Modal variant="popup" open={isAddOpen} onOpenChange={setIsAddOpen}>
        {isAddOpen && (
          <AddVaultLiquidity
            vault={vault}
            closable
            onSubmitted={() => setIsAddOpen(false)}
          />
        )}
      </Modal>
    </>
  )
}
