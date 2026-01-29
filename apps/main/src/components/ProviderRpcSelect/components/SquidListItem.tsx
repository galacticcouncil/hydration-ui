import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
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
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { ListItemEditForm } from "@/components/ProviderRpcSelect/components/ListItemEditForm"
import { useBlockHeightStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { useSquidListStore } from "@/states/provider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

import { SRpcRadio, SRpcRadioThumb } from "./RpcListItem.styled"
import { SSquidListItem } from "./SquidListItem.styled"

export type SquidListItemProps = {
  name: string
  url: string
  isActive?: boolean
  isCustom?: boolean
  onClick?: (url: string) => void
  onRemove?: (url: string) => void
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
  isCustom,
  onClick,
  onRemove,
}) => {
  const { t } = useTranslation()
  const [isEdit, setIsEdit] = useState(false)

  const squidSdk = getSquidSdk(url)

  const { data: blockHeight, isLoading: isBlockHeightLoading } = useQuery(
    latestBlockHeightQuery(squidSdk, url, PARACHAIN_BLOCK_TIME / 2),
  )

  const isLoading = isBlockHeightLoading

  const status = useBlockHeightStatus(blockHeight ?? 0)

  const { renameSquid } = useSquidListStore()

  if (isEdit) {
    return (
      <SSquidListItem data-edit="true">
        <ListItemEditForm
          name={name}
          onClose={() => setIsEdit(false)}
          onSubmit={(newName) => renameSquid(url, newName)}
        />
      </SSquidListItem>
    )
  }

  return (
    <SSquidListItem
      data-loading={isLoading}
      onClick={() => onClick?.(url)}
      isInteractive={!!onClick || !!onRemove}
    >
      <Box>
        <Text
          fs="p3"
          color={getToken(isActive ? "colors.coral.700" : "text.high")}
        >
          {name}
        </Text>
      </Box>
      <Flex
        color={getToken("text.medium")}
        gap="s"
        justify="center"
        align="center"
        display={["none", "flex"]}
      >
        {isLoading ? (
          <Spinner size="xs" />
        ) : (
          <Text fs="p5" fw={600} color={getToken("text.high")} align="right">
            {t("number", {
              value: blockHeight,
            })}
          </Text>
        )}
      </Flex>
      <Flex
        color={getToken("text.medium")}
        gap="s"
        justify="end"
        align="center"
      >
        <Text fs="p5" align="right" color={getToken(status.color)}>
          {status.text}
        </Text>
        {isCustom && !!onRemove && (
          <>
            <Tooltip text={t("remove")} asChild side="top">
              <TextButton
                sx={{ p: "xs" }}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(url)
                }}
              >
                <Icon size="s" component={Trash} />
              </TextButton>
            </Tooltip>
            <Tooltip text={t("edit")} asChild side="top">
              <TextButton
                sx={{ p: "xs" }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEdit(true)
                }}
              >
                <Icon size="s" component={Edit} />
              </TextButton>
            </Tooltip>
          </>
        )}
        {!!onClick && (
          <Box sx={{ ml: "base" }}>
            <SRpcRadio>{isActive && <SRpcRadioThumb />}</SRpcRadio>
          </Box>
        )}
      </Flex>
    </SSquidListItem>
  )
}
