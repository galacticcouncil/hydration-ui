import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SButton } from "./StepButton.styled"

export type StepButtonProps = {
  onClick?: () => void
  title: string
  description: string
  icon?: React.ElementType
}

export const StepButton: React.FC<StepButtonProps> = ({
  onClick,
  title,
  description,
  icon: IconComponent,
}) => (
  <SButton
    onClick={onClick}
    css={!onClick && { pointerEvents: "none", opacity: 0.3 }}
  >
    <div>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 6 }}>
        {IconComponent && (
          <Icon
            size={16}
            icon={<IconComponent />}
            sx={{ color: "brightBlue300" }}
          />
        )}
        <Text fs={18} font="GeistSemiBold" color="basic100">
          {title}
        </Text>
      </div>
      <Text fs={14} lh={20} color="basic500">
        {description}
      </Text>
    </div>
    <Icon size={20} icon={<ChevronRight sx={{ color: "brightBlue300" }} />} />
  </SButton>
)
