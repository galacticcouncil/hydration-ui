import { Portal, Root } from "@radix-ui/react-dropdown-menu"
import { ReactComponent as IconArrow } from "assets/icons/IconArrow.svg"
import { ReactComponent as IconDollar } from "assets/icons/IconDollarLarge.svg"
import { ReactComponent as IconSettings } from "assets/icons/IconSettings.svg"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { SButton, SContent, SItem } from "./HeaderSettings.styled"
import { HeaderSettingsDisplayAsset } from "./displayAsset/HeaderSettingsDisplayAsset"

export const HeaderSettings = () => {
  const { page, direction, back, next } = useModalPagination()

  return (
    <Root>
      <SButton>
        <IconSettings />
      </SButton>

      <Portal>
        <SContent align="end" sideOffset={8}>
          <ModalContents
            disableHeightAnimation
            onBack={back}
            page={page}
            direction={direction}
            contents={[
              {
                title: "Settings TODO",
                headerVariant: "simple",
                content: (
                  <SItem onClick={next}>
                    <IconDollar sx={{ color: "brightBlue200" }} />
                    <div sx={{ flex: "column", gap: 3 }}>
                      <Text fs={14} lh={14} fw={600} color="basic100">
                        TODO
                      </Text>
                      <Text fs={12} lh={18} fw={400} color="basic500">
                        TODO
                      </Text>
                    </div>
                    <IconArrow />
                  </SItem>
                ),
              },
              {
                title: "Select TODO",
                headerVariant: "simple",
                noPadding: true,
                content: <HeaderSettingsDisplayAsset />,
              },
            ]}
          />
        </SContent>
      </Portal>
    </Root>
  )
}
