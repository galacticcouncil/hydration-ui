import { ArrowDown } from "lucide-react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { IdenticonEmpty } from "@/assets/icons"
import { Button, ButtonProps } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Input } from "@/components/Input"
import { Text } from "@/components/Text"
import { getToken, getTokenPx } from "@/utils"

import { SAddressField } from "./AddressField.styled"

export type AddressFieldProps = {
  readonly actionIcon?: ButtonProps["iconEnd"]
  readonly address: string
  readonly isError?: boolean
  readonly onAddressChange: (address: string) => void
}

export const AddressField: FC<AddressFieldProps> = ({
  actionIcon,
  address,
  onAddressChange,
  isError,
}) => {
  const { t } = useTranslation()

  return (
    <SAddressField>
      <Flex justify="space-between" align="center">
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
          {t("addressField.label")}
        </Text>
        <Button
          variant="accent"
          outline
          size="small"
          iconEnd={actionIcon}
          sx={{ textTransform: "uppercase" }}
        >
          {t("addressField.myContacts")}
        </Button>
      </Flex>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
          <IdenticonEmpty />
          <Input
            variant="embedded"
            sx={{ p: 0 }}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t("addressField.placeholder")}
            isError={isError}
          />
        </Flex>
        <Icon
          component={ArrowDown}
          size={18}
          color={getToken("icons.onContainer")}
        />
      </Flex>
    </SAddressField>
  )
}
