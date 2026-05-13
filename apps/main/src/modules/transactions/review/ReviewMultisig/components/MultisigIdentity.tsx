import { AccountAvatar, Chip, Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/AccountIdentity/AccountIdentity"

type MultisigIdentityProps = {
  address: string
  isYou: boolean
}

export const MultisigIdentity: FC<MultisigIdentityProps> = ({
  address,
  isYou,
}) => {
  const { t } = useTranslation(["common"])
  return (
    <Flex gap="s" align="center">
      <AccountAvatar address={address} size={24} />
      <AccountIdentity fs="p5" fw={600} address={address} />
      {isYou && (
        <Chip size="small" variant="tertiary" ml="s">
          {t("you")}
        </Chip>
      )}
    </Flex>
  )
}
