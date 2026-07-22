import {
  Paper,
  SectionHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

type AboutCardProps = {
  symbol: string
}

export const AboutCard: React.FC<AboutCardProps> = ({ symbol }) => {
  const { t } = useTranslation(["borrow"])

  return (
    <Paper p="xl">
      <Stack>
        <SectionHeader
          noTopPadding
          title={t("borrow:multiply.detail.aboutTitle", { symbol })}
        />
        <Text fs="p4" color={getToken("text.medium")} lh={1.6}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
        <Stack gap="xs" mt="m">
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
