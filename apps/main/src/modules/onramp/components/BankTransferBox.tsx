import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  ExternalLink,
  Flex,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export type BankTransferBoxProps = {
  href: string
  description: string
  cta: string
  icon: string
}

export const BankTransferBox: React.FC<BankTransferBoxProps> = ({
  href,
  description,
  cta,
  icon,
}) => {
  return (
    <ExternalLink href={href}>
      <Stack gap={10}>
        <img src={icon} height={16} alt="Bank Logo" />
        <Text fs={14} color={getToken("text.low")}>
          {description}
        </Text>
      </Stack>
      <Flex align="center" gap={8}>
        <Text
          fs={14}
          color={getToken("text.tint.secondary")}
          css={{ whiteSpace: "nowrap" }}
        >
          {cta}
        </Text>
        <Icon
          size={16}
          component={ArrowRight}
          color={getToken("text.tint.secondary")}
        />
      </Flex>
    </ExternalLink>
  )
}
