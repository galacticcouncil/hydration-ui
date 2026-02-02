import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import { Button, ButtonProps, Icon } from "@galacticcouncil/ui/components"

export const AddressBookButton: React.FC<ButtonProps> = (props) => {
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
      My contacts
    </Button>
  )
}
