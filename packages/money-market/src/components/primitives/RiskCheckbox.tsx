import {
  Alert,
  Flex,
  FlexProps,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"

export type RiskCheckboxProps = FlexProps & {
  message: string
  riskAccepted: boolean
  onRiskChange: (checked: boolean) => void
}

export const RiskCheckbox: React.FC<RiskCheckboxProps> = ({
  message,
  riskAccepted,
  onRiskChange,
  ...props
}) => {
  return (
    <Flex direction="column" gap={10} {...props}>
      <Alert variant="error" description={message} />
      <Flex align="center" as="label" gap={10}>
        <Toggle
          size="large"
          checked={riskAccepted}
          onCheckedChange={onRiskChange}
        />
        <Text fw={500}>I acknowledge the risks involved.</Text>
      </Flex>
    </Flex>
  )
}
