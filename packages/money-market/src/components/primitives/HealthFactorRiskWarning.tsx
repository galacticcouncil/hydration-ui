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
      />
      {isUserConsentRequired && (
        <Flex align="center" as="label" gap={10}>
          <Toggle
            size="large"
            checked={accepted}
            onCheckedChange={onAcceptedChange}
          />
          <Text fw={500}>I acknowledge the risks involved.</Text>
        </Flex>
      )}
    </Flex>
  )
}
