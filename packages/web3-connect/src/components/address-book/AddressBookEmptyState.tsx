import { BookOpen, PlusCircle } from "@galacticcouncil/ui/assets/icons"
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

  const displayAddress = address ? shortenAccountAddress(address) : undefined

  const modeIcon = addressMode ? getWalletModeIcon(addressMode) : undefined

  const canAdd = Boolean(
    reason === AddressBookEmptyStateReason.SearchNotInList &&
      address &&
      addressMode &&
      displayAddress &&
      onAdd,
  )

  return (
    <Flex
      direction="column"
      align="center"
      color={getToken("text.medium")}
      py="xxxl"
      mx="auto"
      maxWidth="5xl"
    >
      <Icon component={canAdd ? PlusCircle : BookOpen} size="xl" mb="base" />
      <Text fs="p3" fw={500} align="center" textWrap="balance">
        {title}
      </Text>
      {description && (
        <Text fs="p4" fw={500} align="center" textWrap="balance">
          {description}
        </Text>
      )}
      {canAdd && (
        <Button
          variant="muted"
          size="large"
          mt="m"
          onClick={onAdd}
          sx={{ maxWidth: "100%" }}
        >
          <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
            {t("addressBook.add")}
            <Flex align="center" gap="s" sx={{ minWidth: 0 }}>
              {modeIcon && (
                <img
                  sx={{
                    size: "m",
                    borderRadius: "full",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                  src={modeIcon}
                  alt=""
                />
              )}
              <Text
                as="span"
                fw={700}
                color={getToken("text.high")}
                truncate={160}
                title={address}
              >
                {displayAddress}
              </Text>
            </Flex>
          </Flex>
        </Button>
      )}
    </Flex>
  )
}
