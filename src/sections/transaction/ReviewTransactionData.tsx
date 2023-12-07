import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import ChevronDownSmallIcon from "assets/icons/ChevronDownSmall.svg?react"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { FC, Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import { isEvmAccount } from "utils/evm"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import {
  SContainer,
  SExpandButton,
  SRawCallData,
} from "./ReviewTransactionData.styled"

type Props = {
  address?: string
  tx?: SubmittableExtrinsic
}

export const ReviewTransactionData: FC<Props> = ({ tx, address }) => {
  const { t } = useTranslation()

  const [encodedExpanded, setEncodedExpanded] = useState(true)
  const [decodedExpanded, setDecodedExpanded] = useState(true)

  if (!tx) return null

  const json = getTransactionJSON(tx)
  const isEVM = isEvmAccount(address)

  if (!json) return null

  if (!isEVM) return <TransactionCode name={json.method} src={json.args} />

  return (
    <SContainer>
      {isEVM && (
        <div>
          <SExpandButton
            onClick={() => setEncodedExpanded((prev) => !prev)}
            expanded={encodedExpanded}
          >
            <ChevronDownSmallIcon />
            {t("liquidity.reviewTransaction.calldata.encoded")}
          </SExpandButton>
          {encodedExpanded && (
            <SRawCallData>
              <span>0x</span>
              {splitHex(tx.method.toHex()).map((str, index) => (
                <Fragment key={index}>
                  {str.startsWith("0") ? <>{str}</> : <span>{str}</span>}
                </Fragment>
              ))}
            </SRawCallData>
          )}
        </div>
      )}
      <div>
        <SExpandButton
          onClick={() => setDecodedExpanded((prev) => !prev)}
          expanded={decodedExpanded}
        >
          <ChevronDownSmallIcon />
          {t("liquidity.reviewTransaction.calldata.decoded")}
        </SExpandButton>
        {decodedExpanded && (
          <div sx={{ mt: 10, pl: 16 }}>
            <TransactionCode name={json.method} src={json.args} />
          </div>
        )}
      </div>
    </SContainer>
  )
}

function splitHex(hex: string) {
  if (typeof hex !== "string") return []

  return hex.replace("0x", "").split(/(0{3,})/g)
}
