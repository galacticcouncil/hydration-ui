import { Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type WithdrawProcessingProps = {
  className?: string
}

export const WithdrawProcessing: React.FC<WithdrawProcessingProps> = ({
  className,
}) => {
  const { t } = useTranslation(["onramp"])

  return (
    <Stack className={className} align="center" justify="center" gap={20}>
      <Spinner size="large" />
      <Text fs={20} align="center">
        {t("onramp:withdraw.transfer.withdrawing.title")}
      </Text>
      <Text
        fs={14}
        lh={1.4}
        align="center"
        color={getToken("text.low")}
        css={{ width: ["100%", "75%"] }}
      >
        {t("onramp:withdraw.transfer.withdrawing.description")}
      </Text>
    </Stack>
  )
}
