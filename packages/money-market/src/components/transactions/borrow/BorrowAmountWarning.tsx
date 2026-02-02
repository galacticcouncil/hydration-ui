import { Alert, Flex, Text, Toggle } from "@galacticcouncil/ui/components"

interface BorrowAmountWarningProps {
  className?: string
  riskCheckboxAccepted: boolean
  onRiskCheckboxChange: () => void
}

export const BorrowAmountWarning = ({
  className,
  riskCheckboxAccepted,
  onRiskCheckboxChange,
}: BorrowAmountWarningProps) => {
  return (
    <div className={className}>
      <Alert
        variant="warning"
        sx={{ my: 20 }}
        description="Borrowing this amount will reduce your health factor and increase risk
        of liquidation."
      />
      <Flex align="center" as="label" gap="base">
        <Toggle
          size="large"
          checked={riskCheckboxAccepted}
          onCheckedChange={onRiskCheckboxChange}
        />
        <Text fw={500}>I acknowledge the risks involved.</Text>
      </Flex>
    </div>
  )
}
