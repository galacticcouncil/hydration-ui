import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import ChevronDownSmallIcon from "assets/icons/ChevronDownSmall.svg?react"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { FC, Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import { isEvmAccount } from "utils/evm"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import {
  SContainer,
  SExpandButton,
  SRawCallData,
  SShowMoreButton,
} from "./ReviewTransactionData.styled"
import { useMeasure } from "react-use"
import { Separator } from "components/Separator/Separator"

const MAX_DECODED_HEIGHT = 130

type Props = {
  address?: string
  tx?: SubmittableExtrinsic
}

export const ReviewTransactionData: FC<Props> = ({ tx, address }) => {
  const { t } = useTranslation()

  const [ref, { height }] = useMeasure<HTMLDivElement>()

  const [encodedExpanded, setEncodedExpanded] = useState(true)
  const [decodedExpanded, setDecodedExpanded] = useState(true)

  const [decodedFullyExpanded, setDecodedFullyExpanded] = useState(false)

  const allowDecodedFullExpand =
    !decodedFullyExpanded && height > MAX_DECODED_HEIGHT

  if (!tx) return null

  const json = getTransactionJSON(tx)
  const isEVM = isEvmAccount(address)

  if (!json) return null

  if (!isEVM) return <TransactionCode name={json.method} src={json.args} />

  return (
    <SContainer>
      <div>
        <SExpandButton
          onClick={() => setDecodedExpanded((prev) => !prev)}
          expanded={decodedExpanded}
        >
          <ChevronDownSmallIcon />
          {t("liquidity.reviewTransaction.calldata.decoded")}
        </SExpandButton>
        {decodedExpanded && (
          <div
            sx={{
              mt: 10,
              pl: 16,
            }}
            css={{
              position: "relative",
              height: allowDecodedFullExpand ? MAX_DECODED_HEIGHT : "auto",
              overflow: "hidden",
            }}
          >
            <TransactionCode ref={ref} name={json.method} src={json.args} />
            {allowDecodedFullExpand && (
              <SShowMoreButton
                onClick={() => setDecodedFullyExpanded(true)}
                css={{
                  position: "absolute",
                  bottom: 0,
                }}
              >
                Show more <ChevronDown width={16} height={16} />
              </SShowMoreButton>
            )}
          </div>
        )}
      </div>
      <Separator sx={{ my: 12 }} />
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
    </SContainer>
  )
}

function splitHex(hex: string) {
  if (typeof hex !== "string") return []

  return hex.replace("0x", "").split(/(0{3,})/g)
}
