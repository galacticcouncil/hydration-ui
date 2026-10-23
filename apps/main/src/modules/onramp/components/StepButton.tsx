import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentType } from "react"

import { SStepButton } from "@/modules/onramp/components/StepButton.styled"

export type StepButtonProps = {
  title: string
  description: string
  icon?: ComponentType
  onClick: () => void
}

export const StepButton: React.FC<StepButtonProps> = ({
  title,
  description,
  icon: IconComponent,
  onClick,
}) => {
  return (
    <SStepButton as="button" onClick={onClick}>
      {IconComponent && (
        <Icon
          size={["l", "lg"]}
          component={IconComponent}
          color={getToken("textButtons.small.rest")}
          sx={{ flexShrink: 0 }}
        />
      )}
      <Stack gap="s" minWidth={0}>
        <Text fs={["p3", "p2"]} fw={600} lh={1.2}>
          {title}
        </Text>
        <Text fs={["p5", "p4"]} lh={1.3} color={getToken("text.low")}>
          {description}
        </Text>
      </Stack>
      <Icon
        size="m"
        sx={{ flexShrink: 0 }}
        ml="auto"
        component={ArrowRight}
        color={getToken("textButtons.small.rest")}
      />
    </SStepButton>
  )
}
