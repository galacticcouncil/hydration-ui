import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Button, Flex, Image, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { Fragment } from "react"
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
      gap="s"
      m="auto"
      py={56}
      px="m"
      maxWidth="4xl"
    >
      <Image src={NoFunds} alt="" sx={{ size: "3xl" }} />
      <Text
        font="primary"
        color={getToken("text.high")}
        fs="h7"
        lh={1}
        fw={500}
        align="center"
      >
        {title}
      </Text>
      {description && (
        <Text
          color={getToken("text.medium")}
          fs="p5"
          lh={1.3}
          align="center"
          sx={{ textWrap: "balance" }}
        >
          {description.split(". ").map((sentence, index) => (
            <Fragment key={index}>
              {sentence.endsWith(".") ? sentence : `${sentence}.`}
              <br />
            </Fragment>
          ))}
        </Text>
      )}
      {reason === AddressBookEmptyStateReason.SearchNotInList &&
        address &&
        addressMode &&
        displayAddress &&
        onAdd && (
          <Button variant="secondary" size="medium" mt={8} onClick={onAdd}>
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
