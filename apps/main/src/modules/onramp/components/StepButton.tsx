import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
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
          size={20}
          mr={getTokenPx("scales.paddings.xl")}
          component={IconComponent}
          color={getToken("textButtons.small.rest")}
        />
      )}
      <Stack>
        <Text fs={16} fw={600}>
          {title}
        </Text>
        <Text fs={13} color={getToken("text.low")}>
          {description}
        </Text>
      </Stack>
      <Icon
        size={20}
        ml="auto"
        component={ArrowRight}
        color={getToken("textButtons.small.rest")}
      />
    </SStepButton>
  )
}
