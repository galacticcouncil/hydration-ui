import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { Flex, Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useBlockHeightStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"

import { SSquidIndexerListItem } from "./SquidIndexerListItem.styled"

export type SquidIndexerListItemProps = {
  name: string
  url: string
}

export const SquidIndexerListHeader: React.FC = () => {
  const { t } = useTranslation()
  return (
    <SSquidIndexerListItem
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
    </SSquidIndexerListItem>
  )
}

export const SquidIndexerListItem: React.FC<SquidIndexerListItemProps> = ({
  name,
  url,
}) => {
  const { t } = useTranslation()

  const squidSdk = getSquidSdk(url)

  const {
    data: blockHeight,
    isLoading: isBlockHeightLoading,
    isError: isBlockHeightError,
  } = useQuery(latestBlockHeightQuery(squidSdk, url))

  const { blockDiffText, statusText, color } = useBlockHeightStatus(
    blockHeight ?? null,
  )

  return (
    <SSquidIndexerListItem blocked={isBlockHeightLoading || isBlockHeightError}>
      <Text fs="p3" color={getToken("text.high")}>
        {name}
      </Text>
      <Flex justify="center" align="center" display={["none", "flex"]}>
        {isBlockHeightLoading ? (
          <Spinner size="xs" />
        ) : (
          <Text fs="p5" fw={600} align="center" color={getToken("text.high")}>
            {t("number", {
              value: blockHeight,
            })}
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
