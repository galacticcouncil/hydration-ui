import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { Box, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

import { useFullSquidUrlList } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

export type SquidStatusProps = {
  url: string
  blockNumber: number
}

export const SquidStatus: React.FC<SquidStatusProps> = ({
  url,
  blockNumber,
}) => {
  const { t } = useTranslation(["common"])

  const squidSdk = useMemo(() => getSquidSdk(url), [url])
  const { data: blockHeight } = useQuery(
    latestBlockHeightQuery(squidSdk, url, PARACHAIN_BLOCK_TIME / 2),
  )

  const blockHeightDifference =
    isNumber(blockNumber) && isNumber(blockHeight)
      ? blockNumber - blockHeight
      : null

  const isIndexerBehind =
    isNumber(blockHeightDifference) && blockHeightDifference > 50

  const squidUrlList = useFullSquidUrlList()
  const { name } = squidUrlList.find((item) => item.url === url) ?? {}

  return (
    <Box>
      <Text fs={14} lh={1.4} fw={600}>
        {name || url}
      </Text>
      <Text
        color={
          isIndexerBehind
            ? getToken("accents.danger.emphasis")
            : getToken("accents.success.emphasis")
        }
      >
        {t("rpc.status.blockHeightDiff", {
          value: blockHeightDifference,
        })}
      </Text>
    </Box>
  )
}
