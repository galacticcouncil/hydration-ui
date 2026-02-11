import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import { Button, ButtonProps, Icon } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const AddressBookButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation()
  return (
    <Button
      variant="accent"
      outline
      size="small"
      sx={{
        gap: "s",
        py: "s",
        px: "m",
        height: "auto",
        textTransform: "uppercase",
      }}
      {...props}
    >
      <Icon size="xs" component={BookOpen} />
      {t("addressBook.myContacts")}
    </Button>
  )
}
