import { Portal, Root, Content } from "@radix-ui/react-dropdown-menu"
import { ReactComponent as IconArrow } from "assets/icons/IconArrow.svg"
import { ReactComponent as IconDollar } from "assets/icons/IconDollarLarge.svg"
import { ReactComponent as IconSettings } from "assets/icons/IconSettings.svg"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SButton, SContent, SItem, SItems } from "./HeaderSettings.styled"
import { HeaderSettingsDisplayAsset } from "./displayAsset/HeaderSettingsDisplayAsset"
import { AnimatePresence } from "framer-motion"

export const HeaderSettings = () => {
  const [open, setOpen] = useState(false)

  const onClose = () => setOpen(false)

  return (
    <Root open={open} onOpenChange={setOpen}>
      <SButton>
        <IconSettings />
      </SButton>
      <AnimatePresence>
        {open && (
          <Portal forceMount>
            <Content align="end" sideOffset={18} css={{ zIndex: 2 }}>
              <SContent
                initial={{ opacity: 0, height: 50, x: 200 }}
                animate={{ opacity: 1, height: "auto", x: 0 }}
                exit={{ opacity: 0, height: 50, x: 200 }}
                transition={{
                  type: "spring",
                  mass: 1,
                  stiffness: 300,
                  damping: 20,
                  duration: 0.2,
                }}
              >
                <HeaderSettingsContents onClose={onClose} />
              </SContent>
            </Content>
          </Portal>
        )}
      </AnimatePresence>
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
            <SItems>
              <SItem onClick={next}>
                <IconDollar sx={{ color: "brightBlue200" }} />
                <div sx={{ flex: "column", gap: 3 }}>
                  <Text fs={14} lh={14} fw={600} color="basic100">
                    {t("header.settings.items.displayAsset.title")}
                  </Text>
                  <Text fs={12} lh={18} fw={400} color="basic500">
                    {t("header.settings.items.displayAsset.subtitle")}
                  </Text>
                </div>
                <IconArrow />
              </SItem>
            </SItems>
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
