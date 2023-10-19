import { Root } from "@radix-ui/react-dropdown-menu"
import IconDollar from "assets/icons/IconDollarLarge.svg?react"
import IconSettings from "assets/icons/IconSettings.svg?react"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SButton } from "./HeaderSettings.styled"
import { HeaderSettingsDisplayAsset } from "./displayAsset/HeaderSettingsDisplayAsset"
import { HeaderDropdown } from "components/Layout/Header/HeaderDropdown/HeaderDropdown"
import { HeaderDropdownItems } from "components/Layout/Header/HeaderDropdown/HeaderDropdownItems"
import { HeaderDropdownItem } from "components/Layout/Header/HeaderDropdown/HeaderDropdownItem"

export const HeaderSettings = () => {
  const [open, setOpen] = useState(false)

  const onClose = () => setOpen(false)

  return (
    <Root open={open} onOpenChange={setOpen}>
      <SButton>
        <IconSettings />
      </SButton>
      <HeaderDropdown open={open}>
        <HeaderSettingsContents onClose={onClose} />
      </HeaderDropdown>
    </Root>
  )
}

export const HeaderSettingsContents = ({
  onClose,
}: {
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const { page, direction, back, next } = useModalPagination()

  const onSelect = () => {
    back()
    onClose()
  }

  return (
    <ModalContents
      disableHeightAnimation
      onClose={onClose}
      onBack={back}
      page={page}
      direction={direction}
      contents={[
        {
          title: t("header.settings.title"),
          headerVariant: "simple",
          noPadding: true,
          content: (
            <HeaderDropdownItems>
              <HeaderDropdownItem
                onClick={next}
                icon={<IconDollar />}
                title={t("header.settings.items.displayAsset.title")}
                subtitle={t("header.settings.items.displayAsset.subtitle")}
              />
            </HeaderDropdownItems>
          ),
        },
        {
          title: t("header.settings.displayAsset.title"),
          headerVariant: "simple",
          noPadding: true,
          content: <HeaderSettingsDisplayAsset onSelect={onSelect} />,
        },
      ]}
    />
  )
}
