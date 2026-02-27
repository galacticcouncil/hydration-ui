import { Paper, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

type StrategyAboutCardProps = {
  symbol: string
}

export const StrategyAboutCard: React.FC<StrategyAboutCardProps> = ({
  symbol,
}) => {
  const { t } = useTranslation(["borrow"])

  return (
    <Paper p="xl">
      <Stack gap="m">
        <Text as="h2" lh={1.5} fs="p3" fw={500} font="primary">
          {t("borrow:multiply.detail.aboutTitle", { symbol })}
        </Text>
        <Text fs="p4" color={getToken("text.medium")} lh={1.6}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
        <Stack gap="xs">
          <Text as="h3" fs="p3">
            {t("borrow:multiply.detail.howItWorks")}
          </Text>
          <Text fs="p4" color={getToken("text.medium")} lh={1.6}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </Stack>
      </Stack>
    </Paper>
  )
}
