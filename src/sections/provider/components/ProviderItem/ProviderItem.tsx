import { SCircle, SCircleThumb, SItem } from "./ProviderItem.styled"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Icon } from "components/Icon/Icon"
import IconRemove from "assets/icons/IconRemove.svg?react"
import IconEdit from "assets/icons/IconEdit.svg?react"
import { useBestNumber } from "api/chain"
import { ProviderStatus } from "sections/provider/ProviderStatus"
import { useState } from "react"
import { ProviderItemEdit } from "sections/provider/components/ProviderItemEdit/ProviderItemEdit"
import { Spinner } from "components/Spinner/Spinner"
import { RpcInfoResult } from "utils/rpc"
import { useRpcInfo } from "api/rpc"
import { PARACHAIN_BLOCK_TIME } from "utils/constants"

type ProviderItemProps = {
  name: string
  url: string
  isActive?: boolean
  custom?: boolean
  onClick?: (url: string) => void
  onRemove?: (id: string) => void
  className?: string
  ping?: number | null
} & Partial<RpcInfoResult>

export const ProviderItemLayout = ({
  name,
  url,
  isActive,
  custom,
  onClick,
  onRemove,
  className,
  timestamp,
  blockNumber,
  ping,
}: ProviderItemProps & Partial<RpcInfoResult>) => {
  const [isEdit, setIsEdit] = useState(false)

  if (isEdit)
    return (
      <ProviderItemEdit
        name={name}
        url={url}
        onCancel={() => setIsEdit(false)}
      />
    )

  const isLoading =
    typeof blockNumber === "undefined" ||
    typeof timestamp === "undefined" ||
    typeof ping === "undefined"

  return (
    <SItem onClick={() => onClick?.(url)} className={className}>
      <div>
        <Text
          color={isActive ? "pink600" : "white"}
          css={{
            gridArea: "name",
            transition: `all ${theme.transitions.default}`,
          }}
        >
          {name}
        </Text>
      </div>
      <div sx={{ flex: "row", align: "center", height: 30 }}>
        {isLoading ? (
          <Spinner size={14} />
        ) : (
          <ProviderStatus
            timestamp={timestamp}
            parachainBlockNumber={blockNumber}
            className={className}
            side="left"
            ping={ping}
          />
        )}
      </div>

      <div
        css={{ gridArea: "url" }}
        sx={{
          textAlign: "right",
          flex: "row",
          align: "center",
          justify: "flex-end",
          gap: 16,
        }}
      >
        <Text
          fs={14}
          fw={500}
          tAlign="right"
          color={isActive ? "pink600" : "basic600"}
          css={{ transition: `all ${theme.transitions.default}` }}
        >
          {new URL(url).host}
        </Text>

        {custom && (
          <div sx={{ flex: "row", align: "center", gap: 12 }}>
            <InfoTooltip text="Remove" type="black">
              <Icon
                icon={<IconRemove />}
                sx={{ color: "basic700" }}
                css={{ "&:hover": { opacity: 0.7 } }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRemove?.(url)
                }}
              />
            </InfoTooltip>
            <InfoTooltip text="Edit" type="black">
              <Icon
                icon={<IconEdit />}
                sx={{ color: "basic700" }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsEdit(true)
                }}
              />
            </InfoTooltip>
          </div>
        )}
        <SCircle>{isActive && <SCircleThumb />}</SCircle>
      </div>
    </SItem>
  )
}

const ProviderItemActive: React.FC<
  ProviderItemProps & Partial<RpcInfoResult> & { ping?: number | null }
> = (props) => {
  const { data: bestNumber } = useBestNumber()

  return (
    <ProviderItemLayout
      {...props}
      blockNumber={bestNumber?.parachainBlockNumber?.toNumber()}
      timestamp={bestNumber?.timestamp?.toNumber()}
    />
  )
}

const PARACHAIN_BLOCK_TIME_MS = PARACHAIN_BLOCK_TIME.times(1000).toNumber()

export const ProviderItem: React.FC<ProviderItemProps> = (props) => {
  const { data: status } = useRpcInfo(props.url, {
    refetchInterval: PARACHAIN_BLOCK_TIME_MS / 2,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
  })

  return props.isActive ? (
    <ProviderItemActive {...props} {...status} />
  ) : (
    <ProviderItemLayout {...props} {...status} />
  )
}
