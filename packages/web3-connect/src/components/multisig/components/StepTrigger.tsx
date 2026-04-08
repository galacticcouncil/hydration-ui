import { Check, ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { SStepTrigger } from "@/components/multisig/components/StepTrigger.styled"

type StepTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  stepNumber: number
  title: string
  description?: string
  state: "active" | "done" | "todo"
}

export const StepTrigger: React.FC<StepTriggerProps> = ({
  stepNumber,
  title,
  state,
  description,
  ...props
}) => {
  const isActive = state === "active"
  const isDone = state === "done"

  return (
    <SStepTrigger isInteractive={isDone} {...props}>
      <Flex
        align="center"
        justify="center"
        sx={{
          width: "xl",
          height: "xl",
          borderRadius: "50%",
          flexShrink: 0,
          border: "1px solid transparent",
          bg: isActive
            ? getToken("buttons.primary.medium.rest")
            : isDone
              ? getToken("details.separators")
              : "transparent",
          borderColor: isDone
            ? "transparent"
            : getToken("buttons.primary.medium.rest"),
        }}
      >
        {isDone ? (
          <Icon
            size="s"
            component={Check}
            color={getToken("buttons.primary.medium.rest")}
          />
        ) : (
          <Text
            fs="p4"
            fw={600}
            font="primary"
            color={
              isActive
                ? getToken("buttons.primary.medium.onButton")
                : getToken("buttons.primary.medium.rest")
            }
          >
            {stepNumber}
          </Text>
        )}
      </Flex>
      <Stack gap="2xs">
        <Text fs="p4" fw={600} lh={1.3} color={getToken("text.high")}>
          {title}
        </Text>
        {description && (
          <Text fs="p5" color={getToken("text.medium")}>
            {description}
          </Text>
        )}
      </Stack>
      {isDone && (
        <Icon
          component={ChevronDown}
          color={getToken("text.medium")}
          size="s"
          sx={{ ml: "auto" }}
        />
      )}
    </SStepTrigger>
  )
}
