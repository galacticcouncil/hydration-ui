import {
  EllipsisVerticalIcon,
  Trash2Icon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type BankAccountMenuProps = {
  /** The row's own text for this account, shown again in the confirm. */
  name: { title: string; detail: string | null }
  isRemoving: boolean
  onRemove: () => void
}

/**
 * A saved account's row action (overflow menu): Remove, then a confirm.
 * - The menu item only opens the confirm. The DELETE goes out from the
 *   confirm button alone, at most once per opening (`sent`, set before the
 *   send and cleared only when the item opens it again): a double click or a
 *   repeated Enter, even inside one tick before the close renders, sends
 *   once. While a remove is in flight the menu, its item and the confirm are
 *   disabled.
 * - Cancel, the X, Escape and an outside click close it through
 *   `onOpenChange(false)` and send nothing.
 * - The confirm belongs to this row's menu: `onRemove` is the row's own
 *   (bound to its account id), and the state lives in this mount, so a list
 *   that re-reads or reorders keeps it on the same account (rows are keyed by
 *   id). A row that leaves its section or the list, a wallet change, a session
 *   end or leaving the picker unmounts it: closed, nothing sent.
 * - It names the account with the row's text (`name`), never a second
 *   formatting. The row stays until the re-read list drops it (API doc 4);
 *   what happened is the answer's message, not this confirm.
 * - The menu is non-modal, as the app's other menu that opens a modal
 *   (MyLiquidityTable.actions): the menu closes on select and the dialog
 *   takes focus; on close, focus goes back to this row's menu button.
 */
export const BankAccountMenu: FC<BankAccountMenuProps> = ({
  name,
  isRemoving,
  onRemove,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const [confirming, setConfirming] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const sent = useRef(false)
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild ref={trigger}>
          <Button
            variant="tertiary"
            size="small"
            iconStart={EllipsisVerticalIcon}
            aria-label={t("bank.accounts.actions")}
            disabled={isRemoving}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isRemoving}
            onSelect={() => {
              sent.current = false
              setConfirming(true)
            }}
          >
            <MenuItem>
              <MenuItemIcon component={Trash2Icon} />
              <MenuItemLabel>{t("bank.accounts.remove")}</MenuItemLabel>
            </MenuItem>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ModalRoot open={confirming} onOpenChange={setConfirming}>
        <ModalContent
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            trigger.current?.focus()
          }}
        >
          <ModalHeader
            title={t("bank.accounts.removeConfirm.title")}
            align="center"
          />
          <ModalBody scrollable={false}>
            <Stack gap="s" align="center">
              <Text fs="p4" fw={500} align="center" data-remove-name="1">
                {name.title}
              </Text>
              {name.detail && (
                <Text fs="p5" align="center" data-remove-detail="1">
                  {name.detail}
                </Text>
              )}
              <Text fs="p4" align="center" mt="m">
                {t("bank.accounts.removeConfirm.description")}
              </Text>
            </Stack>
          </ModalBody>
          <ModalFooter justify="space-between">
            <Button
              size="medium"
              variant="tertiary"
              onClick={() => setConfirming(false)}
            >
              {t("common:cancel")}
            </Button>
            <Button
              size="medium"
              variant="danger"
              disabled={isRemoving}
              onClick={() => {
                if (sent.current) return
                sent.current = true
                setConfirming(false)
                onRemove()
              }}
            >
              {t("bank.accounts.removeConfirm.confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalRoot>
    </>
  )
}
