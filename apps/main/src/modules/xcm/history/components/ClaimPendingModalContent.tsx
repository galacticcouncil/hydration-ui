import { Flex, Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type ClaimPendingModalContentProps = {
  signatureCount?: number | null
}

export const ClaimPendingModalContent: React.FC<
  ClaimPendingModalContentProps
> = ({ signatureCount }) => {
  const { t } = useTranslation(["common"])
  const isMultiSignature = !!signatureCount && signatureCount > 1

  return (
    <Stack justify="center" align="center" gap="base" py="xl">
      <Spinner size={90} />
      <Flex direction="column" justify="center" align="center" gap="base">
        <Text as="h2" align="center" fs="h7" fw={500} font="primary">
          {isMultiSignature
            ? t("claim.pending.title.multi")
            : t("claim.pending.title")}
        </Text>
        <Text fs="p5" align="center" color={getToken("text.medium")}>
          {isMultiSignature
            ? t("claim.pending.description.multi", { count: signatureCount })
            : t("claim.pending.description")}
        </Text>
      </Flex>
    </Stack>
  )
}
