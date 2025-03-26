import { InterestRate } from "@aave/contract-helpers"
import { ReactNode } from "react"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { ERC20TokenType } from "sections/lending/libs/web3-data-provider/Web3Provider"

import { BaseSuccessView } from "./BaseSuccess"
import { Text } from "components/Typography/Text/Text"

export type SuccessTxViewProps = {
  txHash?: string
  action?: ReactNode
  amount?: string
  symbol?: string
  collateral?: boolean
  rate?: InterestRate
  addToken?: ERC20TokenType
  customAction?: ReactNode
  customText?: ReactNode
}

export const TxSuccessView = ({
  txHash,
  action,
  amount,
  symbol,
  collateral,
  rate,
  addToken,
  customAction,
  customText,
}: SuccessTxViewProps) => {
  return (
    <BaseSuccessView txHash={txHash}>
      <div
        sx={{
          mt: 2,
          flex: "column",
          align: "center",
          justify: "center",
          textAlign: "center",
        }}
      >
        {action && amount && symbol && (
          <Text>
            You {action} <FormattedNumber value={Number(amount)} compact />{" "}
            {symbol}
          </Text>
        )}

        {customAction && (
          <Text>
            {customText}
            {customAction}
          </Text>
        )}

        {!action && !amount && symbol && (
          <Text>
            Your {symbol} {collateral ? "now" : "is not"} used as collateral
          </Text>
        )}

        {rate && (
          <Text>
            You switched to{" "}
            {rate === InterestRate.Variable ? "variable" : "stable"} rate
          </Text>
        )}

        {addToken && symbol && (
          <div
            sx={{
              flex: "column",
              gap: 8,
              mt: 24,
              align: "center",
              justify: "center",
              textAlign: "center",
            }}
          >
            <TokenIcon
              address={addToken.address}
              size={32}
              sx={{ mt: 12, mb: 8 }}
            />
          </div>
        )}
      </div>
    </BaseSuccessView>
  )
}
