import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { isValidElement } from "react"

import { SOptionCardContainer } from "@/components/OptionCard/OptionCard.styled"

export type OptionCardProps = {
  label: string
  description?: string
  value: React.ReactNode
  displayValue?: React.ReactNode
  /** a component rendered as an icon, or a ready element such as an asset logo */
  icon?: React.ComponentType | React.ReactElement
  disabled?: boolean
  isActive: boolean
  onClick: () => void
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  description,
  value,
  displayValue,
  icon,
  disabled,
  isActive,
  onClick,
}) => {
  return (
    <SOptionCardContainer
      type="button"
      onClick={onClick}
      active={isActive}
      disabled={disabled}
    >
      {isValidElement(icon)
        ? icon
        : icon && <Icon component={icon} size="xl" />}
      <Flex direction="column" flex={1}>
        <Text fs="p3" lh={1} color={getToken("text.high")}>
          {label}
        </Text>
        {description && (
          <Text fs="p5" color={getToken("text.medium")}>
            {description}
          </Text>
        )}
      </Flex>
      <Flex direction="column" align="end">
        {typeof value === "string" ? (
          <Text fs="p3" lh={1} fw={600} color={getToken("text.high")}>
            {value}
          </Text>
        ) : (
          value
        )}
        {displayValue &&
          (typeof displayValue === "string" ? (
            <Text fs="p6" fw={400} color={getToken("text.medium")}>
              {displayValue}
            </Text>
          ) : (
            displayValue
          ))}
      </Flex>
    </SOptionCardContainer>
  )
}
