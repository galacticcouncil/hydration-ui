import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Text } from "components/Typography/Text/Text"
import { SBankBox } from "./BankTransferBox.styled"

type BankTransferBoxProps = {
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
    <SBankBox href={href} rel="noreferrer" target="_blank">
      <div>
        <img src={icon} height={16} alt="Banxa" sx={{ mb: 10 }} />
        <Text fs={14} color="basic400">
          {description}
        </Text>
      </div>
      <Text
        fs={[16, 14]}
        sx={{ flex: "row", align: "center" }}
        css={{ whiteSpace: "nowrap" }}
        color="brightBlue300"
      >
        {cta} <ChevronRight />
      </Text>
    </SBankBox>
  )
}
