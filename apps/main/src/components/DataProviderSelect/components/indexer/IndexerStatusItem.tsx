import { Flex, Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { SIndexerListItem } from "@/components/DataProviderSelect/components/indexer/IndexerStatusItem.styled"
import { useNeckworkIndexerStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"

export const IndexerStatusHeader: React.FC = () => {
  const { t } = useTranslation()
  return (
    <SIndexerListItem
      bg={getToken("details.separatorsOnDim")}
      sx={{ height: "auto", borderTop: 0 }}
    >
      <Text fs="p5" color={getToken("text.medium")}>
        {t("rpc.change.modal.column.name")}
      </Text>
      <Text
        fs="p5"
        color={getToken("text.medium")}
        display={["none", "block"]}
        align="center"
      >
        {t("rpc.change.modal.column.blockHeight")}
      </Text>
      <Text fs="p5" color={getToken("text.medium")} align="right">
        {t("rpc.change.modal.column.status")}
      </Text>
    </SIndexerListItem>
  )
}

export const IndexerStatusItem = () => {
  const { t } = useTranslation()

  const {
    name,
    blockHeight,
    isLoading,
    isError,
    blockDiffText,
    statusText,
    color,
  } = useNeckworkIndexerStatus()

  return (
    <SIndexerListItem blocked={isLoading || isError}>
      <Text fs="p3" color={getToken("text.high")}>
        {name}
      </Text>
      <Flex justify="center" align="center" display={["none", "flex"]}>
        {isLoading ? (
          <Spinner size="xs" />
        ) : (
          <Text fs="p5" fw={600} align="center" color={getToken("text.high")}>
            {t("number", { value: blockHeight })}
          </Text>
        )}
      </Flex>
      <Flex justify="end" align="center">
        <Stack gap="xs">
          <Text
            fs="p5"
            fw={600}
            align="right"
            color={getToken(color)}
            transform="uppercase"
          >
            {statusText}
          </Text>
          {blockDiffText && (
            <Text fs="p6" fw={500} align="right" color={getToken(color)}>
              {blockDiffText}
            </Text>
          )}
        </Stack>
      </Flex>
    </SIndexerListItem>
  )
}
