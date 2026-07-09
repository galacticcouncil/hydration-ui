import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import { Button, ButtonProps, Icon } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import i18n from "@/i18n"

export const AddressBookButton: React.FC<ButtonProps> = ({
  children,
  sx,
  ...props
}) => {
  const { t } = useTranslation("translations", { i18n })
  return (
    <Button
      variant="accent"
      outline
      size="small"
      sx={{
        columnGap: "s",
        py: "s",
        px: "m",
        height: "auto",
        "& [data-address-book-icon]": {
          color: "currentColor",
        },
        "& [data-address-book-icon] svg": {
          fill: "none",
          stroke: "currentColor",
        },
        "& [data-address-book-icon] svg *": {
          stroke: "currentColor",
        },
        ...sx,
      }}
      {...props}
    >
      <Icon
        data-address-book-icon
        size="xs"
        color="currentColor"
        component={BookOpen}
      />
      {children ?? t("addressBook.myContacts")}
    </Button>
  )
}
