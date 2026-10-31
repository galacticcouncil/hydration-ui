import {
  AssetInput,
  AssetInputProps,
  Box,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SBankFiatAmountInput } from "./BankAmountInput.styled"

type BankAmountInputProps = AssetInputProps & {
  isFirstSection?: boolean
  isFiat?: boolean
}

export const BankAmountInput: FC<BankAmountInputProps> = ({
  isFirstSection = false,
  isFiat = false,
  ...props
}) => (
  <Box
    mx={["-l", "-xl"]}
    mt={isFirstSection ? ["-l", "-xl"] : undefined}
    data-bank-amount-section
  >
    {!isFirstSection && <Separator />}
    <Box px={["l", "xl"]} py="l">
      {isFiat ? <SBankFiatAmountInput {...props} /> : <AssetInput {...props} />}
    </Box>
    <Separator />
  </Box>
)
