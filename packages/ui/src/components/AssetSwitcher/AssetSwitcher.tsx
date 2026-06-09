import { ArrowDown } from "lucide-react"

import {
  SAssetSwitcher,
  SSwitchContainer,
  SValueContainer,
} from "@/components/AssetSwitcher/AssetSwitcher.styled"
import { FlexProps } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Separator } from "@/components/Separator"
import { Skeleton } from "@/components/Skeleton"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

type AssetSwitcherProps = Omit<FlexProps, "children"> & {
  value?: string
  isLoading?: boolean
  icon?: React.ComponentType
  onSwitchClick?: () => void
  onValueClick?: () => void
  switchDisabled?: boolean
  valueDisabled?: boolean
}

export const AssetSwitcher: React.FC<AssetSwitcherProps> = ({
  value,
  isLoading = false,
  icon: IconComponent = ArrowDown,
  onSwitchClick,
  onValueClick,
  switchDisabled = false,
  valueDisabled = false,
  ...props
}) => {
  return (
    <SAssetSwitcher {...props}>
      <Separator />
      <SSwitchContainer
        onClick={onSwitchClick}
        disabled={!onSwitchClick || switchDisabled || isLoading}
      >
        <Icon
          size="m"
          component={IconComponent}
          color={getToken("icons.primary")}
        />
      </SSwitchContainer>
      <>
        <Separator />
        <SValueContainer
          onClick={onValueClick}
          disabled={valueDisabled || isLoading}
        >
          <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
            {isLoading && <Skeleton width={120} />}
            {!isLoading && value}
          </Text>
        </SValueContainer>
      </>
      <Separator />
    </SAssetSwitcher>
  )
}
