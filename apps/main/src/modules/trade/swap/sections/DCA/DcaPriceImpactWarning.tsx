import { Alert, Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export type Props = {
  readonly canContinue: boolean
  readonly message: string
  readonly accepted: boolean
  readonly onAcceptedChange: (accepted: boolean) => void
}

export const DcaPriceImpactWarning: FC<Props> = ({
  canContinue,
  message,
  accepted,
  onAcceptedChange,
}) => {
  const { t } = useTranslation(["trade"])

  return (
    <Flex direction="column" gap={10}>
      <Alert
        variant="warning"
        description={message}
        action={
          canContinue && (
            <Flex align="center" as="label" gap={10}>
              <Toggle
                size="large"
                checked={accepted}
                onCheckedChange={onAcceptedChange}
              />
              <Text fs="p4" lh={1.3} fw={600}>
                {t("trade:dca.priceImpact.warning.confirmation")}
              </Text>
            </Flex>
          )
        }
      />
    </Flex>
  )
}
