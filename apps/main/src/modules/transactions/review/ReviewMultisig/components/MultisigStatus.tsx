import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { CheckCircleIcon, ClockIcon } from "lucide-react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type MultisigStatusProps = {
  approved: boolean
}

export const MultisigStatus: FC<MultisigStatusProps> = ({ approved }) => {
  const { t } = useTranslation()

  return (
    <Flex asChild gap="s">
      <Text
        fs="p5"
        fw={500}
        sx={{
          color: approved
            ? getToken("accents.success.emphasis")
            : getToken("text.tint.quart"),
        }}
      >
        <Icon component={approved ? CheckCircleIcon : ClockIcon} size="s" />
        {approved ? t("multisig.modal.approved") : t("multisig.modal.waiting")}
      </Text>
    </Flex>
  )
}
