import {
  Alert,
  Flex,
  FlexProps,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"

export type HealthFactorRiskWarningProps = FlexProps & {
  canContinue?: boolean
  message: string
  accepted: boolean
  isUserConsentRequired: boolean
  onAcceptedChange: (checked: boolean) => void
}

export const HealthFactorRiskWarning: React.FC<
  HealthFactorRiskWarningProps
> = ({
  canContinue,
  message,
  accepted,
  onAcceptedChange,
  isUserConsentRequired,
  ...props
}) => {
  return (
    <Flex direction="column" gap="base" {...props}>
      <Alert
        variant="warning"
        description={message}
        action={
          canContinue !== false &&
          isUserConsentRequired && (
            <Flex align="center" as="label" gap="base">
              <Toggle
                size="large"
                checked={accepted}
                onCheckedChange={onAcceptedChange}
              />
              <Text fs="p4" lh={1.3} fw={600}>
                I acknowledge the risks involved.
              </Text>
            </Flex>
          )
        }
      />
    </Flex>
  )
}
