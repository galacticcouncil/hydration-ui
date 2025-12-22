import { AccountInput, Box, Label } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useId } from "react"
import { useTranslation } from "react-i18next"

export type RecipientCustomInputProps = {
  address: string
  setAddress: (address: string) => void
}

export const RecipientCustomInput: React.FC<RecipientCustomInputProps> = ({
  address,
  setAddress,
}) => {
  const { t } = useTranslation("xcm")
  const id = useId()
  return (
    <Box position="relative" py={20}>
      <Label
        htmlFor={id}
        fs="p5"
        color={getToken("text.medium")}
        pb={10}
        display="block"
      >
        {t("recipient.input.customWallet")}
      </Label>
      <AccountInput
        id={id}
        placeholder={t("recipient.input.placeholder")}
        value={address}
        onChange={setAddress}
        autoComplete="off"
      />
    </Box>
  )
}
