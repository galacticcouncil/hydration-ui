import {
  Button,
  ExternalLink,
  Skeleton,
  Spinner,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { bestNumberQuery } from "@/api/chain"
import { useActiveProviderProps, useSquidUrl } from "@/api/provider"
import { RpcStatus } from "@/components/DataProviderSelect/components/rpc/RpcStatus"
import { StatusTooltipContent } from "@/components/DataProviderSelect/components/StatusTooltipContent"
import { SContainer } from "@/components/DataProviderSelect/DataProviderSelect.styled"
import { DataProviderSelectModal } from "@/components/DataProviderSelect/DataProviderSelectModal"
import { CLASSIC_UI_LINK } from "@/config/links"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly bottomPinned?: boolean
}

export const DataProviderSelect: FC<Props> = ({ bottomPinned }) => {
  const { t } = useTranslation(["common"])
  const [modalOpen, setModalOpen] = useState(false)
  const provider = useRpcProvider()
  const { isMobile } = useBreakpoints()

  const { data } = useQuery(bestNumberQuery(provider))
  const providerProps = useActiveProviderProps()
  const squidUrl = useSquidUrl()

  return (
    <SContainer bottomPinned={bottomPinned}>
      <Button variant="tertiary" outline size="small" asChild>
        <ExternalLink href={CLASSIC_UI_LINK}>
          <Text fw={600} as="span" color={getToken("text.high")}>
            {t("classicUi")}
          </Text>
        </ExternalLink>
      </Button>
      <Tooltip
        text={
          !isMobile &&
          providerProps && <StatusTooltipContent {...providerProps} />
        }
        asChild
      >
        <Button
          variant="tertiary"
          size="small"
          outline
          onClick={() => setModalOpen(true)}
        >
          {data ? (
            <RpcStatus
              url={providerProps?.url ?? ""}
              name={providerProps?.name ?? ""}
              blockNumber={data.parachainBlockNumber}
              squidUrl={squidUrl}
              timestamp={data.timestamp}
            />
          ) : (
            <>
              <Skeleton width={60} />
              <Spinner />
            </>
          )}
        </Button>
      </Tooltip>
      <DataProviderSelectModal open={modalOpen} onOpenChange={setModalOpen} />
    </SContainer>
  )
}
