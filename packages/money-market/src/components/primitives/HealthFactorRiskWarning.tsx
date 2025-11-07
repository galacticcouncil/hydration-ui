import {
  Alert,
  Flex,
  FlexProps,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"

export type HealthFactorRiskWarningProps = FlexProps & {
  message: string
  accepted: boolean
  isUserConsentRequired: boolean
  onAcceptedChange: (checked: boolean) => void
}

export const HealthFactorRiskWarning: React.FC<
  HealthFactorRiskWarningProps
> = ({
  message,
  accepted,
  onAcceptedChange,
  isUserConsentRequired,
  ...props
}) => {
  return (
    <Flex direction="column" gap={10} {...props}>
      <Alert
        variant={isUserConsentRequired ? "error" : "warning"}
        description={message}
        action={
          isUserConsentRequired && (
            <Flex align="center" as="label" gap={10}>
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
