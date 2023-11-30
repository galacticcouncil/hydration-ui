import { Root, Trigger } from "@radix-ui/react-dropdown-menu"
import IconDollar from "assets/icons/IconDollarLarge.svg?react"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { HeaderDropdown } from "components/Layout/Header/HeaderDropdown/HeaderDropdown"
import { HeaderDropdownItems } from "components/Layout/Header/HeaderDropdown/HeaderDropdownItems"
import { HeaderDropdownItem } from "components/Layout/Header/HeaderDropdown/HeaderDropdownItem"
import {
  SToolbarButton,
  SToolbarIcon,
} from "components/Layout/Header/toolbar/HeaderToolbar.styled"
import { HeaderSettingsDisplayAsset } from "components/Layout/Header/settings/displayAsset/HeaderSettingsDisplayAsset"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import SettingsIcon from "assets/icons/SettingsIcon.svg?react"

export const Settings = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const onClose = () => setOpen(false)

  return (
    <Root open={open} onOpenChange={setOpen}>
      <InfoTooltip text={t("header.settings.title")} type="black" asChild>
        <div>
          <SToolbarButton as={Trigger}>
            <SToolbarIcon
              as={SettingsIcon}
              aria-label={t("header.settings.title")}
            />
          </SToolbarButton>
        </div>
      </InfoTooltip>
      <HeaderDropdown open={open}>
        <SettingsContents onClose={onClose} />
      </HeaderDropdown>
    </Root>
  )
}

export const SettingsContents = ({ onClose }: { onClose: () => void }) => {
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
