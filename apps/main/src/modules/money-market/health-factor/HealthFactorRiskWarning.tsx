import {
  Alert,
  Flex,
  FlexProps,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = FlexProps & {
  readonly canContinue?: boolean
  readonly message: string
  readonly toggleMessage?: string
  readonly accepted: boolean
  readonly isUserConsentRequired: boolean
  readonly onAcceptedChange: (checked: boolean) => void
}

/** Health-factor risk alert; asks for an acknowledgement when consent is required. */
export const HealthFactorRiskWarning: FC<Props> = ({
  canContinue,
  message,
  toggleMessage,
  accepted,
  onAcceptedChange,
  isUserConsentRequired,
  ...props
}) => {
  const { t } = useTranslation("borrow")

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
                {toggleMessage || t("acknowledgeRisks")}
              </Text>
            </Flex>
          )
        }
      />
    </Flex>
  )
}
