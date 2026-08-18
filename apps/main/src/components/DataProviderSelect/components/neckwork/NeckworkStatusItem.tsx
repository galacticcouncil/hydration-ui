import { neckworkStatusQuery } from "@galacticcouncil/indexer/neckwork"
import { Flex, Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/provider"
import { SSquidIndexerListItem } from "@/components/DataProviderSelect/components/squid/SquidIndexerListItem.styled"
import { useBlockHeightStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { useNeckworkEnabled } from "@/states/neckwork"

export const NeckworkStatusItem = () => {
  const { t } = useTranslation()
  const neckworkEnabled = useNeckworkEnabled()

  const {
    data: status,
    isLoading,
    isError,
  } = useQuery({
    ...neckworkStatusQuery(neckworkClient),
    enabled: neckworkEnabled,
  })

  const { blockDiffText, statusText, color } = useBlockHeightStatus(
    status?.blockHeight ?? null,
  )

  if (!neckworkEnabled) return null

  return (
    <SSquidIndexerListItem blocked={isLoading || isError}>
      <Text fs="p3" color={getToken("text.high")}>
        Neckwork
      </Text>
      <Flex justify="center" align="center" display={["none", "flex"]}>
        {isLoading ? (
          <Spinner size="xs" />
        ) : (
          <Text fs="p5" fw={600} align="center" color={getToken("text.high")}>
            {t("number", { value: status?.blockHeight })}
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
    </SSquidIndexerListItem>
  )
}
