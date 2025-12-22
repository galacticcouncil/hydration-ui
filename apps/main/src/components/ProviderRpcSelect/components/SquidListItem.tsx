import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { Box, Flex, Spinner, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

import { useBestNumber } from "@/api/chain"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

import { SRpcRadio, SRpcRadioThumb } from "./RpcListItem.styled"
import { SSquidListItem } from "./SquidListItem.styled"

export type SquidListItemProps = {
  name: string
  url: string
  isActive?: boolean
  onClick?: (url: string) => void
}

export const SquidListHeader: React.FC = () => {
  const { t } = useTranslation()
  return (
    <SSquidListItem
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
    </SSquidListItem>
  )
}

export const SquidListItem: React.FC<SquidListItemProps> = ({
  name,
  url,
  isActive,
  onClick,
}) => {
  const { t } = useTranslation()
  const { data: bestNumber, isLoading: isBestNumberLoading } = useBestNumber()

  const squidSdk = useMemo(() => getSquidSdk(url), [url])

  const { data: blockHeight, isLoading: isBlockHeightLoading } = useQuery(
    latestBlockHeightQuery(squidSdk, url, PARACHAIN_BLOCK_TIME / 2),
  )

  const isLoading = isBestNumberLoading || isBlockHeightLoading

  const blockHeightDifference =
    isNumber(bestNumber?.parachainBlockNumber) && isNumber(blockHeight)
      ? bestNumber.parachainBlockNumber - blockHeight
      : null

  return (
    <SSquidListItem
      data-loading={isLoading}
      onClick={() => onClick?.(url)}
      isInteractive={!!onClick}
    >
      <Box>
        <Text
          fs={[14, 16]}
          color={getToken(isActive ? "colors.coral.700" : "text.high")}
        >
          {name}
        </Text>
      </Box>
      <Flex
        color={getToken("text.medium")}
        gap={4}
        justify="center"
        align="center"
        display={["none", "flex"]}
      >
        {isLoading ? (
          <Spinner size={14} />
        ) : (
          <Text fs={12} fw={600} color={getToken("text.high")} align="right">
            {t("number", {
              value: blockHeight,
            })}
          </Text>
        )}
      </Flex>
      <Flex
        color={getToken("text.medium")}
        gap={4}
        justify="end"
        align="center"
      >
        {isLoading ? (
          <Spinner size={14} />
        ) : (
          <Text
            fs={12}
            align="right"
            color={
              isNumber(blockHeightDifference) && blockHeightDifference < 50
                ? getToken("accents.success.emphasis")
                : getToken("accents.danger.emphasis")
            }
          >
            {t("rpc.status.blockHeightDiff", {
              value: blockHeightDifference,
            })}
          </Text>
        )}

        {!!onClick && (
          <Box sx={{ ml: 8 }}>
            <SRpcRadio>{isActive && <SRpcRadioThumb />}</SRpcRadio>
          </Box>
        )}
      </Flex>
    </SSquidListItem>
  )
}
