import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { Edit, Save, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonTransparent,
  Flex,
  Icon,
  Input,
  Spinner,
  Text,
  TextButton,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FormEvent, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useClickAway, useMount } from "react-use"
import { isNumber } from "remeda"

import { useBestNumber } from "@/api/chain"
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

type SquidListItemEditProps = Pick<SquidListItemProps, "url" | "name"> & {
  onCancel: () => void
}

const SquidListItemEdit: React.FC<SquidListItemEditProps> = ({
  name,
  url,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [customName, setCustomName] = useState(name)
  const [error, setError] = useState("")
  const { renameSquid } = useSquidListStore()

  const formRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useClickAway(formRef, () => onCancel())

  useMount(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newName = customName.trim()
    if (!newName) {
      setError(t("error.required"))
      return
    }
    renameSquid(url, newName)
    onCancel()
  }

  const setName = (name: string) => {
    setCustomName(name)
    setError("")
  }

  return (
    <SSquidListItem
      as="form"
      data-edit="true"
      ref={formRef}
      onSubmit={onSubmit}
    >
      <Input
        variant="embedded"
        sx={{ px: 0, fontSize: 16, fontWeight: 400 }}
        value={customName}
        onChange={(e) => setName(e.target.value)}
        ref={inputRef}
      />
      {error && (
        <Text
          fs={12}
          color={getToken("accents.danger.secondary")}
          sx={{ position: "absolute", pointerEvents: "none" }}
        >
          {error}
        </Text>
      )}
      <Flex
        align="center"
        justify="end"
        gap={12}
        color={getToken("text.medium")}
      >
        <ButtonTransparent
          type="submit"
          sx={{ lineHeight: 1, color: getToken("text.tint.primary"), gap: 8 }}
        >
          {t("save")}
          <Icon size={16} component={Save} />
        </ButtonTransparent>
      </Flex>
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

  if (isEdit) {
    return (
      <SquidListItemEdit
        url={url}
        name={name}
        onCancel={() => setIsEdit(false)}
      />
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
        gap={4}
        justify="center"
        align="center"
        display={["none", "flex"]}
      >
        {isLoading ? (
          <Spinner size={14} />
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
        gap={4}
        justify="end"
        align="center"
      >
        {isNumber(blockHeightDifference) && (
          <Text
            fs={12}
            align="right"
            color={
              blockHeightDifference < 50
                ? getToken("accents.success.emphasis")
                : getToken("accents.danger.emphasis")
            }
          >
            {t("rpc.status.blockHeightDiff", {
              value: blockHeightDifference,
            })}
          </Text>
        )}
        {isCustom && !!onRemove && (
          <>
            <Tooltip text={t("remove")} asChild side="top">
              <TextButton
                sx={{ p: 4 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(url)
                }}
              >
                <Icon size={16} component={Trash} />
              </TextButton>
            </Tooltip>
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
            <SRpcRadio>{isActive && <SRpcRadioThumb />}</SRpcRadio>
          </Box>
        )}
      </Flex>
    </SSquidListItem>
  )
}
