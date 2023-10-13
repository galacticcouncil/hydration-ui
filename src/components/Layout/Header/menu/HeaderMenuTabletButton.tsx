import { Root } from "@radix-ui/react-dropdown-menu"
import { useSearch } from "@tanstack/react-location"
import MoreTabIcon from "assets/icons/MoreTabIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { HeaderDropdown } from "components/Layout/Header/HeaderDropdown/HeaderDropdown"
import { HeaderDropdownItem } from "components/Layout/Header/HeaderDropdown/HeaderDropdownItem"
import { HeaderDropdownItems } from "components/Layout/Header/HeaderDropdown/HeaderDropdownItems"
import { ModalContents } from "components/Modal/contents/ModalContents"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { MENU_ITEMS } from "utils/navigation"
import { SButton, SContainer } from "./HeaderMenuTabletButton.styled"

export const HeaderMenuTabletButton = ({ items }: { items?: string[] }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const onClose = () => setOpen(false)

  return (
    <SContainer
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Root open={open} onOpenChange={setOpen}>
        <SButton>
          {t("header.menu")}
          <Icon size={20} icon={<MoreTabIcon />} />
        </SButton>
        <HeaderDropdown open={open} sx={{ mt: -18, pt: 18 }}>
          <HeaderMenuTabletContents items={items} onClose={onClose} />
        </HeaderDropdown>
      </Root>
    </SContainer>
  )
}

export const HeaderMenuTabletContents = ({
  onClose,
  items = [],
}: {
  onClose: () => void
  items?: string[]
}) => {
  const { t } = useTranslation()

  const { account } = useSearch()

  const filteredMenuItems = useMemo(() => {
    if (!items.length) {
      return MENU_ITEMS
    }

    return MENU_ITEMS.filter((item) => items.includes(item.key))
  }, [items])

  return (
    <ModalContents
      disableHeightAnimation
      onClose={onClose}
      contents={[
        {
          title: "",
          headerVariant: "simple",
          noPadding: true,
          content: (
            <HeaderDropdownItems>
              {filteredMenuItems.map((item) => (
                <HeaderDropdownItem
                  to={item.href}
                  search={account ? { account } : undefined}
                  key={item.key}
                  icon={<item.Icon />}
                  title={t(`header.${item.key}`)}
                />
              ))}
            </HeaderDropdownItems>
          ),
        },
      ]}
    />
  )
}
