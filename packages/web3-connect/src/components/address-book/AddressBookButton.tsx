import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import { Button, ButtonProps, Icon } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"

export const AddressBookButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      variant="accent"
      outline
      size="small"
      sx={{
        py: 2,
        px: getTokenPx("scales.paddings.base"),
        textTransform: "uppercase",
      }}
      {...props}
    >
      <Icon size={10} component={BookOpen} />
      My contacts
    </Button>
  )
}
