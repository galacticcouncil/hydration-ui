import { Edit, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  Spinner,
  Text,
  TextButton,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { PingResponse } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { bestNumberQuery } from "@/api/chain"
import { useRpcStatus } from "@/api/rpc"
import { ListItemEditForm } from "@/components/ProviderRpcSelect/components/ListItemEditForm"
import { RpcRemoveModal } from "@/components/ProviderRpcSelect/components/RpcRemoveModal"
import { RpcStatus } from "@/components/ProviderRpcSelect/components/RpcStatus"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useRpcListStore } from "@/states/provider"

import { SRpcListItem, SRpcRadio, SRpcRadioThumb } from "./RpcListItem.styled"

export type RpcListItemProps = {
  name: string
  url: string
  isActive?: boolean
  isCustom?: boolean
  isLoading?: boolean
  onClick?: (url: string) => void
  onRemove?: (url: string) => void
}

export const RpcListHeader: React.FC = () => {
  const { t } = useTranslation()
  return (
    <SRpcListItem
      bg={getToken("details.separatorsOnDim")}
      sx={{ height: "auto", borderTop: 0 }}
    >
      <Text fs="p5" color={getToken("text.medium")}>
        {t("rpc.change.modal.column.name")}
      </Text>
      <Text fs="p5" color={getToken("text.medium")}>
        {t("rpc.change.modal.column.status")}
      </Text>
      <Text
        fs="p5"
        color={getToken("text.medium")}
        display={["none", "block"]}
        align="right"
      >
        {t("rpc.change.modal.column.rpc")}
      </Text>
    </SRpcListItem>
  )
}

const RpcListItemLayout: React.FC<RpcListItemProps & Partial<PingResponse>> = ({
  name,
  url,
  isActive,
  isCustom,
  onClick,
  onRemove,
  timestamp,
  blockNumber,
  ping,
  isLoading,
}) => {
  const { t } = useTranslation()
  const [isEdit, setIsEdit] = useState(false)
  const { renameRpc } = useRpcListStore()

  if (isEdit) {
    return (
      <SRpcListItem data-edit="true">
        <ListItemEditForm
          name={name}
          onClose={() => setIsEdit(false)}
          onSubmit={(newName) => renameRpc(url, newName)}
        />
      </SRpcListItem>
    )
  }

  return (
    <SRpcListItem
      data-loading={isLoading}
      onClick={() => onClick?.(url)}
      isInteractive={!!onClick || !!onRemove}
    >
      <Box>
        <Text
          fs={[14, 16]}
          color={getToken(isActive ? "colors.coral.700" : "text.high")}
        >
          {name}
        </Text>
        <Text
          fs={10}
          mt={2}
          display={["block", "none"]}
          color={getToken("text.medium")}
        >
          {new URL(url).hostname}
        </Text>
      </Box>
      <Box>
        {isLoading ? (
          <Spinner size={14} />
        ) : (
          <RpcStatus
            url={url}
            name={name}
            timestamp={timestamp}
            blockNumber={blockNumber}
            ping={ping}
          />
        )}
      </Box>
      <Flex
        color={getToken("text.medium")}
        gap={4}
        justify="end"
        align="center"
      >
        <Text display={["none", "block"]}>{new URL(url).hostname}</Text>
        {isCustom && !!onRemove && (
          <>
            <RpcRemoveModal
              onRemove={() => onRemove(url)}
              trigger={
                <TextButton
                  sx={{ p: 4 }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Icon size={16} component={Trash} />
                </TextButton>
              }
            />
            <Tooltip text={t("edit")} asChild side="top">
              <TextButton
                sx={{ p: 4 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEdit(true)
                }}
              >
                <Icon size={16} component={Edit} />
              </TextButton>
            </Tooltip>
          </>
        )}
        {!!onClick && (
          <Box sx={{ ml: 8 }}>
            {isLoading ? (
              <Spinner size={14} />
            ) : (
              <SRpcRadio>{isActive && <SRpcRadioThumb />}</SRpcRadio>
            )}
          </Box>
        )}
      </Flex>
    </SRpcListItem>
  )
}

export const RpcListItemActive: React.FC<
  RpcListItemProps & Partial<PingResponse>
> = (props) => {
  const provider = useRpcProvider()
  const { data: bestNumber, isLoading } = useQuery(bestNumberQuery(provider))
  const { data: status } = useRpcStatus(!props?.ping ? provider.endpoint : "")

  return (
    <RpcListItemLayout
      {...props}
      ping={props?.ping ?? status?.ping}
      blockNumber={bestNumber?.parachainBlockNumber}
      timestamp={bestNumber?.timestamp}
      isLoading={!provider.isLoaded || isLoading}
    />
  )
}

export const RpcListItem: React.FC<RpcListItemProps> = (props) => {
  return props.isActive ? (
    <RpcListItemActive {...props} />
  ) : (
    <RpcListItemLayout {...props} />
  )
}
