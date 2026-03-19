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
  Stack,
  Text,
  TextButton,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { ListItemEditForm } from "@/components/DataProviderSelect/components/ListItemEditForm"
import {
  SRpcRadio,
  SRpcRadioThumb,
} from "@/components/DataProviderSelect/components/rpc/RpcListItem.styled"
import { useBlockHeightStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { useSquidListStore } from "@/states/provider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

import { SSquidIndexerListItem } from "./SquidIndexerListItem.styled"

export type SquidIndexerListItemProps = {
  name: string
  url: string
  isActive?: boolean
  isCustom?: boolean
  onClick?: (url: string) => void
  onRemove?: (url: string) => void
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
  isActive,
  isCustom,
  onClick,
  onRemove,
}) => {
  const { t } = useTranslation()
  const [isEdit, setIsEdit] = useState(false)

  const squidSdk = getSquidSdk(url)

  const {
    data: blockHeight,
    isLoading: isBlockHeightLoading,
    isError: isBlockHeightError,
  } = useQuery(latestBlockHeightQuery(squidSdk, url, PARACHAIN_BLOCK_TIME / 2))

  const { blockDiffText, statusText, color } = useBlockHeightStatus(
    blockHeight ?? null,
  )

  const { renameSquid } = useSquidListStore()

  if (isEdit) {
    return (
      <SSquidIndexerListItem data-edit="true">
        <ListItemEditForm
          name={name}
          onClose={() => setIsEdit(false)}
          onSubmit={(newName) => renameSquid(url, newName)}
        />
      </SSquidIndexerListItem>
    )
  }

  return (
    <SSquidIndexerListItem
      blocked={isBlockHeightLoading || isBlockHeightError}
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
      <Flex
        color={getToken("text.medium")}
        gap="s"
        justify="end"
        align="center"
      >
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
    </SSquidIndexerListItem>
  )
}
