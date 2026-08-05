import { NotebookTabs } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { WalletMode } from "@/config/wallet"
import i18n from "@/i18n"
import { getWalletModeIcon } from "@/utils/wallet"

export enum AddressBookEmptyStateReason {
  NoContacts = "noContacts",
  NoFilterContacts = "noFilterContacts",
  SearchNoResults = "searchNoResults",
  SearchNotInList = "searchNotInList",
}

type Props = {
  readonly reason: AddressBookEmptyStateReason
  readonly filterName?: string
  readonly address?: string
  readonly addressMode?: WalletMode
  readonly onAdd?: () => void
}

export const AddressBookEmptyState = ({
  reason,
  filterName,
  address,
  addressMode,
  onAdd,
}: Props) => {
  const { t } = useTranslation("translations", { i18n })

  const title = (() => {
    switch (reason) {
      case AddressBookEmptyStateReason.NoContacts:
        return t("addressBook.emptyState.noContacts")
      case AddressBookEmptyStateReason.NoFilterContacts:
        return t("addressBook.emptyState.noFilterContacts", {
          network: filterName ?? "",
        })
      case AddressBookEmptyStateReason.SearchNoResults:
        return t("addressBook.emptyState.searchNoResults")
      case AddressBookEmptyStateReason.SearchNotInList:
        return t("addressBook.emptyState.notInList")
    }
  })()

  const description = (() => {
    switch (reason) {
      case AddressBookEmptyStateReason.NoContacts:
      case AddressBookEmptyStateReason.NoFilterContacts:
        return t("addressBook.emptyState.noContactsHint")
      case AddressBookEmptyStateReason.SearchNoResults:
        return undefined
      case AddressBookEmptyStateReason.SearchNotInList:
        return undefined
    }
  })()

  const displayAddress =
    address && addressMode
      ? addressMode === WalletMode.Near
        ? address
        : shortenAccountAddress(address)
      : undefined

  const modeIcon = addressMode ? getWalletModeIcon(addressMode) : undefined

  return (
    <Flex
      direction="column"
      align="center"
      color={getToken("text.medium")}
      py={56}
    >
      <Icon component={NotebookTabs} size={40} mb={16} />
      <Text fw={500}>{title}</Text>
      {description && <Text fw={500}>{description}</Text>}
      {reason === AddressBookEmptyStateReason.SearchNotInList &&
        address &&
        addressMode &&
        displayAddress &&
        onAdd && (
          <Button
            variant="transparent"
            outline
            size="medium"
            mt="m"
            onClick={onAdd}
          >
            <Flex align="center" gap="s">
              {t("addressBook.add")}
              {modeIcon && (
                <img
                  sx={{ size: "xs", borderRadius: "full", overflow: "hidden" }}
                  src={modeIcon}
                  alt=""
                />
              )}
              <Text as="span" fw={700}>
                {displayAddress}
              </Text>
            </Flex>
          </Button>
        )}
    </Flex>
  )
}
