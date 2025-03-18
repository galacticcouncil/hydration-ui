import { ArrowDown } from "lucide-react"
import { FC } from "react"

import { Button, ButtonProps } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Input } from "@/components/Input"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import { SAddressField } from "./AddressField.styled"

type Props = {
  readonly label: string
  readonly actionLabel: string
  readonly actionIcon?: ButtonProps["iconEnd"]
  readonly address: string
  readonly addressPlaceholder?: string
  readonly isError?: boolean
  readonly onAddressChange: (address: string) => void
}

export const AddressField: FC<Props> = ({
  label,
  actionLabel,
  actionIcon,
  address,
  addressPlaceholder,
  onAddressChange,
  isError,
}) => {
  return (
    <SAddressField>
      <Flex justify="space-between" align="center">
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
          {label}
        </Text>
        <Button
          variant="accent"
          outline
          size="small"
          iconEnd={actionIcon}
          sx={{ textTransform: "uppercase" }}
        >
          {actionLabel}
        </Button>
      </Flex>
      <Flex justify="space-between" align="center">
        <Input
          variant="embedded"
          containerSx={{ p: 0 }}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder={addressPlaceholder}
          isError={isError}
        />
        <Icon
          component={ArrowDown}
          size={18}
          color={getToken("icons.onContainer")}
        />
      </Flex>
    </SAddressField>
  )
}
