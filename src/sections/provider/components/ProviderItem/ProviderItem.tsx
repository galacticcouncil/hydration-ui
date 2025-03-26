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
import { PingResponse } from "utils/rpc"

export type ProviderItemProps = {
  name: string
  url: string
  isActive?: boolean
  custom?: boolean
  onClick?: (url: string) => void
  onRemove?: (id: string) => void
  className?: string
  isLoading?: boolean
} & Partial<PingResponse>

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
  isLoading,
}: ProviderItemProps & Partial<PingResponse>) => {
  const [isEdit, setIsEdit] = useState(false)

  if (isEdit)
    return (
      <ProviderItemEdit
        name={name}
        url={url}
        onCancel={() => setIsEdit(false)}
      />
    )

  return (
    <SItem
      isDisabled={isLoading}
      onClick={() => onClick?.(url)}
      className={className}
    >
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
            blockNumber={blockNumber}
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
          <div
            sx={{ flex: "row", align: "center", gap: 12 }}
            css={{ pointerEvents: "auto" }}
          >
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

export const ProviderItemActive: React.FC<
  ProviderItemProps & Partial<PingResponse>
> = (props) => {
  const { data: bestNumber, isLoading } = useBestNumber()

  return (
    <ProviderItemLayout
      {...props}
      isLoading={isLoading}
      blockNumber={bestNumber?.parachainBlockNumber?.toNumber()}
      timestamp={bestNumber?.timestamp?.toNumber()}
    />
  )
}

export const ProviderItem: React.FC<ProviderItemProps> = (props) => {
  return props.isActive ? (
    <ProviderItemActive {...props} />
  ) : (
    <ProviderItemLayout {...props} />
  )
}
